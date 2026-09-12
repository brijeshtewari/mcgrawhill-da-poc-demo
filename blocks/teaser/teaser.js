/**
 * Teaser block.
 * Two layouts, matching the WKND source:
 *  - featured: image on one side, a grey content panel on the other (has an
 *    eyebrow line such as "Featured Article" before the heading).
 *  - banner (default): full-width image with an overlaid content box.
 * The variant is detected from the content: an eyebrow paragraph (short text
 * with no link, before the heading) marks the "featured" layout.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [imageRow, titleRow, descriptionRow, ctaRow] = [...block.children];

  imageRow?.classList.add('teaser-image');

  const content = document.createElement('div');
  content.className = 'teaser-content';

  [titleRow, descriptionRow, ctaRow].forEach((row) => {
    if (!row) return;
    const cell = row.firstElementChild;
    if (cell) content.append(...cell.childNodes);
    row.remove();
  });

  // Eyebrow: a short paragraph that sits before the first heading (e.g.
  // "Featured Article"). Mark it and flag the block as the featured variant.
  const children = [...content.children];
  const headingIndex = children.findIndex((el) => /^H[1-6]$/.test(el.tagName));
  const firstEl = children[0];
  if (headingIndex > 0 && firstEl.tagName === 'P' && !firstEl.querySelector('a')) {
    firstEl.classList.add('teaser-eyebrow');
    block.classList.add('teaser-featured');
  }

  const cta = content.querySelector('a');
  if (cta) {
    // Teaser CTAs are yellow primary buttons in the WKND source.
    cta.classList.add('button', 'primary');
    cta.closest('p')?.classList.add('button-wrapper');
  }

  block.append(content);
}
