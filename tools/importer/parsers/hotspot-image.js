/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hotspot-image
 * Pattern: Section with viewer-background image + multiple positioned hotspot links (a[href*=overlay])
 * Extracts background image and hotspot positions (as % coordinates)
 */
export default function parse(element, { document }) {
  // Get the background image
  const vb = element.querySelector('.viewer-background');
  let bgUrl = '';
  if (vb) {
    const style = window.getComputedStyle(vb);
    const match = style.backgroundImage && style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (match) bgUrl = match[1];
  }

  // Get hotspot overlay links with positions
  const overlayLinks = [...element.querySelectorAll('a[href*="overlay"]')];
  if (overlayLinks.length < 2) return;

  const secRect = element.getBoundingClientRect();
  const cells = [];

  // Row 1: background image
  if (bgUrl) {
    const img = document.createElement('img');
    img.src = bgUrl;
    img.alt = 'Vehicle highlights';
    cells.push([img]);
  }

  // Rows 2+: hotspot positions
  overlayLinks.forEach((a) => {
    const href = a.getAttribute('href') || '';
    // Extract label from overlay parameter (e.g., "?overlay=Alloy-Wheels" → "Alloy Wheels")
    const overlayMatch = href.match(/overlay=([^&]+)/);
    const label = overlayMatch
      ? overlayMatch[1].replace(/-/g, ' ')
      : 'Feature';

    // Get position as percentage of section
    const parentFig = a.closest('figure') || a.parentElement;
    const parentRect = parentFig ? parentFig.getBoundingClientRect() : a.getBoundingClientRect();
    const x = ((parentRect.left - secRect.left) / secRect.width * 100).toFixed(1);
    const y = ((parentRect.top - secRect.top) / secRect.height * 100).toFixed(1);

    const linkEl = document.createElement('a');
    linkEl.href = href;
    linkEl.textContent = label;

    cells.push([x, y, label, linkEl]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hotspot-image',
    cells,
  });
  element.replaceWith(block);
}
