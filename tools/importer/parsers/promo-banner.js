/* eslint-disable */
/* global WebImporter */

/**
 * Parser: promo-banner
 * Pattern: Section with column background-image + h4 heading + paragraph + CTA link
 * Full-bleed promotional banner with text overlay (e.g., BMW for Business)
 */
export default function parse(element, { document }) {
  // Get the column with background image
  const cols = element.querySelectorAll('.im-column');
  let bgUrl = '';
  for (const col of cols) {
    const style = window.getComputedStyle(col);
    const match = style.backgroundImage && style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
    if (match) {
      bgUrl = match[1];
      break;
    }
  }

  // Get heading
  const h4 = element.querySelector('h4');
  if (!h4) return;

  // Get body paragraph
  const allPs = [...element.querySelectorAll('p')];
  const bodyPara = allPs.find((p) => {
    const t = p.textContent.trim();
    return t.length > 20 && !p.querySelector('img');
  });

  // Get CTA link (filter out icon-only links)
  const ctaLink = [...element.querySelectorAll('a[href]')].find((a) => {
    const t = a.textContent.trim();
    return t.length > 3 && !t.startsWith('IMG-');
  });

  const cells = [];

  // Row 1: background image
  if (bgUrl) {
    const img = document.createElement('img');
    img.src = bgUrl;
    img.alt = h4.textContent.trim();
    cells.push([img]);
  }

  // Row 2: heading
  cells.push([h4.textContent.trim()]);

  // Row 3: body with bold "BMW for Business"
  if (bodyPara) {
    const p = document.createElement('p');
    const text = bodyPara.textContent.trim();
    // Preserve "BMW for Business" as bold
    const boldMatch = text.match(/(.*?)(BMW for Business)(.*)/);
    if (boldMatch) {
      p.append(
        document.createTextNode(boldMatch[1]),
        Object.assign(document.createElement('strong'), { textContent: boldMatch[2] }),
        document.createTextNode(boldMatch[3]),
      );
    } else {
      p.textContent = text;
    }
    cells.push([p]);
  }

  // Row 4: CTA link
  if (ctaLink) {
    const a = document.createElement('a');
    a.href = ctaLink.getAttribute('href') || ctaLink.href;
    a.textContent = ctaLink.textContent.trim().replace(/^[ed]\s*/, '');
    cells.push([a]);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'promo-banner',
    cells,
  });
  element.replaceWith(block);
}
