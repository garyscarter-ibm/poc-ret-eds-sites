/**
 * BMW X7 Brochure Navigation Configuration
 * Defines page order, titles, and URLs for the brochure navigation.
 */

const BROCHURE_PAGES = [
  {
    id: 1,
    title: 'Introduction',
    url: '/content/brochures/x7/',
  },
  {
    id: 2,
    title: 'Exterior Design',
    url: '/content/brochures/x7/exterior-design',
  },
  {
    id: 3,
    title: 'Interior Design',
    url: '/content/brochures/x7/interior-design',
  },
];

/**
 * Returns all brochure pages.
 * @returns {Array} Array of page objects
 */
export function getBrochurePages() {
  return BROCHURE_PAGES;
}

/**
 * Returns the current page object based on the current URL path.
 * @returns {object|null} Current page object or null
 */
export function getCurrentPage() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  return BROCHURE_PAGES.find((p) => {
    const pagePath = p.url.replace(/\/$/, '') || '/';
    return path === pagePath || path.endsWith(pagePath);
  }) || null;
}

/**
 * Returns the previous page relative to current, or null.
 * @returns {object|null}
 */
export function getPreviousPage() {
  const current = getCurrentPage();
  if (!current) return null;
  const idx = BROCHURE_PAGES.indexOf(current);
  return idx > 0 ? BROCHURE_PAGES[idx - 1] : null;
}

/**
 * Returns the next page relative to current, or null.
 * @returns {object|null}
 */
export function getNextPage() {
  const current = getCurrentPage();
  if (!current) return null;
  const idx = BROCHURE_PAGES.indexOf(current);
  return idx < BROCHURE_PAGES.length - 1 ? BROCHURE_PAGES[idx + 1] : null;
}
