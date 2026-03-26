/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-about.
 * Base: cards. Source: https://www.grassicksbmw.co.uk/
 * Selector: #aboutUs .triplePanel
 * Generated: 2026-03-20
 */
export default function parse(element, { document }) {
  const panels = Array.from(element.querySelectorAll('.panel'));
  const cells = [];

  panels.forEach((panel) => {
    // Card image from background-image style or inline img
    const styleAttr = panel.getAttribute('style') || '';
    const urlMatch = styleAttr.match(/url\(["']?(\/\/[^"')\s]+|https?:\/\/[^"')\s]+|\/[^"')\s]+)["']?\)/);
    let imgEl = null;
    if (urlMatch) {
      let imgUrl = urlMatch[1];
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
      else if (imgUrl.startsWith('/') && !imgUrl.startsWith('//')) imgUrl = 'https://www.grassicksbmw.co.uk' + imgUrl;
      imgEl = document.createElement('img');
      imgEl.src = imgUrl;
      imgEl.alt = '';
    }

    // Card text: heading and links/CTAs
    const heading = panel.querySelector('h5');
    const links = Array.from(panel.querySelectorAll('a[href]'));

    const textCell = [];
    if (heading) textCell.push(heading);
    links.forEach((link) => textCell.push(link));

    if (imgEl) {
      cells.push([imgEl, textCell]);
    } else {
      // No-image card (e.g., link list card)
      cells.push([textCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-about', cells });
  element.replaceWith(block);
}
