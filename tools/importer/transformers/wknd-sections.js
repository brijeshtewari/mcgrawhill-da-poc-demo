/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND section breaks and section metadata.
 * Inserts <hr> section breaks before each non-first section and a
 * Section Metadata block for each section that declares a style.
 *
 * Section boundary selectors come from tools/importer/page-templates.json
 * (DOM-verified during page analysis). page-templates stores each selector as
 * an array, so we normalize to the first entry.
 *
 * Breaks are inserted in beforeTransform (while every section element still
 * exists, before block parsers can replace them); metadata is inserted in
 * afterTransform, anchored to a marker <hr> so it survives parser replacement.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

function sectionSelector(section) {
  return Array.isArray(section.selector) ? section.selector[0] : section.selector;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sectionEl = element.querySelector(sectionSelector(section));
      if (!sectionEl) continue; // selector didn't match — skip, never guess a replacement

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section, no marker) the original element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(sectionSelector(section));
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
