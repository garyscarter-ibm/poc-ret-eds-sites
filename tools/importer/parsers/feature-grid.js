/* eslint-disable */
/* global WebImporter */

/**
 * Parser: feature-grid
 * Pattern: Section with 4+ .im-column children, each with h4 title + "Learn more" CTA
 * Some columns have CSS background-images (feature photos)
 *
 * Handles both desktop (4 cols, im-buttons) and tablet (7 cols, no buttons) Foleon variants.
 * Deduplicates by title to handle responsive duplicates within the same section.
 */
export default function parse(element, { document }) {
  const allH4s = [...element.querySelectorAll('h4')];
  if (allH4s.length < 4) return;

  // Separate title h4s from CTA h4s
  const titleH4s = allH4s.filter((h) => {
    const text = h.textContent.trim();
    return text.length > 3 && !text.toLowerCase().includes('learn more');
  });

  if (titleH4s.length < 2) return;

  // Deduplicate titles (responsive variants repeat content)
  const seenTitles = new Set();
  const uniqueTitleH4s = titleH4s.filter((h) => {
    const text = h.textContent.trim();
    if (seenTitles.has(text)) return false;
    seenTitles.add(text);
    return true;
  });

  // Get background images from columns
  const columns = [...element.querySelectorAll('.im-column')];
  const colImages = new Map();
  columns.forEach((col) => {
    const style = window.getComputedStyle(col);
    if (style.backgroundImage && style.backgroundImage !== 'none') {
      const match = style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
      if (match) {
        // Map the column's first h4 title to the image
        const h4 = col.querySelector('h4');
        if (h4) {
          const title = h4.textContent.trim();
          if (!title.toLowerCase().includes('learn more') && title.length > 3) {
            colImages.set(title, match[1]);
          }
        }
      }
    }
  });

  const cells = [];
  let counter = 1;

  uniqueTitleH4s.forEach((h4) => {
    const title = h4.textContent.trim();
    const num = counter.toString().padStart(2, '0');
    counter += 1;

    // Find CTA link - look for next "Learn more" h4
    let ctaH4 = h4.nextElementSibling;
    while (ctaH4 && !ctaH4.textContent.toLowerCase().includes('learn more')) {
      ctaH4 = ctaH4.nextElementSibling;
    }
    const ctaLink = ctaH4 ? ctaH4.querySelector('a') : null;

    // Get background image for this feature
    const bgUrl = colImages.get(title) || '';

    const row = [];

    // Cell 1: background image
    if (bgUrl) {
      const img = document.createElement('img');
      img.src = bgUrl;
      img.alt = title;
      row.push(img);
    } else {
      row.push('');
    }

    // Cell 2: number + title
    const titleEl = document.createElement('div');
    const numSpan = document.createElement('span');
    numSpan.textContent = num;
    const titleText = document.createElement('h4');
    titleText.textContent = title;
    titleEl.append(numSpan, titleText);
    row.push(titleEl);

    // Cell 3: CTA link
    if (ctaLink) {
      const a = document.createElement('a');
      a.href = ctaLink.getAttribute('href') || ctaLink.href;
      a.textContent = 'Learn more';
      row.push(a);
    }

    cells.push(row);
  });

  if (cells.length < 2) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'feature-grid',
    cells,
  });
  element.replaceWith(block);
}
