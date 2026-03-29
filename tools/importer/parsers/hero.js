/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero.
 * Base: hero. Source: https://www.grassicksbmw.co.uk/
 * Selector: .heroCarousel .carousel-cell.heroCell
 * Generated: 2026-03-20
 */
export default function parse(element, { document }) {
  // Extract background image from inline style background-image url
  const bgStyle = element.querySelector('.heroPageHead');
  let bgImg = null;
  if (bgStyle) {
    const styleAttr = bgStyle.getAttribute('style') || '';
    const urlMatch = styleAttr.match(/url\(['"]?(\/\/[^'")\s]+|https?:\/\/[^'")\s]+)['"]?\)/);
    if (urlMatch) {
      let imgUrl = urlMatch[1];
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
      bgImg = document.createElement('img');
      bgImg.src = imgUrl;
      bgImg.alt = '';
    }
  }

  // Extract heading (h1)
  const heading = element.querySelector('.heroText h1, h1');
  // Extract subheading (h2 or p inside heroText)
  const subheading = element.querySelector('.heroText h2, .heroText p');
  // Extract CTA buttons
  const ctas = Array.from(element.querySelectorAll('.buttonHolder a.btnPrimary, .buttonHolder a.btnSecondary'));

  // Build cells matching hero block library structure:
  // Row 1 (optional): background image
  // Row 2: heading, subheading, CTAs
  const cells = [];

  if (bgImg) {
    cells.push([bgImg]);
  }

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  ctas.forEach((cta) => contentCell.push(cta));

  // Add star ratings as text content
  const ratingSections = element.querySelectorAll('.starRating');
  if (ratingSections.length > 0) {
    ratingSections.forEach((rating) => {
      const title = rating.querySelector('.ratingTitle');
      const number = rating.querySelector('.numberRating');
      if (title && number) {
        const p = document.createElement('p');
        p.textContent = `${title.textContent.trim()}: ${number.textContent.trim()}/5`;
        contentCell.push(p);
      }
    });
    const reviewLink = element.querySelector('.ratingSection a');
    if (reviewLink) contentCell.push(reviewLink);
  }

  cells.push(contentCell);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
