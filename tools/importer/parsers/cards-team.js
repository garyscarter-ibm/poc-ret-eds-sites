/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-team.
 * Base: cards. Source: cotswoldcheltenhambmw.co.uk/about-us/
 * DOM: .tripleColumnCMS - grid of employee cards with image, name (h4), title (h3)
 * Block library: Cards = row per card: [image, text content]
 */
export default function parse(element, { document }) {
  const employees = element.querySelectorAll('[class*="employee"], .columnCMS');
  const cells = [];

  employees.forEach((emp) => {
    const img = emp.querySelector('.imageHolderCMS img');
    const name = emp.querySelector('.richText h4');
    const title = emp.querySelector('.richText h3');
    const extra = emp.querySelector('.richText h5');

    if (!img && !name) return;

    const imgCell = [];
    if (img) {
      let src = img.getAttribute('src') || '';
      if (src.startsWith('//')) img.src = `https:${src}`;
      imgCell.push(img);
    }

    const textCell = [];
    if (name) textCell.push(name);
    if (title) textCell.push(title);
    if (extra) textCell.push(extra);

    cells.push([imgCell.length ? imgCell : '', textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-team', cells });
  element.replaceWith(block);
}
