/**
 * Shared utility functions for AEM Edge Delivery blocks.
 * Import from block JS files: import { ... } from '../../scripts/block-utils.js';
 */

/**
 * Builds a star rating element from text like "SALES: 4.7"
 * @param {string} text - Text containing "LABEL: score" pattern
 * @param {Object} [options]
 * @param {string} [options.labelTag='h3'] - Tag name for the label element
 * @param {string} [options.labelClass='rating-label'] - CSS class for the label
 * @param {string} [options.starsRowClass='star-rating'] - CSS class for the stars row
 * @param {string} [options.scoreClass='rating-score'] - CSS class for the score span
 * @param {string} [options.containerClass='rating'] - CSS class for the outer container
 * @returns {{ container: HTMLElement, label: string, score: string } | null}
 */
export function buildStarRating(text, options = {}) {
  const {
    labelTag = 'h3',
    labelClass = 'rating-label',
    starsRowClass = 'star-rating',
    scoreClass = 'rating-score',
    containerClass = 'rating',
  } = options;

  const match = text.trim().match(/(SALES|SERVICE):\s*([\d.]+)/);
  if (!match) return null;

  const [, label, score] = match;

  const container = document.createElement('div');
  container.className = containerClass;

  const labelEl = document.createElement(labelTag);
  labelEl.className = labelClass;
  labelEl.textContent = label;

  const starsRow = document.createElement('div');
  starsRow.className = starsRowClass;
  const fullStars = Math.floor(parseFloat(score));
  for (let s = 0; s < 5; s += 1) {
    const star = document.createElement('span');
    star.className = s < fullStars ? 'star star-full' : 'star star-empty';
    starsRow.append(star);
  }

  const scoreEl = document.createElement('span');
  scoreEl.className = scoreClass;
  scoreEl.textContent = score;
  starsRow.append(scoreEl);

  container.append(labelEl, starsRow);
  return { container, label, score };
}

/**
 * Finds CTA link divs among block children and builds a button container.
 * Filters out divs containing SALES/SERVICE ratings or review links.
 * @param {HTMLElement[]} children - Array of child div elements
 * @param {Object} [options]
 * @param {string} [options.containerClass='cta-buttons'] - CSS class for the container
 * @param {string} [options.btnClass='cta-btn'] - Base CSS class for each button
 * @param {string} [options.primaryClass='cta-btn-primary'] - CSS class for the first button
 * @param {string} [options.secondaryClass='cta-btn-secondary'] - CSS class for others
 * @param {boolean} [options.allSecondary=false] - If true, all buttons get secondary class
 * @returns {{ container: HTMLElement, ctaDivs: HTMLElement[] } | null}
 */
export function buildCtaButtons(children, options = {}) {
  const {
    containerClass = 'cta-buttons',
    btnClass = 'cta-btn',
    primaryClass = 'cta-btn-primary',
    secondaryClass = 'cta-btn-secondary',
    allSecondary = false,
  } = options;

  const ctaDivs = children.filter((d) => {
    const a = d.querySelector('a');
    const p = d.querySelector('p');
    if (!a || !p) return false;
    const text = p.textContent.trim();
    if (text.includes('SALES') || text.includes('SERVICE')) return false;
    if (text.includes('reviews')) return false;
    return true;
  });

  if (ctaDivs.length === 0) return null;

  const container = document.createElement('div');
  container.className = containerClass;
  ctaDivs.forEach((d, i) => {
    const a = d.querySelector('a');
    if (a) {
      if (allSecondary) {
        a.className = `${btnClass} ${secondaryClass}`;
      } else {
        a.className = i === 0
          ? `${btnClass} ${primaryClass}`
          : `${btnClass} ${secondaryClass}`;
      }
      container.append(a);
    }
    d.remove();
  });

  return { container, ctaDivs };
}

/**
 * Finds heading elements among block children and assigns role classes.
 * @param {HTMLElement[]} children - Array of child div elements
 * @param {Object} [options]
 * @param {string} [options.titleClass='title'] - CSS class for the first heading
 * @param {string} [options.subtitleClass='subtitle'] - CSS class for the second heading
 * @returns {{ titleDiv: HTMLElement|null, subtitleDiv: HTMLElement|null }}
 */
export function classifyHeadings(children, options = {}) {
  const {
    titleClass = 'title',
    subtitleClass = 'subtitle',
  } = options;

  const headingDivs = children.filter((d) => d.querySelector('h1, h2, h3, h4, h5, h6'));
  const titleDiv = headingDivs[0] || null;
  const subtitleDiv = headingDivs[1] || null;

  if (titleDiv) {
    titleDiv.querySelector('h1, h2, h3, h4, h5, h6').classList.add(titleClass);
  }
  if (subtitleDiv) {
    subtitleDiv.querySelector('h1, h2, h3, h4, h5, h6').classList.add(subtitleClass);
  }

  return { titleDiv, subtitleDiv };
}

/**
 * Finds divs containing rating text (SALES/SERVICE scores).
 * @param {HTMLElement[]} children - Array of child div elements
 * @returns {HTMLElement[]}
 */
export function findRatingDivs(children) {
  return children.filter((d) => {
    const p = d.querySelector('p');
    if (p) return p.textContent.includes('SALES') || p.textContent.includes('SERVICE');
    return d.textContent.includes('SALES:') || d.textContent.includes('SERVICE:');
  });
}

/**
 * Finds the div containing a review link.
 * @param {HTMLElement[]} children - Array of child div elements
 * @returns {HTMLElement|undefined}
 */
export function findReviewDiv(children) {
  return children.find((d) => {
    const a = d.querySelector('a');
    return a && a.textContent.includes('reviews');
  });
}
