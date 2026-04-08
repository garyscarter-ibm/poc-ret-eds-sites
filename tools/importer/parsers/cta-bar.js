/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cta-bar
 * Pattern: Section with multiple <a> links containing SVG icon images
 * Used for Build your BMW, New Car Locator, Test Drive, Offers buttons
 *
 * Foleon DOM: links are nested in .im-column divs
 */
export default function parse(element, { document }) {
  const iconLinks = [...element.querySelectorAll('a')].filter((a) => {
    const img = a.querySelector('img');
    const href = a.getAttribute('href') || '';
    return img && href && href.length > 5;
  });

  if (iconLinks.length < 2) return;

  const cells = [];
  iconLinks.forEach((link) => {
    const img = link.querySelector('img');
    const a = document.createElement('a');
    a.href = link.getAttribute('href') || link.href;
    const icon = document.createElement('img');
    icon.src = img.getAttribute('src') || img.src;
    icon.alt = img.alt || '';
    a.append(icon);
    cells.push([a]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cta-bar',
    cells,
  });
  element.replaceWith(block);
}
