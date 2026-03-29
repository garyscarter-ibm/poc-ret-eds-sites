/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns (standard image-text teasers).
 * Base: columns. Source: https://www.grassicksbmw.co.uk/
 * Selector: .splitBannerTeaserCMS
 * Generated: 2026-03-20
 */
export default function parse(element, { document }) {
  // Image column
  const img = element.querySelector('.imageHolderCMS img, img');

  // Text column: heading, description paragraphs, CTA link
  const richText = element.querySelector('.richText');
  const heading = richText ? richText.querySelector('h3, h5') : element.querySelector('h3, h5');
  const paragraphs = richText
    ? Array.from(richText.querySelectorAll('p'))
    : Array.from(element.querySelectorAll('p'));
  const ctaLink = richText ? richText.querySelector('a[href]') : element.querySelector('a[href]');

  const textCell = [];
  if (heading) textCell.push(heading);
  paragraphs.forEach((p) => {
    // Skip if the paragraph just contains the CTA link
    if (ctaLink && p.contains(ctaLink) && p.children.length === 1) return;
    textCell.push(p);
  });
  if (ctaLink) textCell.push(ctaLink);

  // Columns block: 2 columns per row (image | text)
  // Check if this is an alternating (.alt) layout - swap column order
  const isAlt = element.classList.contains('alt');
  const cells = [];
  if (isAlt) {
    cells.push([textCell, img || '']);
  } else {
    cells.push([img || '', textCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
