/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news.
 * Base: cards. Source: https://www.grassicksbmw.co.uk/
 * Selector: .homeSpace .triplePanel
 * Generated: 2026-03-20
 */
export default function parse(element, { document }) {
  const panels = Array.from(element.querySelectorAll('.panel, .homePagePanel'));
  const cells = [];

  panels.forEach((panel) => {
    // Card image from background-image style
    const styleAttr = panel.getAttribute('style') || '';
    const urlMatch = styleAttr.match(/url\(["']?(\/\/[^"')\s]+|https?:\/\/[^"')\s]+)["']?\)/);
    let imgEl = null;
    if (urlMatch) {
      let imgUrl = urlMatch[1];
      if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
      imgEl = document.createElement('img');
      imgEl.src = imgUrl;
      imgEl.alt = '';
    }

    // Card text: category, heading, description, CTA link
    const category = panel.querySelector('h4');
    const heading = panel.querySelector('h5, a h5');
    const description = panel.querySelector('p, a p');
    const link = panel.querySelector('a[href]');

    const textCell = [];
    if (category) textCell.push(category);
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    if (link) {
      const readMore = panel.querySelector('.arrowLink');
      if (readMore && link) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = readMore.textContent.trim() || 'Read more';
        textCell.push(a);
      }
    }

    if (imgEl) {
      cells.push([imgEl, textCell]);
    } else {
      cells.push([textCell]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news', cells });
  element.replaceWith(block);
}
