/**
 * Brochure Scroll Animation System
 * Uses IntersectionObserver to trigger CSS transitions when sections scroll into viewport.
 */

const VIEWPORT_CLASS = 'in-viewport';
const ANIMATE_CLASS = 'animate';

/**
 * Initializes scroll-triggered animations for brochure sections.
 * Sections with the 'animate' class will get 'in-viewport' added when visible.
 * @param {HTMLElement} main - The main content element
 * @param {object} [options] - Configuration options
 * @param {number} [options.threshold=0.15] - IntersectionObserver threshold
 * @param {string} [options.rootMargin='0px 0px -50px 0px'] - Root margin
 */
export function initBrochureAnimations(main, options = {}) {
  const {
    threshold = 0.15,
    rootMargin = '0px 0px -50px 0px',
  } = options;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add(VIEWPORT_CLASS);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold, rootMargin });

  main.querySelectorAll(`.section.${ANIMATE_CLASS}`).forEach((section) => {
    observer.observe(section);
  });
}

/**
 * Marks sections for animation. Call before initBrochureAnimations.
 * @param {HTMLElement} main - The main content element
 */
export function prepareBrochureAnimations(main) {
  main.querySelectorAll('.section').forEach((section) => {
    // Skip nav and footer sections
    if (section.querySelector('.brochure-nav') || section.querySelector('.brochure-footer')) return;
    section.classList.add(ANIMATE_CLASS);
  });
}
