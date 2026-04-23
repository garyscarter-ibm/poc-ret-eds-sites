import {
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  getMetadata,
} from './aem.js';

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Decorates formatted links to style them as buttons.
 * @param {HTMLElement} main The main container element
 */
function decorateButtons(main) {
  main.querySelectorAll('p a[href]').forEach((a) => {
    a.title = a.title || a.textContent;
    const p = a.closest('p');
    const text = a.textContent.trim();

    if (a.querySelector('img') || p.textContent.trim() !== text) return;

    try {
      if (new URL(a.href).href === new URL(text, window.location).href) return;
    } catch {
      /* continue */
    }

    const strong = a.closest('strong');
    const em = a.closest('em');
    if (!strong && !em) return;

    p.className = 'button-wrapper';
    a.className = 'button';
    if (strong && em) {
      a.classList.add('accent');
      const outer = strong.contains(em) ? strong : em;
      outer.replaceWith(a);
    } else if (strong) {
      a.classList.add('primary');
      strong.replaceWith(a);
    } else {
      a.classList.add('secondary');
      em.replaceWith(a);
    }
  });
}

/**
 * Auto-block: inject brochure-locked section on brochure pages
 * if not already present, before the CTA cards section.
 * @param {Element} main The main element
 */
function buildAutoBlocks(main) {
  const isBrochure = main.querySelector('.brochure-nav')
    || main.querySelector('.brochure-hero')
    || main.querySelector('.hero-brochure');
  if (!isBrochure) return;

  // Skip if brochure-locked already exists
  if (main.querySelector('.brochure-locked')) return;

  // Find the CTA cards section to insert before
  const ctaCards = main.querySelector('.brochure-cta-cards');
  if (!ctaCards) return;

  // Walk up to the top-level div (direct child of main) that wraps the CTA cards
  let ctaTopLevel = ctaCards;
  while (ctaTopLevel.parentElement && ctaTopLevel.parentElement !== main) {
    ctaTopLevel = ctaTopLevel.parentElement;
  }

  // Build the locked section as a top-level div (becomes its own section)
  const lockedSection = document.createElement('div');
  lockedSection.innerHTML = '<div class="brochure-locked"><div><div></div></div></div>';
  main.insertBefore(lockedSection, ctaTopLevel);
}

/**
 * Fix broken internal links by mapping them to working destinations.
 * @param {Element} root The root element to process
 */
const brokenLinkMap = {
  '/realtime-booking-form': '/about-us',
  '/realtime-booking-form/': '/about-us',
  '/appointment-booking-form': '/about-us',
  '/appointment-booking-form/': '/about-us',
  '/contact-us': '/about-us',
  '/contact-us/': '/about-us',
  '/contact-us/#form': '/about-us',
  '/bmw-electric/': '/about-us',
  '/sell-your-bmw/': '/about-us',
  '/vacancies/': '/about-us',
  '/hero-content/site-terms-and-conditions/': '/about-us',
  '/hero-content/site-cookies/': '/about-us',
  '/hero-content/site-complaints-procedure/': '/about-us',
  '/modern-slavery-statement/': '/about-us',
  '/content/speak-up-line/': '/about-us',
  '/hero-content/site-privacy-policy/': '/about-us',
  '/hero-content/site-company-information/': '/about-us',
  '/motor-industry-code-of-practice/': '/about-us',
  '/product-safety-enquiry/': '/about-us',
  '/about-us/news-events': '/about-us',
  '/about-us/news-events/': '/about-us',
  '/about-us/customer-reviews': '/about-us',
  '/about-us/customer-reviews/': '/about-us',
};

const brokenExternalLinkMap = {
  'https://www.bmw.co.uk/en/test-drive.html': '/about-us',
  'https://www.bmw.co.uk/en/topics/owners/bmw-service.html': '/about-us',
  'https://www.bmw.co.uk/en/electric.html': '/about-us',
  'https://www.bmw.co.uk/en/topics/owners/sell-your-bmw.html': '/about-us',
  'https://www.grassicksmini.co.uk/': '/about-us',
  'https://www.strata.com/careers/': '/about-us',
  'https://usedcars.bmw.co.uk/retailer-groups/eastern': '/about-us',
  'https://usedcars.bmw.co.uk/': '/about-us',
  'https://www.cotswoldgroup.com/careers/': '/about-us',
};

// Known content pages that exist in the site
// Known content pages that exist in the site
const knownPages = new Set([
  '/',
  '/index',
  '/index-mini',
  '/index-bmw',
  '/about-us',
  '/about-us/',
  '/brochures/x7',
  '/brochures/x7/',
  '/brochures/x7/interior-design',
  '/brochures/x7/interior-design/',
  '/brochures/x7/exterior-design',
  '/brochures/x7/exterior-design/',
]);

// Nav links that use "#" as placeholder but should point to real pages
const hashLinkFixMap = {
  'about us': '/about-us',
};

function fixBrokenLinks(root) {
  // Fix "#" placeholder links by matching on link text
  root.querySelectorAll('a[href="#"]').forEach((a) => {
    const text = a.textContent.trim().toLowerCase();
    if (hashLinkFixMap[text]) {
      a.href = hashLinkFixMap[text];
    }
  });
  root.querySelectorAll('a[href^="/"]').forEach((a) => {
    const href = a.getAttribute('href');
    // First check the explicit map
    if (brokenLinkMap[href]) {
      a.href = brokenLinkMap[href];
      return;
    }
    // Then check if it's a known page — if not, redirect to current page
    const cleanPath = href.split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
    if (!knownPages.has(cleanPath) && !knownPages.has(`${cleanPath}/`)) {
      a.href = window.location.pathname;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  });
  root.querySelectorAll('a[href^="http"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (brokenExternalLinkMap[href]) {
      a.href = brokenExternalLinkMap[href];
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  buildAutoBlocks(main);
  decorateIcons(main);
  decorateSections(main);
  decorateBlocks(main);
  decorateButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  // Redirect root to BMW homepage
  const path = window.location.pathname;
  if (path === '/' || path === '/index') {
    window.location.replace('/index-bmw');
    return;
  }

  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    // Auto-detect MINI theme from block classes when no theme metadata is set
    if (
      !document.body.classList.contains('mini')
      && main.querySelector('.mini')
    ) {
      document.body.classList.add('mini');
    }
    // Auto-detect Motorrad theme from block classes
    if (
      !document.body.classList.contains('motorrad')
      && main.querySelector('.motorrad')
    ) {
      document.body.classList.add('motorrad');
    }
    // Auto-detect Brochure theme
    if (
      main.querySelector('.brochure-nav')
      || main.querySelector('.brochure-hero')
      || main.querySelector('.hero-brochure')
      || main.querySelector('.brochure-hero-cards')
      || getMetadata('theme') === 'brochure'
    ) {
      document.body.classList.add('brochure');
      await loadCSS(`${window.hlx.codeBasePath}/styles/brochure-theme.css`);
      // Set page title from brochure config
      try {
        const { getCurrentPage } = await import('./brochure-config.js');
        const page = getCurrentPage();
        if (page) document.title = `${page.title} - X7`;
      } catch {
        /* brochure config not available */
      }
    }
    document.body.classList.add('appear');
    await loadCSS(`${window.hlx.codeBasePath}/styles/shared-components.css`);
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  try {
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const header = doc.querySelector('header');
  if (getMetadata('header') !== 'off') {
    loadHeader(header);
  } else {
    header.remove();
  }

  const main = doc.querySelector('main');
  await loadSections(main);

  // Fix broken internal links site-wide
  fixBrokenLinks(doc);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  const footer = doc.querySelector('footer');
  if (getMetadata('footer') !== 'off') {
    loadFooter(footer);
  } else {
    footer.remove();
  }

  // Rebrand header and footer after they load
  const headerEl = doc.querySelector('header');
  const footerEl = doc.querySelector('footer');
  if (headerEl) {
    if (headerEl.children.length > 0) {
      rebrandContent(headerEl);
    }
    new MutationObserver(() => {
      rebrandContent(headerEl);
      fixBrokenLinks(headerEl);
    }).observe(headerEl, { childList: true, subtree: true });
  }
  if (footerEl) {
    new MutationObserver(() => {
      rebrandContent(footerEl);
      fixBrokenLinks(footerEl);
    }).observe(footerEl, { childList: true, subtree: true });
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  // Brochure: scroll-triggered section animations and metadata cleanup
  if (document.body.classList.contains('brochure')) {
    // Hide metadata section (last section with plain-text key/value pairs)
    const sections = main.querySelectorAll('.section');
    const lastSection = sections[sections.length - 1];
    if (lastSection && !lastSection.querySelector('[class*="brochure-"]')) {
      const text = lastSection.textContent.trim();
      if (
        text.includes('header')
        && text.includes('footer')
        && text.includes('brochure')
      ) {
        lastSection.remove();
      }
    }

    const { prepareBrochureAnimations, initBrochureAnimations } = await import('./brochure-animations.js');
    prepareBrochureAnimations(main);
    initBrochureAnimations(main);
  }

  // Motorrad: animate section dividers on scroll
  if (document.body.classList.contains('motorrad')) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // After first full animation, mark as "seen" for simpler re-entry
            if (!entry.target.classList.contains('seen')) {
              setTimeout(() => entry.target.classList.add('seen'), 1200);
            }
          } else {
            entry.target.classList.remove('visible');
          }
        });
      },
      { threshold: 0.1 },
    );
    main
      .querySelectorAll('.default-content-wrapper > h2')
      .forEach((h2) => observer.observe(h2));
  }
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
