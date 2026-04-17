/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Cotswold BMW section breaks and section-metadata.
 * Runs in afterTransform only. Uses payload.template.sections.
 * Selectors from captured DOM of cotswoldcheltenhambmw.co.uk/about-us/
 */
const H = { after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to avoid shifting DOM positions
    const reversedSections = [...sections].reverse();
    reversedSections.forEach((section) => {
      const selectorList = Array.isArray(section.selector)
        ? section.selector
        : [section.selector];

      let sectionEl = null;
      for (const sel of selectorList) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }
      if (!sectionEl) return;

      // Add section-metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Add section break (hr) before section if not the first section
      // and there is content before it
      if (section.id !== sections[0].id && sectionEl.previousElementSibling) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    });
  }
}
