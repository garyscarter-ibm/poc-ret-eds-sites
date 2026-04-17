/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Cotswold BMW cleanup.
 * Selectors from captured DOM of cotswoldcheltenhambmw.co.uk/about-us/
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie consent and alert banners (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '.alertArea',
      '[class*="cookie"]',
      '[class*="consent"]',
      '[id*="cookie"]',
      '[id*="consent"]',
      '[class*="eprivacy"]',
    ]);

    // Remove BMW site navigation and mega menus (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      'header',
      '.siteHeaderHolder',
      '.navHolder',
      '.megaMenu',
      '.menuDropHolder',
      '.mobileMenuHolder',
      'nav:not([aria-label])',
      '.skipToContent',
      '[class*="skipTo"]',
    ]);
  }
  if (hookName === H.after) {
    // Remove non-authorable site chrome (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      'footer',
      '.contentHolder.footer',
      '.breadcrumb',
      'nav[aria-label="Breadcrumb"]',
      '.leftFooter',
      '.socialFooter',
      'iframe',
      'link',
      'noscript',
      '.flickity-button',
      '.flickity-page-dots',
      '[class*="chat-widget"]',
    ]);

    // Remove the top-level navigation items that leak through
    // (BMW site has inline nav that isn't wrapped in header/nav elements)
    const main = element.querySelector('#main-content') || element.querySelector('.mainBodyHolder');
    if (main) {
      // Keep only the main content area, remove everything else
      const parent = main.parentElement;
      if (parent && parent !== element) {
        while (element.firstChild) element.firstChild.remove();
        while (main.firstChild) element.appendChild(main.firstChild);
      }
    }

    // Clean tracking attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('onclick');
      el.removeAttribute('data-analytics');
      el.removeAttribute('style');
    });
  }
}
