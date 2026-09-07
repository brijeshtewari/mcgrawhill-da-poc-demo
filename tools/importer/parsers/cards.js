/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards.
 * Base block: cards
 * Source: https://wknd.site/us/en.html
 * Generated: 2026-09-07
 *
 * Library convention: 2 columns, multiple rows. First row is the block name.
 * Each subsequent row is one card: [ image | text content (title, description, CTA) ].
 * Source structure: .cmp-image-list > li.cmp-image-list__item > article, each containing
 *   a.cmp-image-list__item-image-link > .cmp-image img
 *   a.cmp-image-list__item-title-link > span.cmp-image-list__item-title
 *   span.cmp-image-list__item-description
 */
export default function parse(element, { document }) {
  const cells = [];

  const items = element.querySelectorAll('.cmp-image-list__item, li');
  const cards = items.length ? Array.from(items) : [element];

  cards.forEach((item) => {
    // Image (mandatory) - first cell.
    const img = item.querySelector('.cmp-image-list__item-image img, .cmp-image img, img');

    // Title text and its link.
    const titleText = item.querySelector('.cmp-image-list__item-title, h1, h2, h3');
    const titleLink = item.querySelector('.cmp-image-list__item-title-link, a');
    const description = item.querySelector('.cmp-image-list__item-description, p');

    const contentCell = [];
    if (titleText) {
      // Preserve the title as a heading; wrap in the title link's href if present.
      const heading = document.createElement('h3');
      const href = titleLink ? titleLink.getAttribute('href') : null;
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = titleText.textContent.trim();
        heading.append(a);
      } else {
        heading.textContent = titleText.textContent.trim();
      }
      contentCell.push(heading);
    }
    if (description) {
      const p = document.createElement('p');
      p.textContent = description.textContent.trim();
      contentCell.push(p);
    }

    if (img || contentCell.length) {
      cells.push([img || '', contentCell.length ? contentCell : '']);
    }
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
