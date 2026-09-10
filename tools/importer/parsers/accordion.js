/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion.
 * Base block: accordion
 * Source: https://wknd.site/ca/en/faqs.html (also us/en/faqs.html)
 * Generated: 2026-09-10
 *
 * Library convention (da): 2 columns, multiple rows. First row is the block name.
 *   Each subsequent row is one accordion item: [ Title (label) | Content (body) ].
 * Target block (blocks/accordion/accordion.js): row.children[0] → <summary> label,
 *   row.children[1] → body; wrapped in <details>.
 *
 * Source structure: `.cmp-accordion > .cmp-accordion__item`, each item has
 *   h3.cmp-accordion__header > button > span.cmp-accordion__title (the question)
 *   and .cmp-accordion__panel > ... > .cmp-text (the answer body). There are 7 items.
 */
export default function parse(element, { document }) {
  const cells = [];

  const items = element.querySelectorAll('.cmp-accordion__item');

  items.forEach((item) => {
    // Title/label cell — the question text.
    const titleEl = item.querySelector('.cmp-accordion__title, .cmp-accordion__header, button');
    const label = titleEl ? titleEl.textContent.trim() : '';

    // Content/body cell — the answer. Prefer the rich-text container so headings,
    // formatting and multiple paragraphs are preserved.
    const body = item.querySelector('.cmp-accordion__panel .cmp-text, .cmp-accordion__panel .text, .cmp-accordion__panel');

    if (label || body) {
      cells.push([label || '', body || '']);
    }
  });

  // Empty-block guard: no accordion items found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
