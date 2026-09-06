/**
 * loads and decorates the block
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

  const cta = content.querySelector('a');
  if (cta) {
    cta.classList.add('button');
    cta.closest('p')?.classList.add('button-wrapper');
  }

  block.append(content);
}
