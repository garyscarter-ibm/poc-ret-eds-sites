/* eslint-disable */
/* global WebImporter */

/**
 * Parser: stats
 * Pattern: Multiple h2+h4 pairs where h2 contains a metric value and h4 contains its label
 * Example: <h2>846-954mm</h2><h4>REAR LEGROOM</h4>
 *
 * Foleon DOM: h2/h4 elements may be nested in .im-column divs
 */
export default function parse(element, { document }) {
  // Search the entire section for h2 and h4 elements
  const allH2s = [...element.querySelectorAll('h2')];
  const allH4s = [...element.querySelectorAll('h4')];

  if (allH2s.length < 2 || allH4s.length < 2) return;

  // Pair h2s with h4s — they appear in sequence (h2 value, h4 label)
  const cells = [];
  for (let i = 0; i < allH2s.length && i < allH4s.length; i += 1) {
    const value = allH2s[i].textContent.trim();
    const label = allH4s[i].textContent.trim();
    if (value && label && /\d/.test(value)) {
      cells.push([value, label]);
    }
  }

  if (cells.length < 2) return;

  // Look for footnote — any paragraph after the last h4
  const allParas = [...element.querySelectorAll('p')];
  const footnote = allParas.find((p) => {
    const t = p.textContent.trim();
    return t.length > 10 && !p.querySelector('img') && !t.startsWith('IMG-');
  });
  if (footnote) {
    cells.push([footnote.textContent.trim()]);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'stats',
    cells,
  });
  element.replaceWith(block);
}
