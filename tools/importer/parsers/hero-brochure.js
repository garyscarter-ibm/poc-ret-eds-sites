/* eslint-disable */
/* global WebImporter */

/**
 * Parser: hero-brochure
 * Pattern: Section with .viewer-background CSS bg image + optional heading + optional CTA
 * Works across all Foleon brochure pages (pattern-matched, not ID-specific)
 */
export default function parse(element, { document }) {
  // Extract background image from viewer-background (high-res) or section itself (thumb)
  let bgUrl = '';
  const viewerBg = element.querySelector('.viewer-background');
  if (viewerBg) {
    const style = window.getComputedStyle(viewerBg);
    const match = style.backgroundImage && style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (match) bgUrl = match[1];
  }
  if (!bgUrl) {
    const style = window.getComputedStyle(element);
    const match = style.backgroundImage && style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (match) bgUrl = match[1];
  }

  // Extract heading (h2 or h3)
  const heading = element.querySelector('h2, h3');

  // Extract CTA (Foleon uses .im-button inside an anchor, filter out image-only buttons)
  const allButtons = [...element.querySelectorAll('.im-button')];
  const ctaBtn = allButtons.find((btn) => {
    const text = btn.textContent.trim();
    return text && !text.startsWith('IMG-');
  });
  const ctaAnchor = ctaBtn ? ctaBtn.closest('a') : null;

  const cells = [];

  // Row 1: Background image
  if (bgUrl) {
    const img = document.createElement('img');
    img.src = bgUrl.replace('width=800', 'width=4000');
    img.alt = heading ? heading.textContent.trim() : 'BMW X7';
    cells.push([img]);
  }

  // Row 2: Heading
  if (heading) {
    const h1 = document.createElement('h1');
    h1.textContent = heading.textContent.trim();
    cells.push([h1]);
  }

  // Row 3: CTA
  if (ctaAnchor) {
    const a = document.createElement('a');
    a.href = ctaAnchor.getAttribute('href') || ctaAnchor.href;
    const ctaText = ctaBtn.textContent.trim();
    a.textContent = ctaText.startsWith('IMG-') ? 'Explore' : ctaText;
    cells.push([a]);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero-brochure',
    cells,
  });
  element.replaceWith(block);
}
