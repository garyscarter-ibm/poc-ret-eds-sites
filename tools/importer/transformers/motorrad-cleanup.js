/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: BMW Motorrad dealer site cleanup.
 * Selectors from captured DOM of bmw-motorrad.co.uk/cotswold-cheltenham
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Cookie layers and consent overlays
    WebImporter.DOMUtils.remove(element, [
      'section.cookielayer',
      '.cookielayer',
      '.mnm-cookieoverlay',
      '.map__cookies-disabled',
      '.c-content-modal',
      '.c-content-modal__backdrop',
    ]);

    // Dealer toolbar (overlay navigation with share buttons)
    WebImporter.DOMUtils.remove(element, [
      '.dealertoolbar',
      '.dealertoolbar__wrapper',
    ]);

    // Bike price details modal (hidden pricing widget)
    WebImporter.DOMUtils.remove(element, [
      '.bikepricedetails',
      '.bike-price-details',
    ]);

    // Map tiles and Google Maps embed (captured as many img tiles)
    WebImporter.DOMUtils.remove(element, [
      '.map__container',
      '.mnm-map-container',
      '[class*="map__fallback"]',
      '[class*="map__cookies"]',
    ]);

    // Remove all Google Maps tile images (they appear as img with maps.googleapis.com or maps.gstatic.com)
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.includes('maps.googleapis.com') || src.includes('maps.gstatic.com')) {
        const parent = img.closest('p') || img.parentElement;
        if (parent) parent.remove();
        else img.remove();
      }
    });

    // Remove "Read more" gradient overlay images
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.includes('readmore_gradient')) {
        const wrapper = img.closest('.readmore') || img.closest('p') || img.parentElement;
        if (wrapper) wrapper.remove();
        else img.remove();
      }
    });

    // Remove "Read more" / "+ Read more" text elements
    element.querySelectorAll('.readmore, [class*="readmore"]').forEach((el) => el.remove());
    element.querySelectorAll('p, div, span').forEach((el) => {
      if (el.textContent.trim() === '+ Read more' || el.textContent.trim() === 'Read more') {
        el.remove();
      }
    });

    // Remove mobile-only duplicate content (captured DOM has both mobile and desktop headings)
    WebImporter.DOMUtils.remove(element, [
      '.mobile-teaser-headline',
      '.mnm-if-mobile-or-tablet-portrait',
      '.mnm-dc-if-mobile',
      '[class*="mobile-teaser"]',
    ]);

    // Remove keyboard shortcuts helper table from maps
    element.querySelectorAll('div').forEach((div) => {
      const codes = div.querySelectorAll('code');
      if (codes.length >= 4) {
        const text = Array.from(codes).map((c) => c.textContent).join('');
        if (text.includes('→') && text.includes('↑') && text.includes('+')) {
          div.remove();
        }
      }
    });

    // Remove Google Maps legal/attribution text
    element.querySelectorAll('p').forEach((p) => {
      const text = p.textContent.trim();
      if (text.includes('Map data ©') || text.includes('Map DataMap') ||
          text.includes('Keyboard shortcuts') || text.includes('Click to toggle between metric') ||
          text.includes('Report a map error') || text === '100 m' ||
          text.includes('Cookie consent required to use location service') ||
          text === 'Activate') {
        p.remove();
      }
    });

    // Remove empty paragraphs with only links that have no href content
    element.querySelectorAll('p').forEach((p) => {
      const links = p.querySelectorAll('a');
      if (links.length > 0 && !p.textContent.trim()) {
        p.remove();
      }
    });

    // Remove SVG icons that are just UI elements (spinner, close, badge icons)
    element.querySelectorAll('img[src*="spinner"], img[src*="close.svg"], img[src*="badge-right"]').forEach((img) => {
      const wrapper = img.closest('p') || img.parentElement;
      if (wrapper && !wrapper.querySelector('img:not([src*="spinner"]):not([src*="close"]):not([src*="badge"])')) {
        wrapper.remove();
      } else {
        img.remove();
      }
    });

    // Fix blob: URLs to actual content DAM URLs where possible
    // The page uses blob URLs for images loaded via JavaScript
    // Replace them with the actual content DAM paths from data attributes
    element.querySelectorAll('img[src^="blob:"]').forEach((img) => {
      // Try to get alt text and match to known images
      const alt = (img.getAttribute('alt') || '').toLowerCase();
      const src = img.getAttribute('src');

      // Map known images by alt text to their actual DAM URLs
      const imageMap = {
        'cotswold motorrad': '/content/dam/bmwmotorradnsc/marketGB_DEALER/www_cotswold-cheltenham_bmw-motorrad_co_uk/cotswold-motorrad-header-image.jpg',
        'driver sat on a motorbike': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/stocklocator1920x1080.jpg',
        '2 motorcyclist on bmw motorbikes riding on a road with the sun': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/demo-tour-snippet-1920x1080.jpg',
        '2 motorcyclist on bmw motorbikes riding on a road': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/nsc-brand-campaign-2026-mediacopy-03.jpg',
        'rider walking towards a used red': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/approvedusedbikes1920x1080.jpeg',
        'black premium bmw motorbike': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/r181920x1080.jpg',
        'bmw motorrad employee servicing': '/content/dam/bmwmotorradnsc/common/dealer_master/home/services/Home_Productservice3.jpg',
        'man signing bmw finance': '/content/dam/bmwmotorradnsc/common/dealer_master/home/services/Home_Productservice6.jpg',
        'man walking while taking off white helmet': '/content/dam/bmwmotorradnsc/common/dealer_master/home/services/Home_Productservice1.jpg',
        'woman pushing bmw motorbike': '/content/dam/bmwmotorradnsc/common/dealer_master/home/services/Home_Productservice2jpg.jpg',
        'blue bmw f 900 r motorbike': '/content/dam/bmwmotorradnsc/marketGB/bmw-motorrad_co_uk/multiimages/r1300rt2.jpg',
        'blue bmw f 450 gs': '/content/dam/bmwmotorradnsc/marketGB/bmw-motorrad_co_uk/multiimages/f450gs-1920x1080.jpg',
        'driver on a new bmw motorbike riding through': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/perfectbmw1920x1080.jpg',
        'group of bmw motorbike riders on race track': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/motorrad-performance-academy.jpg',
        'rookie to rider instructor': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/r2r1920x1080.jpg',
        'man in a bmw motorbike service garage on the phone': '/content/dam/bmwmotorradnsc/common/dealer_master/home/services/Home_Service_Kontakt.jpg',
        'people trying out a bmw motorbike': '/content/dam/bmwmotorradnsc/common/dealer_master/home/services/Home_Mehr_Sein_Shop.jpg',
        'person getting on a bmw bike': '/content/dam/bmwmotorradnsc/common/multiimages/images/experience/stories/sport/hp4race_chasing_the_impossible/HP4RACE-0E31-YN2E-story-cti-media-copy-peter-hickman-1920x1080-1.jpg',
        'bmw f 900 r motorbike parked on a rooftop': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/f-900-r-highlight-offers-roln.jpg',
        'person riding a red bmw motorbike': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/f900-xr-highlight-offers-roln.jpg',
        'woman stood beside a bmw motorbike': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/r-12-highlight-offers-roln.jpg',
        'two bmw motorbikes parked side by side': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/s1000-xr-highlight-offers-roln.jpg',
        'motorcyclist riding through a road surrounded by wheat': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/k-1600-gt-se-carousel.jpg',
        '2 bmw motorbikes parked side by side': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/q2-trade-in-offer-1920x1080.jpg',
        'person riding bmw motorbike into the sunset': '/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/luggage-offer-1920x1080.jpg',
        'man pushing bmw motorbike into': '/content/dam/bmwmotorradnsc/common/dealer_master/home/ueber_uns/Home_Ueber_Uns.jpg',
        'rider on a bmw motorbike riding in the countryside': '/content/dam/bmwmotorradnsc/common/dealer_master/home/Home_Probefahrt.jpg',
      };

      for (const [key, damUrl] of Object.entries(imageMap)) {
        if (alt.includes(key)) {
          img.setAttribute('src', `https://www.bmw-motorrad.co.uk${damUrl}`);
          break;
        }
      }
    });

    // Remove remaining blob: images that couldn't be mapped
    element.querySelectorAll('img[src^="blob:"]').forEach((img) => {
      // Check if it's inside a meaningful container
      const parent = img.closest('p');
      if (parent && parent.children.length === 1) {
        parent.remove();
      }
    });

    // Remove the asterisk, price disclaimer, and other non-content elements at the top
    const firstChildren = element.querySelectorAll(':scope > p, :scope > div > p');
    firstChildren.forEach((p) => {
      const text = p.textContent.trim();
      if (text === '*' || text.startsWith('*All prices include VAT') ||
          text.startsWith('All motorcycles are delivered with the legally required')) {
        p.remove();
      }
    });

    // Remove empty javascript:void links
    element.querySelectorAll('a[href="javascript:void(0);"], a[href="#"]').forEach((a) => {
      const parent = a.closest('p');
      if (parent && parent.querySelectorAll('a').length === parent.children.length && !parent.textContent.trim()) {
        parent.remove();
      }
    });

    // Fix overflow for lazy-loaded content
    element.querySelectorAll('[style*="overflow: hidden"]').forEach((el) => {
      el.style.overflow = 'visible';
    });
  }

  if (hookName === H.after) {
    // Remove non-authorable site shell
    WebImporter.DOMUtils.remove(element, [
      'header#pageHeader',
      '#pageHeader',
      '.navigationContainer',
      'nav.mainnavigation',
      'footer#pageFooter',
      '#pageFooter',
      'section.footernavigation',
      '.dealertoolbar',
      '.login-flyout',
      '.dealer-flyout',
      '.skip-content',
      'img[alt="spinner"]',
      'iframe',
      'link',
      'noscript',
    ]);

    // Remove duplicate opening hours/service tabs (the page has both sale and service tabs)
    const serviceTabs = element.querySelectorAll('.dealercontact__panel-wrapper.dealercontact__openingtimes.mnm-service-tab');
    serviceTabs.forEach((tab) => tab.remove());

    // Remove duplicate mobile tab labels
    WebImporter.DOMUtils.remove(element, [
      '.mnm-service-label-mobile',
      '.mnm-sale-label-mobile',
    ]);

    // Clean tracking attributes
    element.querySelectorAll('[data-track]').forEach((el) => el.removeAttribute('data-track'));
    element.querySelectorAll('[onclick]').forEach((el) => el.removeAttribute('onclick'));

    // Remove carousel pagination elements (arrows, dots, counters)
    element.querySelectorAll('.splide__legacy-carousel-pagination, .carousel__pagination, .splide__arrows').forEach((el) => el.remove());

    // Remove empty paragraphs
    element.querySelectorAll('p').forEach((p) => {
      if (!p.textContent.trim() && !p.querySelector('img, a')) {
        p.remove();
      }
    });

    // Remove Google Maps legal text that may still remain
    element.querySelectorAll('p').forEach((p) => {
      const text = p.textContent.trim();
      if (text.startsWith('By using Google Maps')) {
        p.remove();
      }
    });
  }
}
