/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-car-locator.
 * Base: cards. Source: https://www.grassicksbmw.co.uk/
 * Selector: .splitPromoNavigation
 * Generated: 2026-03-20
 */
export default function parse(element, { document }) {
  const promos = Array.from(element.querySelectorAll('.linkPromo'));
  const cells = [];

  promos.forEach((promo) => {
    // Card image from background-image style
    const styleAttr = promo.getAttribute('style') || '';
    const urlMatch = styleAttr.match(/url\(['"]?(\/\/[^'")\s]+|https?:\/\/[^'")\s]+)['"]?\)/);
    let imgEl = null;
    if (urlMatch) {
      let imgUrl = urlMatch[1];
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
      imgEl = document.createElement('img');
      imgEl.src = imgUrl;
      imgEl.alt = '';
    }

    // Card text content
    const heading = promo.querySelector('.teaserText h3, h3');
    const link = promo.querySelector('.teaserText a, a');

    const textCell = [];
    if (heading) textCell.push(heading);
    if (link) textCell.push(link);

    // Cards block: 2 columns per row (image | text)
    if (imgEl) {
      cells.push([imgEl, textCell]);
    } else {
      cells.push([textCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-car-locator', cells });
  element.replaceWith(block);
}
