/* eslint-disable */
/* global WebImporter */

/**
 * Parser: embed
 * Pattern: Section containing an <iframe> with external content (comparators, configurators, etc.)
 * Extracts the iframe src and optional title to create an embed block.
 */
export default function parse(element, { document }) {
  const iframe = element.querySelector('iframe');
  if (!iframe) return;

  const src = iframe.getAttribute('src') || iframe.src;
  if (!src) return;

  const title = iframe.getAttribute('title') || '';

  const cells = [];

  // Row 1: embed URL
  const a = document.createElement('a');
  a.href = src;
  a.textContent = src;
  cells.push([a]);

  // Row 2: title (if meaningful)
  const cleanTitle = title.replace(/https?:\/\/.*/, '').trim();
  if (cleanTitle) {
    cells.push([cleanTitle]);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'embed',
    cells,
  });
  element.replaceWith(block);
}
