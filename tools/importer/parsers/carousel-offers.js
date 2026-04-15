/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-offers (highlight offers).
 * Source: bmw-motorrad.co.uk hl-offers slider
 * Extracts: offer cards with image, badge, model name, offer text, CTA
 */
export default function parse(element, { document }) {
  // Find offer items (from captured DOM: onecolumnteaser items in the slider)
  const items = element.querySelectorAll('.onecolumnteaser, .hl-offers__slide, [class*="onecolumnteaser"]');
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('img');
    const badge = item.querySelector('.onecolumnteaser__info--label, [class*="label"]');
    const modelName = item.querySelector('.onecolumnteaser__info--headline, h3, h4');
    const offerText = item.querySelector('.onecolumnteaser__info--subline, .onecolumnteaser__info--copy, p');
    const cta = item.querySelector('a, button');

    const row = [];

    // Column 1: image
    if (img) {
      row.push(img);
    }

    // Column 2: offer info
    const textContent = [];
    if (badge) {
      const p = document.createElement('p');
      p.textContent = badge.textContent.trim();
      textContent.push(p);
    }
    if (modelName) {
      const h5 = document.createElement('h5');
      h5.textContent = modelName.textContent.trim();
      textContent.push(h5);
    }
    if (offerText) {
      const p = document.createElement('p');
      p.textContent = offerText.textContent.trim();
      textContent.push(p);
    }
    if (cta && cta.href) {
      const link = document.createElement('a');
      link.href = cta.href;
      link.textContent = cta.querySelector('.mnm-button-label, span')?.textContent?.trim() || cta.textContent.trim();
      textContent.push(link);
    }

    if (textContent.length > 0) {
      row.push(textContent);
    }

    if (row.length > 0) {
      cells.push(row);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'carousel-offers',
    cells,
  });

  element.replaceWith(block);
}
