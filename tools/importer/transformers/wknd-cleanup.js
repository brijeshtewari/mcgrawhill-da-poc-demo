/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 * Removes non-authorable site chrome and leftover artifacts so the import
 * contains only page-level authorable content.
 * All selectors verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Tracking/sync iframe and mobile nav overlays present in captured DOM
    // (cleaned.html lines 566, 568, 574). Removed before parsing so they
    // never interfere with block matching.
    WebImporter.DOMUtils.remove(element, [
      '#destination_publishing_iframe_wkndsite_0', // Adobe ID syncing iframe
      '#toggleNav', // mobile nav toggle button
      '#mobileNav', // mobile navigation overlay
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome (cleaned.html: header line 5, footer line 471).
    WebImporter.DOMUtils.remove(element, [
      'header.cmp-experiencefragment--header', // site header experience fragment
      'footer.cmp-experiencefragment--footer', // site footer experience fragment
      'iframe', // any remaining embeds
      'meta', // stray inline <meta> tags left inside cmp-image blocks (e.g. lines 183, 204)
      'noscript',
      'link',
    ]);

    // Strip AEM data-layer / tracking attributes from all remaining elements
    // (present throughout captured DOM, e.g. data-cmp-* on <body>).
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer');
      el.removeAttribute('data-cmp-hook-image');
      el.removeAttribute('onclick');
    });
  }
}
