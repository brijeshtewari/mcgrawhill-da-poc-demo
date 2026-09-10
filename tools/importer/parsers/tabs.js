/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs.
 * Base block: tabs
 * Source: https://wknd.site/ca/en/adventures/bali-surf-camp.html (adventure-detail template)
 * Generated: 2026-09-10
 *
 * Library convention (da): 2 columns, multiple rows. First row is the block name.
 *   Each subsequent row is one tab: [ Tab Label (mandatory) | Tab Content (mandatory) ].
 * Target block (blocks/tabs/tabs.js): each row's first cell text becomes the tab
 *   button label; the row content becomes the tab panel.
 *
 * Source structure: .cmp-tabs > ol.cmp-tabs__tablist > li.cmp-tabs__tab (labels, e.g.
 *   Overview / Itinerary / What to Bring) and sibling .cmp-tabs__tabpanel content panels.
 *   Labels and panels are correlated by DOM order (nth tab label -> nth tabpanel).
 */
export default function parse(element, { document }) {
  const cells = [];

  // Tab labels, in order.
  const tabLabels = Array.from(
    element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab, .cmp-tabs__tab'),
  );
  // Tab content panels, in order (correlated by index to labels).
  const tabPanels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  tabLabels.forEach((labelEl, i) => {
    const label = labelEl.textContent.trim();
    const panel = tabPanels[i];

    // Prefer the rich content fragment body so headings, paragraphs, images and
    // lists are preserved; fall back to the panel itself.
    let content = '';
    if (panel) {
      content = panel.querySelector('.cmp-contentfragment__elements, .cmp-contentfragment, .contentfragment')
        || panel;
    }

    if (label || content) {
      cells.push([label || '', content || '']);
    }
  });

  // Empty-block guard: no tabs found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
