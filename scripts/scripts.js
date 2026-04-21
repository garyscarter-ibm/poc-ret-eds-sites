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
    } catch { /* continue */ }

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
const knownPages = new Set([
  '/', '/index', '/index-mini', '/index-bmw', '/index-bmw-da', '/index-bmw-da-new',
  '/about-us', '/about-us/',
  '/brochures/x7', '/brochures/x7/',
  '/brochures/x7/interior-design', '/brochures/x7/interior-design/',
  '/brochures/x7/exterior-design', '/brochures/x7/exterior-design/',
]);

function fixBrokenLinks(root) {
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
 * Rebrand: replace legacy retailer names with Strata across all visible text.
 * @param {Element} root The root element to process
 */
function rebrandContent(root) {
  const replacements = [
    [/Cotswold Cheltenham BMW/g, 'Strata BMW'],
    [/AN INTRODUCTION TO COTSWOLD MOTOR GROUP/g, 'Introducing Team Strata'],
    [/AN INTRODUCTION TO STRATA\./g, 'Introducing Team Strata'],
    [/Cotswold Motor Group/g, 'Strata'],
    [/BMW Cotswold/g, 'Strata BMW'],
    [/What does BMW Strata BMW/g, 'What does Strata BMW'],
    [/visiting Strata BMW with Strata/g, 'visiting Strata BMW'],
    [/Cotswold/g, 'Strata'],
    [/Cheltenham and Hereford, BMW Motorrad in Cheltenham, plus/g, 'plus'],
    [/in Cheltenham/g, 'with Strata'],
    [/Cheltenham as well as surrounding areas including Gloucester, Winchcombe, Stroud and Stonehouse\. Our/g, 'Our'],
    [/Cheltenham/g, 'Strata'],
    [/Grassicks MINI/g, 'Strata MINI'],
    [/Grassicks Perth/g, 'Strata'],
    [/Grassicks/g, 'Strata'],
    [/Perth/g, ''],
    [/Tewkesbury/g, 'our facilities'],
    [/Established in 1995.*PDI Centre[^.]*\./g, 'Team Strata is a meeting of minds \u2013 a collaboration between two organisations with diverse skillsets who share the same values. Between us, we have accumulated millions of hours of successful marketing projects, and we are trusted by some of the world\u2019s best brands \u2013 in automotive, financial services, sport, luxury, and more. Indeed, many of the logos on this slide are shared between both organisations. Taken together, we form the most exciting supergroup since McBusted - and we hope that you\u2019ll be fans.'],
    [/\bCAMERON\b/g, 'BILLY SEABROOK'],
    [/\bDeveloper\b/g, 'Global Chief Design Officer'],
    [/OUR CULTURE\./g, 'Our Culture'],
    [/We.re passionate that every customer.*treating each customer as an individual\./g, 'By combining our industry-leading digital development, marketing technology and campaign execution skills with creative and strategic excellence, we\u2019ve built a diverse team which is genuinely best-of-breed for each one of your requirements.'],
  ];

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent;
      replacements.forEach(([pattern, replacement]) => {
        text = text.replace(pattern, replacement);
      });
      if (text !== node.textContent) node.textContent = text;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach(walk);
    }
  };

  walk(root);

  // Link URLs are kept as original absolute URLs to avoid broken links
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  rebrandContent(main);
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
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    // Rebrand page title and meta tags
    if (document.title.includes('Cotswold') || document.title.includes('Cheltenham')) {
      document.title = document.title.replace(/Cotswold Cheltenham BMW/g, 'Strata BMW').replace(/Cotswold/g, 'Strata').replace(/Cheltenham/g, 'Strata');
    }
    document.querySelectorAll('meta[content*="Cotswold"], meta[content*="Cheltenham"]').forEach((meta) => {
      meta.content = meta.content.replace(/Cotswold Cheltenham BMW/g, 'Strata BMW').replace(/Cotswold/g, 'Strata').replace(/Cheltenham/g, 'Strata');
    });
    // Auto-detect MINI theme from block classes when no theme metadata is set
    if (!document.body.classList.contains('mini') && main.querySelector('.mini')) {
      document.body.classList.add('mini');
    }
    // Auto-detect Motorrad theme from block classes
    if (!document.body.classList.contains('motorrad') && main.querySelector('.motorrad')) {
      document.body.classList.add('motorrad');
    }
    // Auto-detect Brochure theme
    if (main.querySelector('.brochure-nav') || main.querySelector('.brochure-hero') || main.querySelector('.hero-brochure') || main.querySelector('.brochure-hero-cards') || getMetadata('theme') === 'brochure') {
      document.body.classList.add('brochure');
      await loadCSS(`${window.hlx.codeBasePath}/styles/brochure-theme.css`);
      // Set page title from brochure config
      try {
        const { getCurrentPage } = await import('./brochure-config.js');
        const page = getCurrentPage();
        if (page) document.title = `${page.title} - X7`;
      } catch { /* brochure config not available */ }
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

  // About Us page customizations
  if (window.location.pathname.startsWith('/about-us')) {
    main.querySelectorAll(':scope > div').forEach((section) => {
      const h2 = section.querySelector('h2');
      const heading = h2?.textContent.trim();
      if (heading === 'SECTION NAVIGATION.' || heading === 'ABOUT US.') {
        section.remove();
      }
    });

    // Replace "Introducing Team Strata" image
    const textMediaBlocks = main.querySelectorAll('.text-media');
    textMediaBlocks.forEach((tm) => {
      const p = tm.querySelector('p');
      if (p && p.textContent.includes('Introducing Team Strata')) {
        const img = tm.querySelector('img');
        if (img) {
          img.src = 'https://main--poc-ret-eds-sites--garyscarter-ibm.aem.page/grassicksbmw-homepage-images/introducing-team-strata-image.jpg';
          img.removeAttribute('width');
          img.removeAttribute('height');
        }
      }
      if (p && p.textContent.includes('Our Culture')) {
        const img = tm.querySelector('img');
        if (img) {
          img.src = 'https://main--poc-ret-eds-sites--garyscarter-ibm.aem.page/grassicksbmw-homepage-images/our-culture-image.jpg';
          img.removeAttribute('width');
          img.removeAttribute('height');
        }
      }
    });

    // Inject Billy Seabrook video into first cards-video card
    const firstCard = main.querySelector('.cards-video li');
    if (firstCard) {
      const mediaDiv = firstCard.querySelector('.cards-video-media');
      if (mediaDiv && !mediaDiv.querySelector('video')) {
        const video = document.createElement('video');
        video.setAttribute('controls', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('preload', 'metadata');
        video.setAttribute('poster', '');
        const source = document.createElement('source');
        source.src = 'https://main--poc-ret-eds-sites--garyscarter-ibm.aem.page/about-us-videos/bmwbillyvideo.mp4';
        source.type = 'video/mp4';
        video.append(source);
        mediaDiv.append(video);
      }
    }

    // Inject team member videos into cards-video cards (card index is 1-based nth-child)
    const teamVideos = [
      {
        card: 2, name: 'NICOLA', role: 'B2B Team Member', src: 'nic-p-video.mp4',
      },
      {
        card: 3, name: 'ELMIEN', role: 'BMW Client Partner', src: 'elmienvideo.mp4',
      },
      {
        card: 4, name: 'SARAH', role: 'Strategy Lead', src: 'sarahvideo.mp4',
      },
      {
        card: 5, name: 'BETH', role: 'Senior Account Director', src: 'beth-selfie-vid.mp4',
      },
      {
        card: 6, name: 'TRACY', role: 'Team Strata Executive Leader', src: 'tracey.mp4',
      },
    ];
    teamVideos.forEach(({
      card, name, role, src,
    }) => {
      const li = main.querySelector(`.cards-video li:nth-child(${card})`);
      if (!li) return;
      const h4 = li.querySelector('h4');
      const h3 = li.querySelector('h3');
      if (h4) h4.textContent = name;
      if (h3) h3.textContent = role;
      const comingSoon = li.querySelector('.cards-video-body p');
      if (comingSoon && comingSoon.textContent.includes('Video coming soon')) comingSoon.remove();
      const mediaDiv = li.querySelector('.cards-video-media');
      if (mediaDiv && !mediaDiv.querySelector('video')) {
        mediaDiv.innerHTML = '';
        const video = document.createElement('video');
        video.setAttribute('controls', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('preload', 'metadata');
        video.setAttribute('poster', '');
        const source = document.createElement('source');
        source.src = `https://main--poc-ret-eds-sites--garyscarter-ibm.aem.page/about-us-videos/${src}`;
        source.type = 'video/mp4';
        video.append(source);
        mediaDiv.append(video);
      }
    });
  }

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
    new MutationObserver(() => { rebrandContent(headerEl); fixBrokenLinks(headerEl); })
      .observe(headerEl, { childList: true, subtree: true });
  }
  if (footerEl) {
    new MutationObserver(() => { rebrandContent(footerEl); fixBrokenLinks(footerEl); })
      .observe(footerEl, { childList: true, subtree: true });
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
      if (text.includes('header') && text.includes('footer') && text.includes('brochure')) {
        lastSection.remove();
      }
    }

    const { prepareBrochureAnimations, initBrochureAnimations } = await import('./brochure-animations.js');
    prepareBrochureAnimations(main);
    initBrochureAnimations(main);
  }

  // Motorrad: animate section dividers on scroll
  if (document.body.classList.contains('motorrad')) {
    const observer = new IntersectionObserver((entries) => {
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
    }, { threshold: 0.1 });
    main.querySelectorAll('.default-content-wrapper > h2').forEach((h2) => observer.observe(h2));
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
