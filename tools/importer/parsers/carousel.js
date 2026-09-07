/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel.
 * Base block: carousel
 * Source: https://wknd.site/us/en.html
 * Generated: 2026-09-07
 *
 * Library convention: 2 columns, multiple rows. First row is the block name.
 * Each subsequent row is one slide: [ image | text content (title, description, CTA) ].
 * Source structure: .cmp-carousel__item > .teaser.cmp-teaser--hero, each containing
 * .cmp-teaser__content (h2.cmp-teaser__title, .cmp-teaser__description, .cmp-teaser__action-link)
 * and .cmp-teaser__image img.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Each carousel item is one slide.
  const items = element.querySelectorAll('.cmp-carousel__item');
  const slides = items.length ? Array.from(items) : [element];

  slides.forEach((item) => {
    // Image (mandatory) - first cell.
    const img = item.querySelector('.cmp-teaser__image img, .cmp-image img, img');

    // Text content (optional) - second cell.
    const title = item.querySelector('.cmp-teaser__title, h1, h2, h3');
    const description = item.querySelector('.cmp-teaser__description, p');
    const cta = item.querySelector('.cmp-teaser__action-link, a.button, a');

    const contentCell = [];
    if (title) contentCell.push(title);
    if (description) contentCell.push(description);
    if (cta) contentCell.push(cta);

    // Only emit slides that have at least an image or some text content.
    if (img || contentCell.length) {
      cells.push([img || '', contentCell.length ? contentCell : '']);
    }
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
