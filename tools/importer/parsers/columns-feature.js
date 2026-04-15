/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-feature.
 * Source: bmw-motorrad.co.uk mediacopy sections
 * Extracts: image + heading + description + CTA links
 * Handles both section-heading mediacopy and standalone mediacopy
 */
export default function parse(element, { document }) {
  // Extract image - prefer the carousel/single-image img with meaningful src
  let img = element.querySelector('.mediacopy__single-image img, .mediacontent__mediaContainer img');
  if (!img) {
    // Fallback: find any img that's not an icon/decoration
    const allImgs = element.querySelectorAll('img');
    for (const candidate of allImgs) {
      const src = candidate.getAttribute('src') || '';
      const alt = candidate.getAttribute('alt') || '';
      if (!src.includes('spinner') && !src.includes('close.svg') && !src.includes('badge-right') &&
          !src.includes('readmore_gradient') && !src.includes('data:image') &&
          !src.includes('svgicon') && alt) {
        img = candidate;
        break;
      }
    }
  }

  // Extract heading - use desktop version (copyContainer headline), skip mobile headline
  let heading = element.querySelector('.mediacontent__copyContainer--headline.desktop-teaser-headline');
  if (!heading) {
    heading = element.querySelector('.mediacontent__copyContainer--headline');
  }
  if (!heading) {
    heading = element.querySelector('h3:not(.mobile-teaser-headline), h2:not(.mobile-teaser-headline)');
  }

  // Extract section headline (h2 in section-headline component above the mediacopy)
  const sectionHeadline = element.querySelector('.c-section-headline__title h2');

  // Extract description text
  const descContainer = element.querySelector('.mediacontent__copyContainer--copy');
  const descParagraphs = descContainer ? descContainer.querySelectorAll('p') : [];

  // Extract CTA links
  const ctaContainer = element.querySelector('.mediacontent__copyContainer--buttons');
  const ctaLinks = ctaContainer ? ctaContainer.querySelectorAll('a') : element.querySelectorAll('.mediacontent__copyContainer--button');
  const links = [];
  const seen = new Set();
  ctaLinks.forEach((a) => {
    const href = a.getAttribute('href');
    const textEl = a.querySelector('.mnm-auto-dlo-text, .mnm-button-label, span');
    const text = textEl ? textEl.textContent.trim() : a.textContent.trim();
    if (href && text && !seen.has(href)) {
      seen.add(href);
      const link = document.createElement('a');
      link.href = href;
      link.textContent = text;
      links.push(link);
    }
  });

  // Build cells: Row 1 = image, Row 2 = text content
  const cells = [];

  // Image row
  if (img) {
    const imgClone = img.cloneNode(true);
    cells.push([imgClone]);
  }

  // Text content row
  const textContent = [];

  // Section headline (h2 above the mediacopy)
  if (sectionHeadline) {
    const h = document.createElement('h2');
    h.textContent = sectionHeadline.textContent.trim();
    textContent.push(h);
  }

  // Block heading (h3)
  if (heading) {
    const h = document.createElement('h3');
    h.textContent = heading.textContent.trim();
    textContent.push(h);
  }

  // Description paragraphs
  descParagraphs.forEach((p) => {
    const text = p.textContent.trim();
    if (text) {
      const para = document.createElement('p');
      // Preserve strong/bold content
      if (p.querySelector('strong')) {
        const strong = document.createElement('strong');
        strong.textContent = text;
        para.appendChild(strong);
      } else {
        para.textContent = text;
      }
      textContent.push(para);
    }
  });

  // CTA links
  links.forEach((link) => {
    const p = document.createElement('p');
    p.appendChild(link);
    textContent.push(p);
  });

  if (textContent.length > 0) {
    cells.push(textContent);
  }

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns-feature',
    cells,
  });

  element.replaceWith(block);
}
