/* eslint-disable */
/* global WebImporter */
/**
 * Parser for teaser.
 * Base block: teaser (no library convention — structure derived from blocks/teaser/teaser.js)
 * Source: https://wknd.site/us/en.html
 * Generated: 2026-09-07
 *
 * Block decoration (blocks/teaser/teaser.js) reads 4 positional single-cell rows:
 *   Row 1: image
 *   Row 2: title (heading)
 *   Row 3: description
 *   Row 4: CTA link
 * This is a 1-column block; each row has exactly one cell.
 *
 * Source structure (.teaser.cmp-teaser--featured / .cmp-teaser--hero):
 *   .cmp-teaser__content > (p.cmp-teaser__pretitle?, h2.cmp-teaser__title,
 *     .cmp-teaser__description, .cmp-teaser__action-container a.cmp-teaser__action-link)
 *   .cmp-teaser__image img
 */
export default function parse(element, { document }) {
  const img = element.querySelector('.cmp-teaser__image img, .cmp-image img, img');
  const pretitle = element.querySelector('.cmp-teaser__pretitle');
  const title = element.querySelector('.cmp-teaser__title, h1, h2, h3');
  const description = element.querySelector('.cmp-teaser__description, p:not(.cmp-teaser__pretitle)');
  const cta = element.querySelector('.cmp-teaser__action-link, .cmp-teaser__action-container a, a.button');

  // Empty-block guard.
  if (!title && !description && !img) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 1: image.
  cells.push([img || '']);

  // Row 2: title (prepend optional pretitle into the same title cell).
  const titleCell = [];
  if (pretitle) titleCell.push(pretitle);
  if (title) titleCell.push(title);
  cells.push([titleCell.length ? titleCell : '']);

  // Row 3: description.
  cells.push([description || '']);

  // Row 4: CTA.
  cells.push([cta || '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'teaser', cells });
  element.replaceWith(block);
}
