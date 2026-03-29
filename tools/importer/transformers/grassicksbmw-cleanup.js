/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: grassicksbmw cleanup.
 * Selectors from captured DOM of https://www.grassicksbmw.co.uk/
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie/privacy banner, chat widget, calendar shadowbox, skip link
    // Found in captured HTML: <div id="bmw-eprivacy-banner">, <div id="cct-widget-main">,
    // <div class="periodic-embedded-calendar-shadowbox">, <a class="skip-link">
    WebImporter.DOMUtils.remove(element, [
      '#bmw-eprivacy-banner',
      '#cct-widget-main',
      '.periodic-embedded-calendar-shadowbox',
      '.skip-link',
      '#livechat_rolnHost',
    ]);
  }
  if (hookName === H.after) {
    // Remove non-authorable site chrome: header, footer, navigation overlay
    // Found in captured HTML: <header>, <footer>, <nav id="menuOverlay" class="menu">
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav#menuOverlay',
      'noscript',
      'link',
      'iframe',
    ]);
  }
}
