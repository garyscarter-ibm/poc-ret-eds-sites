/**
 * Brochure Navigation Configuration
 * Supports multiple brochure types. Detects the active brochure from the URL path.
 */

const BROCHURES = {
  x7: {
    title: 'X7',
    basePath: '/brochures/x7',
    pages: [
      {
        id: 1, title: 'Introduction', url: '/brochures/x7/', thumbnail: '/brochures/x7/media_hero-intro.jpg',
      },
      {
        id: 2, title: 'Exterior Design', url: '/brochures/x7/exterior-design/', thumbnail: '/brochures/x7/media_hero-exterior.jpg',
      },
      {
        id: 3, title: 'Interior Design', url: '/brochures/x7/interior-design/', thumbnail: '/brochures/x7/media_hero-interior.jpg',
      },
      {
        id: 4, title: 'Discover Your Model', url: '/brochures/x7/discover-your-model/', thumbnail: '/brochures/x7/media_hero-discover.jpg',
      },
      {
        id: 5, title: 'Performance', url: '/brochures/x7/performance/', thumbnail: '/brochures/x7/media_hero-performance.jpg',
      },
      {
        id: 6, title: 'My BMW App', url: '/brochures/x7/my-bmw-app/', thumbnail: '/brochures/x7/media_hero-app.jpg',
      },
      {
        id: 7, title: 'Technology - Multimedia', url: '/brochures/x7/technology-multimedia/', thumbnail: '/brochures/x7/media_hero-multimedia.jpg',
      },
      {
        id: 8, title: 'Technology - Driving Assistance', url: '/brochures/x7/technology-driving-assistance/', thumbnail: '/brochures/x7/media_hero-driving.jpg',
      },
      {
        id: 9, title: 'BMW Ownership', url: '/brochures/x7/bmw-ownership/', thumbnail: '/brochures/x7/media_hero-ownership.jpg',
      },
      {
        id: 10, title: 'Next Steps', url: '/brochures/x7/next-steps/', thumbnail: '/brochures/x7/media_hero-next.jpg',
      },
    ],
  },
  s1000rr: {
    title: 'S 1000 RR',
    basePath: '/brochures/s1000rr',
    pages: [
      {
        id: 1, title: 'Introduction', url: '/brochures/s1000rr/', thumbnail: '/brochures/s1000rr/media_s1000rr-hero.jpg',
      },
      {
        id: 2, title: 'Key Features', url: '/brochures/s1000rr/key-features/', thumbnail: '/brochures/s1000rr/media_s1000rr-dtc.jpg',
      },
      {
        id: 3, title: 'Model Colours', url: '/brochures/s1000rr/model-colours/', thumbnail: '/brochures/s1000rr/media_s1000rr-grey.jpg',
      },
      {
        id: 4, title: 'Performance', url: '/brochures/s1000rr/performance/', thumbnail: '/brochures/s1000rr/media_s1000rr-engine.jpg',
      },
      {
        id: 5, title: 'HP Parts', url: '/brochures/s1000rr/hp-parts/', thumbnail: '/brochures/s1000rr/media_s1000rr-silencer.jpg',
      },
      {
        id: 6, title: 'Rider & Service', url: '/brochures/s1000rr/rider-service/', thumbnail: '/brochures/s1000rr/media_s1000rr-suit.jpg',
      },
    ],
  },
};

function detectBrochure() {
  const path = window.location.pathname.replace(/\/$/, '');
  const entries = Object.entries(BROCHURES);
  for (let i = 0; i < entries.length; i += 1) {
    const [, brochure] = entries[i];
    if (path.startsWith(brochure.basePath.replace(/\/$/, ''))) {
      return brochure;
    }
  }
  return null;
}

/**
 * Returns the active brochure config object.
 * @returns {object|null}
 */
export function getActiveBrochure() {
  return detectBrochure();
}

/**
 * Returns all brochure pages for the active brochure.
 * @returns {Array} Array of page objects
 */
export function getBrochurePages() {
  const brochure = detectBrochure();
  return brochure ? brochure.pages : [];
}

/**
 * Returns the current page object based on the current URL path.
 * @returns {object|null} Current page object or null
 */
export function getCurrentPage() {
  const brochure = detectBrochure();
  if (!brochure) return null;
  const path = window.location.pathname.replace(/\/$/, '');
  return brochure.pages.find((p) => {
    const pagePath = p.url.replace(/\/$/, '');
    return path === pagePath || path.endsWith(pagePath);
  }) || null;
}

/**
 * Returns the previous page relative to current, or null.
 * @returns {object|null}
 */
export function getPreviousPage() {
  const brochure = detectBrochure();
  if (!brochure) return null;
  const current = getCurrentPage();
  if (!current) return null;
  const idx = brochure.pages.indexOf(current);
  return idx > 0 ? brochure.pages[idx - 1] : null;
}

/**
 * Returns the next page relative to current, or null.
 * @returns {object|null}
 */
export function getNextPage() {
  const brochure = detectBrochure();
  if (!brochure) return null;
  const current = getCurrentPage();
  if (!current) return null;
  const idx = brochure.pages.indexOf(current);
  return idx < brochure.pages.length - 1 ? brochure.pages[idx + 1] : null;
}
