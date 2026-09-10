/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbsParser from './parsers/breadcrumbs.js';
import carouselParser from './parsers/carousel.js';
import tabsParser from './parsers/tabs.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  breadcrumbs: breadcrumbsParser,
  carousel: carouselParser,
  tabs: tabsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'adventure-detail',
  description: 'Detail page with breadcrumbs, an image carousel, and a tabbed information panel',
  urls: [
    'https://wknd.site/ca/en/adventures/bali-surf-camp.html',
  ],
  blocks: [
    {
      name: 'breadcrumbs',
      instances: ['.breadcrumb.cmp-breadcrumb--fixed', '.cmp-breadcrumb'],
    },
    {
      name: 'carousel',
      instances: ['.carousel.panelcontainer.cmp-carousel--mini', '.carousel.panelcontainer', '.cmp-carousel'],
    },
    {
      name: 'tabs',
      instances: ['.tabs.panelcontainer', '.cmp-tabs'],
    },
  ],
  sections: [
    { id: 'logical-1', name: 'breadcrumbs', selector: ['.breadcrumb.cmp-breadcrumb--fixed', '.cmp-breadcrumb'], style: null, blocks: ['breadcrumbs'], defaultContent: [] },
    { id: 'logical-2', name: 'carousel', selector: ['.carousel.panelcontainer.cmp-carousel--mini', '.carousel.panelcontainer'], style: null, blocks: ['carousel'], defaultContent: [] },
    { id: 'logical-3', name: 'adventure-detail-body', selector: ['.cmp-layout-container--fixed', 'main.container.responsivegrid.cmp-layout-container--fixed'], style: null, blocks: ['tabs'], defaultContent: ['.title.cmp-title--underline', '.contentfragment.cmp-contentfragment--elements'] },
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
