/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [imageRow, titleRow, colorRow] = [...block.children];

  // optional 3rd row lets authors set a custom background color; the row
  // itself is presentational config, not content, so it is removed from the DOM
  const color = colorRow?.textContent.trim();
  colorRow?.remove();

  if (color) {
    block.style.setProperty('--banner-background-color', color);
  }

  imageRow?.classList.add('banner-image');
  titleRow?.classList.add('banner-content');
}
