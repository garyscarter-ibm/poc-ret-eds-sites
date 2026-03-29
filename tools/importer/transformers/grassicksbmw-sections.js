/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: grassicksbmw sections.
 * Adds section breaks (<hr>) and section-metadata blocks from template sections.
 * Selectors from captured DOM of https://www.grassicksbmw.co.uk/
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const document = element.ownerDocument;
    const sections = payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to preserve DOM positions
    const reversedSections = [...sections].reverse();

    reversedSections.forEach((section, reverseIndex) => {
      const isFirst = reverseIndex === sections.length - 1;
      const selector = section.selector;
      if (!selector) return;

      // Find the section element - try single selector or array of selectors
      let sectionEl = null;
      if (Array.isArray(selector)) {
        for (const sel of selector) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
      } else {
        sectionEl = element.querySelector(selector);
      }

      if (!sectionEl) return;

      // Add section-metadata block after the section element if it has a style
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(metaBlock);
      }

      // Add <hr> before this section (except the first section)
      if (!isFirst) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    });
  }
}
