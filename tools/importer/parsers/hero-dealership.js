/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-dealership.
 * Base: hero. Source: cotswoldcheltenhambmw.co.uk/about-us/
 * DOM: .heroPageHead.aboutUsHero - hero with background image, h1, star ratings
 * Block library: Hero = row1: bg image, row2: heading + subheading + CTA
 */
export default function parse(element, { document }) {
  // Extract background image from inline style
  const style = element.getAttribute('style') || '';
  const bgMatch = style.match(/url\(['"]?(.*?)['"]?\)/);
  const cells = [];

  if (bgMatch) {
    const img = document.createElement('img');
    let src = bgMatch[1];
    if (src.startsWith('//')) src = `https:${src}`;
    img.src = src;
    img.alt = '';
    cells.push([img]);
  }

  // Extract heading and content
  const contentCell = [];
  const heading = element.querySelector('h1');
  if (heading) contentCell.push(heading);

  // Extract rating sections text
  const ratingSection = element.querySelector('.ratingSection');
  if (ratingSection) {
    const ratingText = document.createElement('p');
    const ratings = ratingSection.querySelectorAll('.starRating');
    const parts = [];
    ratings.forEach((r) => {
      const label = r.querySelector('h3');
      const score = r.querySelector('.ratingResult');
      if (label && score) parts.push(`${label.textContent.trim()}: ${score.textContent.trim()}`);
    });
    if (parts.length) {
      ratingText.textContent = parts.join(' | ');
      contentCell.push(ratingText);
    }
  }

  // Extract CTA link
  const cta = element.querySelector('a[href*="review"]');
  if (cta) contentCell.push(cta);

  if (contentCell.length) cells.push(contentCell);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-dealership', cells });
  element.replaceWith(block);
}
