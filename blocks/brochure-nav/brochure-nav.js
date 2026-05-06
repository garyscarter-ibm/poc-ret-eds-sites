import {
  getBrochurePages,
  getActiveBrochure,
  getCurrentPage,
  getPreviousPage,
  getNextPage,
} from '../../scripts/brochure-config.js';

function createPageArrows() {
  const prev = getPreviousPage();
  const next = getNextPage();

  const container = document.createElement('div');
  container.className = 'brochure-page-arrows';

  const prevBtn = document.createElement('a');
  prevBtn.className = 'brochure-arrow-btn brochure-arrow-prev';
  if (prev) {
    prevBtn.href = prev.url;
    prevBtn.setAttribute('aria-label', `Previous: ${prev.title}`);
  } else {
    prevBtn.classList.add('disabled');
    prevBtn.setAttribute('aria-disabled', 'true');
  }
  prevBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const nextBtn = document.createElement('a');
  nextBtn.className = 'brochure-arrow-btn brochure-arrow-next';
  if (next) {
    nextBtn.href = next.url;
    nextBtn.setAttribute('aria-label', `Next: ${next.title}`);
  } else {
    nextBtn.classList.add('disabled');
    nextBtn.setAttribute('aria-disabled', 'true');
  }
  nextBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  container.append(prevBtn, nextBtn);
  return container;
}

function createMobileOverlay(pages, current) {
  const overlay = document.createElement('div');
  overlay.className = 'brochure-nav-mobile-overlay';
  overlay.hidden = true;

  const header = document.createElement('div');
  header.className = 'brochure-nav-mobile-header';
  header.innerHTML = '<span class="brochure-nav-mobile-title">Pages</span>';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'brochure-nav-mobile-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  header.append(closeBtn);

  const tileGrid = document.createElement('div');
  tileGrid.className = 'brochure-nav-mobile-tiles';

  pages.forEach((page) => {
    const tile = document.createElement('a');
    tile.href = page.url;
    tile.className = 'brochure-nav-mobile-tile';
    if (current && current.id === page.id) tile.classList.add('active');

    if (page.thumbnail) {
      tile.style.backgroundImage = `url('${page.thumbnail}')`;
    }
    tile.innerHTML = `<span class="brochure-nav-tile-label">${String(page.id).padStart(2, '0')} ${page.title}</span>`;
    tileGrid.append(tile);
  });

  overlay.append(header, tileGrid);

  closeBtn.addEventListener('click', () => {
    overlay.hidden = true;
    document.body.style.overflow = '';
  });

  return overlay;
}

export default async function decorate(block) {
  const pages = getBrochurePages();
  const current = getCurrentPage();

  // === Top navigation bar ===
  const navbar = document.createElement('nav');
  navbar.className = 'brochure-navbar';
  navbar.setAttribute('aria-label', 'Brochure navigation');

  // Left section: Logo + hamburger
  const leftSection = document.createElement('div');
  leftSection.className = 'brochure-nav-left';

  const brochure = getActiveBrochure();
  const isMotorrad = brochure && brochure.basePath.includes('s1000rr');
  const logoSrc = isMotorrad ? '/icons/bmw-motorrad-logo.svg' : '/icons/bmw-logo.svg';
  const logoAlt = isMotorrad ? 'BMW Motorrad' : 'BMW';

  const logo = document.createElement('a');
  logo.href = pages[0].url;
  logo.className = 'brochure-nav-logo';
  logo.setAttribute('aria-label', logoAlt);
  logo.innerHTML = `<img src="${logoSrc}" alt="${logoAlt}" width="28" height="28">`;

  const hamburger = document.createElement('button');
  hamburger.className = 'brochure-nav-hamburger';
  hamburger.setAttribute('aria-label', 'Index');
  hamburger.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  leftSection.append(logo, hamburger);

  // Center section: tab strip (desktop only)
  const tabStrip = document.createElement('div');
  tabStrip.className = 'brochure-nav-tabs';
  tabStrip.setAttribute('role', 'menubar');

  pages.forEach((page) => {
    const divider = document.createElement('span');
    divider.className = 'brochure-nav-divider';
    tabStrip.append(divider);
    const tab = document.createElement('a');
    tab.href = page.url;
    tab.className = 'brochure-nav-tab';
    tab.setAttribute('role', 'menuitem');
    tab.textContent = page.title;
    if (current && current.id === page.id) {
      tab.classList.add('active');
      tab.setAttribute('aria-current', 'page');
    }
    tabStrip.append(tab);
  });

  // Trailing divider after last tab
  const trailingDivider = document.createElement('span');
  trailingDivider.className = 'brochure-nav-divider';
  tabStrip.append(trailingDivider);

  // Right section: search icon
  const rightSection = document.createElement('div');
  rightSection.className = 'brochure-nav-right';

  const searchBtn = document.createElement('button');
  searchBtn.className = 'brochure-nav-search';
  searchBtn.setAttribute('aria-label', 'Search');
  searchBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  rightSection.append(searchBtn);
  navbar.append(leftSection, tabStrip, rightSection);

  // === Fixed page arrows (bottom-right) ===
  const arrows = createPageArrows();

  // === Mobile overlay ===
  const mobileOverlay = createMobileOverlay(pages, current);

  // Toggle mobile overlay
  hamburger.addEventListener('click', () => {
    mobileOverlay.hidden = !mobileOverlay.hidden;
    document.body.style.overflow = mobileOverlay.hidden ? '' : 'hidden';
  });

  // Clear block and append
  block.textContent = '';
  block.append(navbar, arrows, mobileOverlay);

  // Apply brochure theme to body
  document.body.classList.add('brochure');
}
