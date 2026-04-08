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
 * Auto-blocks: detect standalone links to known embed domains and wrap in embed block.
 * @param {Element} main The main element
 */
function buildAutoBlocks(main) {
  const embedDomains = [
    'range-comparator.bmwlaunchpad.co.uk',
    'youtube.com',
    'youtu.be',
    'vimeo.com',
  ];

  main.querySelectorAll('a[href]').forEach((a) => {
    const p = a.closest('p');
    if (!p || p.textContent.trim() !== a.textContent.trim()) return;

    try {
      const url = new URL(a.href);
      const isEmbed = embedDomains.some((d) => url.hostname.includes(d));
      if (!isEmbed) return;

      // Wrap in an embed block table
      const table = document.createElement('div');
      const row = document.createElement('div');
      const cell = document.createElement('div');
      cell.append(a.cloneNode(true));
      row.append(cell);
      table.append(row);
      table.classList.add('embed');
      p.replaceWith(table);
    } catch {
      // invalid URL, skip
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
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
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

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  const footer = doc.querySelector('footer');
  if (getMetadata('footer') !== 'off') {
    loadFooter(footer);
  } else {
    footer.remove();
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  // Brochure pages: observe sections for scroll-triggered visibility
  if (document.body.classList.contains('x7-brochure')) {
    const sections = main.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.15 });
    sections.forEach((section) => observer.observe(section));
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
