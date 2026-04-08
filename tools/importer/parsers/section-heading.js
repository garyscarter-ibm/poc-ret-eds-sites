/* eslint-disable */
/* global WebImporter */

/**
 * Parser: section-heading
 * Pattern: Subtitle <p> + two <h2> elements forming a split heading + optional body <p>
 * Matches content like: "INTRODUCING THE X7" + "THIS IS" + "FORWARDISM."
 *
 * Foleon DOM: eyebrow <p>, h2s, and body <p> are in separate wrapper divs
 * (not siblings), so we search the whole section.
 */
export default function parse(element, { document }) {
  const allH2s = [...element.querySelectorAll('h2')];
  if (allH2s.length < 2) return;

  const line1 = allH2s[0].textContent.trim();
  const line2 = allH2s[1].textContent.trim();

  // Find eyebrow: a short <p> that appears BEFORE the first h2 in DOM order
  // Search all <p> elements in the section
  let subtitle = '';
  const allPs = [...element.querySelectorAll('p')];
  for (const p of allPs) {
    const text = p.textContent.trim();
    // Eyebrow is short, uppercase, and appears before the h2 in DOM
    if (text.length > 3 && text.length < 60 && !p.querySelector('img')) {
      // Check if this p comes before the first h2 in DOM order
      const pPos = p.compareDocumentPosition(allH2s[0]);
      if (pPos & Node.DOCUMENT_POSITION_FOLLOWING) {
        subtitle = text;
        break;
      }
    }
  }

  // Find body paragraph: a longer <p> that appears AFTER the last h2 in DOM order
  let body = '';
  for (const p of allPs) {
    const text = p.textContent.trim();
    if (text.length > 30 && !p.querySelector('img') && !text.startsWith('IMG-')) {
      // Check if this p comes after the last h2
      const pPos = p.compareDocumentPosition(allH2s[allH2s.length - 1]);
      if (pPos & Node.DOCUMENT_POSITION_PRECEDING) {
        body = text;
        break;
      }
    }
  }

  const cells = [];

  // Row 1: Eyebrow/subtitle
  if (subtitle) cells.push([subtitle]);

  // Row 2: Heading line 1
  cells.push([line1]);

  // Row 3: Heading line 2
  cells.push([line2]);

  // Row 4: Optional body paragraph
  if (body) cells.push([body]);

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'section-heading',
    cells,
  });
  element.replaceWith(block);
}
