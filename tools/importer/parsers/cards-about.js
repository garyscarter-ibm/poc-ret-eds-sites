/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-about.
 * Base: cards. Source: cotswoldcheltenhambmw.co.uk/about-us/
 * DOM: .linkBoxHolder - navigation cards with heading + link
 * Block library: Cards = row per card: [image, text+heading+CTA]
 * These cards have no images, just heading + link per card
 */
export default function parse(element, { document }) {
  const cards = element.querySelectorAll('.linkBox');
  const cells = [];

  cards.forEach((card) => {
    const heading = card.querySelector('h3');
    const link = card.querySelector('a');
    const socialList = card.querySelector('.socialIconsGlobal');
    const contentCell = [];

    if (heading) contentCell.push(heading);
    if (socialList) {
      const links = socialList.querySelectorAll('a');
      links.forEach((a) => contentCell.push(a));
    } else if (link) {
      contentCell.push(link);
    }

    if (contentCell.length) cells.push(contentCell);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-about', cells });
  element.replaceWith(block);
}
