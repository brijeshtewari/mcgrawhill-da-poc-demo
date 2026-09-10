/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import teaserParser from './parsers/teaser.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  teaser: teaserParser,
  cards: cardsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'adventure-listing',
  description: 'Listing page with a hero banner and a tabbed grid of linked items',
  urls: [
    'https://wknd.site/ca/en/adventures.html',
    'https://wknd.site/us/en/adventures.html',
  ],
  blocks: [
    {
      name: 'teaser',
      instances: ['.teaser.cmp-teaser--hero', '.teaser.cmp-teaser--featured'],
    },
    {
      name: 'cards',
      instances: ['.cmp-tabs__tabpanel--active .image-list.list'],
    },
  ],
  sections: [
    { id: 'logical-1', name: 'Hero', selector: ['.teaser.cmp-teaser--hero'], style: null, blocks: ['teaser'], defaultContent: [] },
    { id: 'logical-2', name: 'Current Adventures', selector: ['.cmp-layout-container--fixed', 'main.container.responsivegrid.cmp-layout-container--fixed'], style: null, blocks: ['cards'], defaultContent: ['.title.cmp-title--underline'] },
  ],
};

// TRANSFORMER REGISTRY - cleanup runs first, section transformer after
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return; // avoid double-processing across overlapping selectors
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 1b. Adventure-listing specific: the category filter tabs (All/Climbing/...)
    // are a filtered VIEW of the same adventures. Only the active "All" panel holds
    // the full 16-item grid; the other panels are duplicate subsets. Remove the
    // inactive panels and the tab list itself so only the "All" grid remains and
    // no duplicate adventure content leaks into the import as default content.
    document.querySelectorAll('.cmp-tabs__tabpanel:not(.cmp-tabs__tabpanel--active)')
      .forEach((panel) => panel.remove());
    document.querySelectorAll('.cmp-tabs__tablist')
      .forEach((tablist) => tablist.remove());

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
