/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-welcome.
 * Base: columns. Source: https://www.grassicksbmw.co.uk/
 * Selector: .splitFrameTeaserCMS
 * Generated: 2026-03-20
 */
export default function parse(element, { document }) {
  // Image column
  const img = element.querySelector('.imageHolderCMS img, img');

  // Text column: heading, description, CTA
  const richText = element.querySelector('.richText');
  const heading = richText ? richText.querySelector('h3, h5') : element.querySelector('h3, h5');
  const paragraphs = richText
    ? Array.from(richText.querySelectorAll('p'))
    : Array.from(element.querySelectorAll('p'));
  const ctaLink = richText ? richText.querySelector('a[href]') : element.querySelector('a[href]');

  const textCell = [];
  if (heading) textCell.push(heading);
  paragraphs.forEach((p) => {
    if (ctaLink && p.contains(ctaLink) && p.children.length === 1) return;
    textCell.push(p);
  });
  if (ctaLink) textCell.push(ctaLink);

  // Columns block: 2 columns (image | text)
  const cells = [];
  cells.push([img || '', textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-welcome', cells });
  element.replaceWith(block);
}
