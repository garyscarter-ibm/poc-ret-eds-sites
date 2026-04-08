/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-feature
 * Pattern: Section with 2 .im-column children containing heading + paragraph + CTA + image
 * Works across all Foleon brochure pages (pattern-matched, not ID-specific)
 */
export default function parse(element, { document }) {
  const columns = element.querySelectorAll('.im-column');

  // Identify which column has text and which has the image
  let textCol = null;
  let imgCol = null;

  columns.forEach((col) => {
    const hasHeading = col.querySelector('h3, h4, h5');
    const hasFigure = col.querySelector('figure img, .ripley__Image--image');
    if (hasHeading) textCol = col;
    else if (hasFigure) imgCol = col;
  });

  // Fallback: single column with both text and background image
  if (!textCol && columns.length >= 1) {
    const col = columns[0];
    if (col.querySelector('h3, h4, h5')) textCol = col;
  }

  // Extract image — from figure in image column, or from background-image on text column
  let imgEl = null;
  if (imgCol) {
    const figImg = imgCol.querySelector('figure img, .ripley__Image--image');
    if (figImg) {
      imgEl = document.createElement('img');
      imgEl.src = figImg.getAttribute('src') || figImg.src;
      imgEl.alt = figImg.alt || '';
    }
  }
  if (!imgEl && textCol) {
    const style = window.getComputedStyle(textCol);
    const match = style.backgroundImage && style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (match) {
      imgEl = document.createElement('img');
      imgEl.src = match[1];
      imgEl.alt = '';
    }
  }

  if (!textCol) return;

  // Extract text content
  const heading = textCol.querySelector('h3, h4, h5');
  const paragraphs = [...textCol.querySelectorAll('p')];

  // Filter CTA: find meaningful links (not single chars or empty)
  const allLinks = [...textCol.querySelectorAll('a[href]')];
  const ctaLink = allLinks.find((a) => {
    const t = a.textContent.trim();
    return t.length > 2 && !t.startsWith('IMG-');
  });

  // Build text cell
  const textContent = [];

  if (heading) {
    const h = document.createElement('h5');
    h.textContent = heading.textContent.trim();
    textContent.push(h);
  }

  paragraphs.forEach((p) => {
    const text = p.textContent.trim();
    // Skip CTA paragraphs and short/empty paragraphs
    if (text.length <= 2) return;
    if (p.querySelector('a[href]')) return;
    const para = document.createElement('p');
    para.textContent = text;
    textContent.push(para);
  });

  if (ctaLink) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = ctaLink.getAttribute('href') || ctaLink.href;
    a.textContent = ctaLink.textContent.trim().replace(/^e\s*/, '');
    p.append(a);
    textContent.push(p);
  }

  const cells = [];
  if (imgEl && textContent.length > 0) {
    cells.push([imgEl, textContent]);
  } else if (textContent.length > 0) {
    cells.push([textContent]);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns-feature',
    cells,
  });
  element.replaceWith(block);
}
