/*
 * Hero Block
 * Full-bleed banner: a large background image with heading/text content layered over it.
 * Variant options fold in structurally-identical hero treatments from the source site;
 * their visual differences (color, typography) are applied by the design pass.
 */

// Known option tokens folded onto this block. Branch only on these; ignore unknown tokens.
const OPTION_CLASSES = [
  'minimal-dark-withimg',
  'minimal-dark-withimg-1',
  'minimal-dark-withimg-3',
];

export default function decorate(block) {
  // Tolerate authors omitting/adding option tokens: collect only the ones we know about.
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  // Identify the media cell (the one containing the background image) and the text cell.
  const picture = block.querySelector('picture');
  const mediaWrapper = picture ? picture.closest('div') : null;

  if (mediaWrapper) {
    mediaWrapper.classList.add('hero-image');
  }

  // Any remaining top-level cells hold the heading/copy that sits over the image.
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell !== mediaWrapper && !cell.querySelector('picture')) {
        cell.classList.add('hero-content');
      }
    });
  });

  // Expose which folded variant is active for option-scoped styling (design pass hooks here).
  active.forEach((opt) => block.classList.add(`hero-${opt}`));
}
