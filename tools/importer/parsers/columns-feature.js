/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature.
 * Base: columns. Source: cotswoldcheltenhambmw.co.uk/about-us/
 * DOM: .fullQuotePanel (about intro) and .singleTeaserCMS (get in touch CTA)
 * Block library: Columns = row with [col1, col2] side by side
 * fullQuotePanel: image + name/title + quote paragraph
 * singleTeaserCMS: image + heading + CTA link
 */
export default function parse(element, { document }) {
  const cells = [];

  if (element.classList.contains('fullQuotePanel')) {
    // About intro: person image + quote
    const img = element.querySelector('.quotePersonDetails img');
    const name = element.querySelector('.quotePersonDetails h3');
    const title = element.querySelector('.quotePersonDetails h4');
    const quote = element.querySelector(':scope > p');

    const imgCell = [];
    if (img) imgCell.push(img);

    const textCell = [];
    if (name) textCell.push(name);
    if (title) textCell.push(title);
    if (quote) textCell.push(quote);

    cells.push([imgCell.length ? imgCell : '', textCell]);
  } else {
    // singleTeaserCMS: CTA with image
    const img = element.querySelector('.imageHolderCMS img');
    const heading = element.querySelector('h4');
    const link = element.querySelector('a');

    const imgCell = [];
    if (img) imgCell.push(img);

    const textCell = [];
    if (heading) textCell.push(heading);
    if (link) textCell.push(link);

    cells.push([imgCell.length ? imgCell : '', textCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
