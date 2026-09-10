/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero.
 * Base block: hero
 * Source: https://wknd.site/ca/en/faqs.html (also us/en/faqs.html)
 * Generated: 2026-09-10
 *
 * Library convention (da): 1 column, 3 rows. First row is the block name.
 *   Row 2: Background Image (optional) — single cell.
 *   Row 3: Title / Subheading / CTA (optional) — single cell.
 * Target block (blocks/hero/hero.js): finds the media cell (the one holding a
 *   picture) → .hero-image, and any remaining heading/copy cell → .hero-content.
 *
 * Source structure: the matched element is `.title.cmp-title--underline`
 *   (`div.cmp-title > h1.cmp-title__text` = "FAQs"). The banner image lives in a
 *   sibling `.image` div (`.cmp-image > img`) within the same aem-Grid, so the
 *   image is pulled from the parent grid, not from `element` itself.
 */
export default function parse(element, { document }) {
  // Title — the FAQs heading inside the matched title block.
  const heading = element.querySelector('.cmp-title__text, h1, h2, h3');

  // Banner image — sibling `.image` cell in the same grid (not inside `element`).
  const scope = element.parentElement || element;
  const img = scope.querySelector('.image img, .cmp-image img, picture img, img');

  const cells = [];

  // Row 2: background image (only if present).
  if (img) {
    cells.push([img]);
  }

  // Row 3: heading/copy content in a single cell.
  const contentCell = [];
  if (heading) {
    contentCell.push(heading);
  }
  if (contentCell.length) {
    cells.push([contentCell]);
  }

  // Empty-block guard: nothing meaningful to emit.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
