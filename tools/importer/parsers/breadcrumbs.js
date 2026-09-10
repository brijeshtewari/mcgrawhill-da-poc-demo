/* eslint-disable */
/* global WebImporter */
/**
 * Parser for breadcrumbs.
 * Base block: breadcrumbs
 * Source: https://wknd.site/ca/en/adventures/bali-surf-camp.html (adventure-detail template)
 * Generated: 2026-09-10
 *
 * Target block (blocks/breadcrumbs/breadcrumbs.js): the trail is built entirely at
 * runtime from window.location.pathname + og:title — the block table only needs to
 * mark the block's presence. So this parser emits a minimal single-row, single-cell
 * breadcrumbs block. The source crumb content (.cmp-breadcrumb__item) is intentionally
 * NOT carried over because it is regenerated client-side.
 *
 * Source structure: .cmp-breadcrumb > ol.cmp-breadcrumb__list > li.cmp-breadcrumb__item
 * (last item is .cmp-breadcrumb__item--active, the current page).
 */
export default function parse(element, { document }) {
  // Minimal block marker: one row, one cell. Content is derived client-side by decorate().
  const cells = [['']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumbs', cells });
  element.replaceWith(block);
}
