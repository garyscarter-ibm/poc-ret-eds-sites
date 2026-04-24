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
    if (text.includes('reviews') || text.includes('report')) return false;
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
    if (!a) return false;
    const text = a.textContent.toLowerCase();
    return text.includes('review') || text.includes('report');
  });
}

/**
 * Strips EDS auto-decorated `.button` and `.button-container` classes from links
 * within a container element. Useful in blocks (e.g. nav, cards) where the default
 * button styling is unwanted.
 * @param {HTMLElement} container - The container to strip button classes from
 */
export function stripButtonClasses(container) {
  container.querySelectorAll('.button').forEach((btn) => {
    btn.className = '';
    const bc = btn.closest('.button-container');
    if (bc) bc.className = '';
  });
}

/**
 * Creates a circular carousel navigation button (prev or next).
 * @param {'prev'|'next'} direction - Button direction
 * @param {Object} [options]
 * @param {string} [options.classPrefix='carousel'] - CSS class prefix
 * @param {string} [options.ariaPrefix='items'] - Label suffix for aria-label
 * @param {'svg'|'char'} [options.style='svg'] - Use SVG chevron or Unicode character
 * @returns {HTMLButtonElement}
 */
export function createCarouselButton(direction, options = {}) {
  const {
    classPrefix = 'carousel',
    ariaPrefix = 'items',
    style = 'svg',
  } = options;

  const btn = document.createElement('button');
  btn.className = `${classPrefix}-${direction} carousel-nav-btn`;
  btn.setAttribute('aria-label', `${direction === 'prev' ? 'Previous' : 'Next'} ${ariaPrefix}`);

  if (style === 'svg') {
    const path = direction === 'prev' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${path}"/></svg>`;
  } else {
    btn.textContent = direction === 'prev' ? '\u2039' : '\u203A';
  }

  return btn;
}

/**
 * Wires scroll-based prev/next button behaviour on a horizontal scroll track.
 * @param {HTMLElement} track - The scrollable track element
 * @param {HTMLButtonElement} prevBtn - Previous button
 * @param {HTMLButtonElement} nextBtn - Next button
 * @param {Object} [options]
 * @param {number|(() => number)} [options.scrollAmount=300] - Pixels to scroll per click
 * @param {boolean} [options.disableAtEdges=false] - Auto-disable buttons at scroll edges
 */
export function wireCarouselScroll(track, prevBtn, nextBtn, options = {}) {
  const { scrollAmount = 300, disableAtEdges = false } = options;

  const getAmount = typeof scrollAmount === 'function' ? scrollAmount : () => scrollAmount;

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -getAmount(), behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: getAmount(), behavior: 'smooth' });
  });

  if (disableAtEdges) {
    track.addEventListener('scroll', () => {
      prevBtn.disabled = track.scrollLeft <= 0;
      nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    });
  }
}
