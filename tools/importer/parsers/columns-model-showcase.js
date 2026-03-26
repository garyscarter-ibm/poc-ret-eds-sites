/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-model-showcase.
 * Base: columns. Source: https://www.grassicksbmw.co.uk/
 * Selector: #soc5Series
 * Generated: 2026-03-20 v3
 */
export default function parse(element, { document }) {
  // Column 1: Image (video poster or static image)
  const video = element.querySelector('video.videoBgPlayer');
  const posterUrl = video ? video.getAttribute('poster') : null;
  let imgEl = null;
  if (posterUrl) {
    imgEl = document.createElement('img');
    imgEl.src = posterUrl.startsWith('./') ? 'https://www.grassicksbmw.co.uk/' + posterUrl.slice(2) : posterUrl;
    imgEl.alt = 'BMW iX3';
  }

  // Column 2: Text content - car name, specs, description, CTA
  const carName = element.querySelector('.carName, h2');
  const fuelType = element.querySelector('.fuelType li, #carNavFuelOptions');
  const modelStrap = element.querySelector('.modelStrap');
  const specs = Array.from(element.querySelectorAll('.modelExtra li'));
  const ctaLink = element.querySelector('.modelLinks a, a.moreDetails');

  const textCell = [];
  if (carName) textCell.push(carName);
  if (fuelType) {
    const p = document.createElement('p');
    p.textContent = fuelType.textContent.trim();
    textCell.push(p);
  }
  if (modelStrap) {
    const p = document.createElement('p');
    p.textContent = modelStrap.textContent.trim();
    textCell.push(p);
  }
  specs.forEach((spec) => {
    const title = spec.querySelector('.infoTitle');
    const info = spec.querySelector('.infoInfo');
    if (title && info) {
      const p = document.createElement('p');
      p.textContent = `${title.textContent.trim()}: ${info.textContent.trim()}`;
      textCell.push(p);
    }
  });
  if (ctaLink) textCell.push(ctaLink);

  // Build cells: 2 columns (image | text)
  const cells = [];
  const row = [];
  if (imgEl) {
    row.push(imgEl);
  }
  row.push(textCell);
  cells.push(row);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-model-showcase', cells });
  element.replaceWith(block);
}
