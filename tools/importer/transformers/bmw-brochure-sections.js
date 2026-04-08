/* eslint-disable */
/* global WebImporter */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { document } = payload;
    const sections = payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    // Process sections in reverse order to avoid offset issues
    const reversedSections = [...sections].reverse();

    for (const section of reversedSections) {
      const selectorList = Array.isArray(section.selector) ? section.selector : [section.selector];
      let sectionEl = null;

      for (const sel of selectorList) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }

      if (!sectionEl) continue;

      // Add section-metadata block if section has a style
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(metaBlock);
      }

      // Add section break (hr) before this section if it's not the first
      // and there is content before it
      if (section !== reversedSections[reversedSections.length - 1]) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
