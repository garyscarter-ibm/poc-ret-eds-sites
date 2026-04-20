/* eslint-disable */
/* global WebImporter */
/**
 * Parser for text-media.
 * Base: columns. Source: cotswoldcheltenhambmw.co.uk/about-us/
 * DOM: .splitFrameTeaserCMS (image carousel + text) and .splitBannerTeaserCMS (image + text)
 * Block library: Columns = row with [col1, col2] side by side
 * All instances have image + rich text content
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract image - from imageHolderCMS or carousel
  const img = element.querySelector('.imageHolderCMS img, .carousel-image, .flickity-slider img');

  // Extract text content from richText container
  const richText = element.querySelector('.richText');
  const textElements = [];
  if (richText) {
    const children = richText.querySelectorAll(':scope > p, :scope > h3, :scope > h4, :scope > a');
    children.forEach((child) => textElements.push(child));
  }

  const imgCell = [];
  if (img) {
    let src = img.getAttribute('src') || '';
    if (src.startsWith('//')) {
      img.src = `https:${src}`;
    }
    imgCell.push(img);
  }

  cells.push([imgCell.length ? imgCell : '', textElements.length ? textElements : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'text-media', cells });
  element.replaceWith(block);
}
