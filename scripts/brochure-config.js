/**
 * BMW X7 Brochure Navigation Configuration
 * Defines page order, titles, and URLs for the brochure navigation.
 */

const BROCHURE_PAGES = [
  {
    id: 1,
    title: 'Introduction',
    url: '/brochures/x7/',
    thumbnail: '/brochures/x7/media_hero-intro.jpg',
  },
  {
    id: 2,
    title: 'Exterior Design',
    url: '/brochures/x7/exterior-design',
    thumbnail: '/brochures/x7/media_hero-exterior.jpg',
  },
  {
    id: 3,
    title: 'Interior Design',
    url: '/brochures/x7/interior-design',
    thumbnail: '/brochures/x7/media_hero-interior.jpg',
  },
  {
    id: 4,
    title: 'Discover Your Model',
    url: '/brochures/x7/discover-your-model',
    thumbnail: '/brochures/x7/media_hero-discover.jpg',
  },
  {
    id: 5,
    title: 'Performance',
    url: '/brochures/x7/performance',
    thumbnail: '/brochures/x7/media_hero-performance.jpg',
  },
  {
    id: 6,
    title: 'My BMW App',
    url: '/brochures/x7/my-bmw-app',
    thumbnail: '/brochures/x7/media_hero-app.jpg',
  },
  {
    id: 7,
    title: 'Technology - Multimedia',
    url: '/brochures/x7/technology-multimedia',
    thumbnail: '/brochures/x7/media_hero-multimedia.jpg',
  },
  {
    id: 8,
    title: 'Technology - Driving Assistance',
    url: '/brochures/x7/technology-driving-assistance',
    thumbnail: '/brochures/x7/media_hero-driving.jpg',
  },
  {
    id: 9,
    title: 'BMW Ownership',
    url: '/brochures/x7/bmw-ownership',
    thumbnail: '/brochures/x7/media_hero-ownership.jpg',
  },
  {
    id: 10,
    title: 'Next Steps',
    url: '/brochures/x7/next-steps',
    thumbnail: '/brochures/x7/media_hero-next.jpg',
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
  const path = window.location.pathname.replace(/\/$/, '');
  return BROCHURE_PAGES.find((p) => {
    const pagePath = p.url.replace(/\/$/, '');
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
