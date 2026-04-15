/* eslint-disable */
/* global WebImporter */

/**
 * Parser for banner-terms (disclaimer/terms text).
 * Source: bmw-motorrad.co.uk .shortnote sections
 * Extracts: terms and conditions paragraphs
 */
export default function parse(element, { document }) {
  // Extract all paragraphs from the shortnote section
  const paragraphs = element.querySelectorAll('p, .shortnote__copy p, .mediacontent__copyContainer--copy p, sup, sub');
  const cells = [];

  paragraphs.forEach((p) => {
    const text = p.textContent.trim();
    if (text) {
      const para = document.createElement('p');
      para.textContent = text;
      cells.push([para]);
    }
  });

  // If no paragraphs found, try the whole text content
  if (cells.length === 0) {
    const text = element.textContent.trim();
    if (text) {
      const para = document.createElement('p');
      para.textContent = text;
      cells.push([para]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'banner-terms',
    cells,
  });

  element.replaceWith(block);
}
