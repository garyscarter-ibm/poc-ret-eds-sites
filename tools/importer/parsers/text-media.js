/* eslint-disable */
/* global WebImporter */

/**
 * Parser: text-media
 * Pattern: Section with h3 heading + paragraph text + optional figure/image
 * Used for feature descriptions like "OPULENT UPHOLSTERY", "PURE CHARISMA"
 *
 * Foleon DOM: content is nested in .im-column > .im-column-inner divs
 * So we search the entire section, not just siblings
 */
export default function parse(element, { document }) {
  // Find the first h3 anywhere in the section
  const heading = element.querySelector('h3');
  if (!heading) return;

  // Find all paragraphs anywhere in the section with actual text content
  const allParas = [...element.querySelectorAll('p')];
  const descParas = allParas.filter((p) => {
    const t = p.textContent.trim();
    return t.length > 20 && !p.querySelector('img') && !t.startsWith('IMG-');
  });

  if (descParas.length === 0) return;

  // Find image — figure, standalone img, or CSS background
  let imgEl = null;
  const figImg = element.querySelector('figure img, .ripley__Image--image');
  if (figImg) {
    imgEl = document.createElement('img');
    imgEl.src = figImg.getAttribute('src') || figImg.src;
    imgEl.alt = heading.textContent.trim();
  }
  if (!imgEl) {
    // Check for background image on columns
    const cols = element.querySelectorAll('.im-column');
    for (const col of cols) {
      const style = window.getComputedStyle(col);
      const match = style.backgroundImage && style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
      if (match) {
        imgEl = document.createElement('img');
        imgEl.src = match[1];
        imgEl.alt = heading.textContent.trim();
        break;
      }
    }
  }

  // Build text cell
  const textContent = [];
  const h = document.createElement('h3');
  h.textContent = heading.textContent.trim();
  textContent.push(h);

  descParas.forEach((p) => {
    const para = document.createElement('p');
    para.textContent = p.textContent.trim();
    textContent.push(para);
  });

  const cells = [];
  if (imgEl) {
    cells.push([imgEl, textContent]);
  } else {
    cells.push([textContent]);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'text-media',
    cells,
  });
  element.replaceWith(block);
}
