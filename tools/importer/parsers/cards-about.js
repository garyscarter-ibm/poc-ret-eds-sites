/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-about (services grid).
 * Source: bmw-motorrad.co.uk productservice items
 * Extracts: service cards with image, title, description, optional CTA
 */
export default function parse(element, { document }) {
  // Find all service items (from captured DOM: li items in the services list)
  const items = element.querySelectorAll('.productservice__item, li');
  const cells = [];

  items.forEach((item) => {
    const img = item.querySelector('img');
    const heading = item.querySelector('h4, h3, .productservice__headline');
    const desc = item.querySelector('p, .productservice__copy');
    const cta = item.querySelector('button, a.c-button');

    const row = [];

    // Column 1: image
    if (img) {
      row.push(img);
    }

    // Column 2: text content (heading + description + optional CTA)
    const textContent = [];
    if (heading) {
      const h5 = document.createElement('h5');
      h5.textContent = heading.textContent.trim();
      textContent.push(h5);
    }
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      textContent.push(p);
    }
    if (cta && cta.textContent.trim()) {
      const link = document.createElement('a');
      link.href = cta.href || '#';
      link.textContent = cta.querySelector('.mnm-button-label')?.textContent?.trim() || cta.textContent.trim();
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
    name: 'cards-about',
    cells,
  });

  element.replaceWith(block);
}
