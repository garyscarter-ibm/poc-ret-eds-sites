import queryAPI from '../../scripts/used-cars-api.js';
import {
  formatPrice,
  formatMileage,
  formatFuelType,
  formatTransmission,
  formatMonthly,
} from '../../scripts/used-cars-config.js';
import { loadCSS } from '../../scripts/aem.js';

/* ---------- GraphQL ---------- */

const SEARCH_QUERY = `query SearchVehicles($input: UsedVehicleSearchInput!) {
  searchUsedVehicles(input: $input) {
    totalCount
    vehicles {
      id
      series
      model
      price
      estimatedMonthlyPayment
      mileage
      fuelType
      transmission
      registrationDate
      bodyType
      images { url alt order }
      dealer { name }
    }
    facets {
      series { value count }
      bodyTypes { value count }
      fuelTypes { value count }
    }
  }
}`;

/* ---------- Helpers ---------- */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

function getVehicleImage(vehicle) {
  if (!vehicle.images || !vehicle.images.length) return '';
  const sorted = [...vehicle.images].sort((a, b) => a.order - b.order);
  return sorted[0].url;
}

function getYear(vehicle) {
  if (!vehicle.registrationDate) return '';
  return new Date(vehicle.registrationDate).getFullYear();
}

const SVG_CHEVRON_LEFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';
const SVG_CHEVRON_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
const SVG_BMW_LOGO = '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="none" stroke="#000" stroke-width="3"/><path d="M32 2A30 30 0 0 1 62 32H32V2z" fill="#0066B1"/><path d="M32 2A30 30 0 0 0 2 32h30V2z" fill="#fff"/><path d="M32 62A30 30 0 0 1 2 32h30v30z" fill="#0066B1"/><path d="M32 62A30 30 0 0 0 62 32H32v30z" fill="#fff"/></svg>';

/* ---------- State ---------- */

let vehicles = [];
let currentIndex = 0;
let activeFilter = { type: 'all', value: 'all' };
let facets = {};

/* ---------- DOM references ---------- */
let blockEl;
let backdropImageEl;
let heroImageEl;
let infoLeftEl;
let infoRightEl;
let carouselTrackEl;
let progressEl;
let counterCurrentEl;
let counterTotalEl;

/* ---------- Leaf update functions ---------- */

function updateThumbnails() {
  if (!carouselTrackEl) return;
  const thumbs = carouselTrackEl.querySelectorAll('.vs-thumb');
  thumbs.forEach((thumb, i) => {
    thumb.classList.toggle('vs-thumb--active', i === currentIndex);
  });
  const activeThumb = thumbs[currentIndex];
  if (activeThumb) {
    activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

function updateProgress() {
  if (!progressEl) return;
  const dots = progressEl.querySelectorAll('.vs-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('vs-dot--active', i === currentIndex);
  });
}

function updateCounter() {
  if (counterCurrentEl) counterCurrentEl.textContent = currentIndex + 1;
  if (counterTotalEl) counterTotalEl.textContent = vehicles.length;
}

function updateBackdrop(imageUrl) {
  if (!backdropImageEl || !imageUrl) return;
  const newBg = el('div', 'vs-backdrop-image');
  newBg.style.backgroundImage = `url(${imageUrl})`;
  const parent = backdropImageEl.parentElement;
  const existing = parent.querySelector('.vs-backdrop-image');
  if (existing) existing.classList.add('vs-exiting');
  parent.insertBefore(newBg, parent.firstChild);
  backdropImageEl = newBg;
  setTimeout(() => {
    parent.querySelectorAll('.vs-exiting').forEach((o) => o.remove());
  }, 900);
}

/* ---------- Update hero ---------- */

function updateHero(vehicle) {
  if (!heroImageEl) return;
  const imageUrl = getVehicleImage(vehicle);

  heroImageEl.classList.add('vs-exiting');
  heroImageEl.classList.remove('vs-entering');

  setTimeout(() => {
    heroImageEl.src = imageUrl;
    heroImageEl.alt = vehicle.model;
    heroImageEl.classList.remove('vs-exiting');
    heroImageEl.classList.add('vs-entering');
  }, 400);

  if (infoLeftEl) {
    infoLeftEl.classList.add('vs-entering');
    infoLeftEl.innerHTML = `
      <div class="vs-accent-bar"></div>
      <p class="vs-series">${vehicle.series || ''}</p>
      <h1 class="vs-model">${vehicle.model}</h1>
      <p class="vs-year">${getYear(vehicle)}</p>
      <div class="vs-specs-list">
        <div class="vs-spec-row">
          <span class="vs-spec-label">Mileage</span>
          <span class="vs-spec-value">${formatMileage(vehicle.mileage)}</span>
        </div>
        <div class="vs-spec-row">
          <span class="vs-spec-label">Trans</span>
          <span class="vs-spec-value">${formatTransmission(vehicle.transmission)}</span>
        </div>
        <div class="vs-spec-row">
          <span class="vs-spec-label">Fuel</span>
          <span class="vs-spec-value">${formatFuelType(vehicle.fuelType)}</span>
        </div>
      </div>
    `;
    setTimeout(() => infoLeftEl.classList.remove('vs-entering'), 600);
  }

  if (infoRightEl) {
    infoRightEl.classList.add('vs-entering');
    const monthlyHtml = vehicle.estimatedMonthlyPayment
      ? `<p class="vs-monthly">${formatMonthly(vehicle.estimatedMonthlyPayment)}</p>`
      : '';
    const locationHtml = vehicle.dealer
      ? `<p class="vs-location">${vehicle.dealer.name}</p>`
      : '';
    infoRightEl.innerHTML = `
      <p class="vs-price-label">Price</p>
      <div class="vs-price">
        <div class="vs-price-glow"></div>
        ${formatPrice(vehicle.price)}
      </div>
      ${monthlyHtml}
      ${locationHtml}
    `;
    setTimeout(() => infoRightEl.classList.remove('vs-entering'), 600);
  }

  updateBackdrop(imageUrl);
  updateThumbnails();
  updateProgress();
  updateCounter();
}

/* ---------- Navigation ---------- */

function goTo(index) {
  if (index < 0 || index >= vehicles.length) return;
  currentIndex = index;
  updateHero(vehicles[currentIndex]);
}

function goNext() {
  goTo((currentIndex + 1) % vehicles.length);
}

function goPrev() {
  goTo(currentIndex === 0 ? vehicles.length - 1 : currentIndex - 1);
}

function navigateToDetail(vehicle) {
  const ids = vehicles.map((v) => v.id);
  sessionStorage.setItem('showcase-vehicle-ids', JSON.stringify(ids));

  const detailPath = blockEl.dataset.detailPage || '/used-cars/vehicle-showcase-detail';
  const url = `${detailPath}?id=${vehicle.id}`;

  if (document.startViewTransition && heroImageEl) {
    heroImageEl.style.viewTransitionName = 'showcase-hero';
    document.startViewTransition(() => {
      window.location.href = url;
    });
  } else {
    window.location.href = url;
  }
}

/* ---------- Thumbnails ---------- */

function buildThumbnails() {
  if (!carouselTrackEl) return;
  carouselTrackEl.innerHTML = '';
  vehicles.forEach((v, i) => {
    const thumb = el('button', `vs-thumb ${i === currentIndex ? 'vs-thumb--active' : ''}`);
    thumb.setAttribute('aria-label', `View ${v.model}`);
    const img = document.createElement('img');
    img.src = getVehicleImage(v);
    img.alt = v.model;
    img.loading = i < 6 ? 'eager' : 'lazy';
    thumb.appendChild(img);
    thumb.appendChild(el('div', 'vs-thumb-overlay'));
    thumb.appendChild(el('span', 'vs-thumb-name', v.model));
    thumb.addEventListener('click', () => goTo(i));
    carouselTrackEl.appendChild(thumb);
  });

  if (progressEl) {
    progressEl.innerHTML = '';
    vehicles.forEach((_, i) => {
      progressEl.appendChild(el('div', `vs-dot ${i === currentIndex ? 'vs-dot--active' : ''}`));
    });
  }
}

/* ---------- Filter logic ---------- */

// Note: buildFilterTabs and applyFilter have circular reference (tabs call applyFilter,
// applyFilter rebuilds tabs). Using function declarations for hoisting.
/* eslint-disable no-use-before-define */
function buildFilterTabs(container) {
  container.innerHTML = '';
  const allTypes = [
    { type: 'all', label: 'All', values: [{ value: 'all', count: 0 }] },
  ];
  if (facets.series && facets.series.length) {
    allTypes.push({ type: 'series', label: 'Series', values: facets.series });
  }
  if (facets.bodyTypes && facets.bodyTypes.length) {
    allTypes.push({ type: 'bodyType', label: 'Body', values: facets.bodyTypes });
  }
  if (facets.fuelTypes && facets.fuelTypes.length) {
    allTypes.push({ type: 'fuelType', label: 'Fuel', values: facets.fuelTypes });
  }

  allTypes.forEach((group, gi) => {
    if (gi > 0) {
      container.appendChild(el('div', 'vs-filter-divider'));
    }
    const groupEl = el('div', 'vs-filter-group');
    if (group.type === 'all') {
      const tab = el('button', `vs-filter-tab ${activeFilter.type === 'all' ? 'vs-active' : ''}`, 'All');
      tab.setAttribute('aria-pressed', activeFilter.type === 'all');
      tab.addEventListener('click', () => applyFilter('all', 'all'));
      groupEl.appendChild(tab);
    } else {
      group.values.forEach((v) => {
        const isActive = activeFilter.type === group.type && activeFilter.value === v.value;
        const label = group.type === 'fuelType' ? formatFuelType(v.value) : v.value;
        const tab = el('button', `vs-filter-tab ${isActive ? 'vs-active' : ''}`, label);
        tab.setAttribute('aria-pressed', isActive);
        tab.addEventListener('click', () => applyFilter(group.type, v.value));
        groupEl.appendChild(tab);
      });
    }
    container.appendChild(groupEl);
  });
}

async function applyFilter(type, value) {
  activeFilter = { type, value };
  const input = { pageSize: 24 };
  if (type === 'series') input.series = [value];
  else if (type === 'bodyType') input.bodyTypes = [value];
  else if (type === 'fuelType') input.fuelTypes = [value];

  try {
    const data = await queryAPI(SEARCH_QUERY, { input });
    const result = data.searchUsedVehicles;
    vehicles = result.vehicles || [];
    facets = result.facets || {};
    currentIndex = 0;

    buildFilterTabs(blockEl.querySelector('.vs-filters'));
    buildThumbnails();
    if (vehicles.length) {
      updateHero(vehicles[0]);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Showcase filter error:', err);
  }
}
/* eslint-enable no-use-before-define */

/* ---------- Build DOM ---------- */

function buildShowcase(block) {
  block.innerHTML = '';
  blockEl = block;

  // Backdrop
  const backdrop = el('div', 'vs-backdrop');
  backdropImageEl = el('div', 'vs-backdrop-image');
  backdrop.appendChild(backdropImageEl);
  backdrop.appendChild(el('div', 'vs-backdrop-overlay'));
  block.appendChild(backdrop);

  // Header
  const header = el('div', 'vs-header');
  header.innerHTML = `
    <div class="vs-header-brand">
      <div class="vs-header-logo">${SVG_BMW_LOGO}</div>
      <span class="vs-header-title">Premium Selection</span>
    </div>
    <div class="vs-header-actions">
      <button class="vs-header-btn" aria-label="Save selection">SAVE</button>
      <button class="vs-header-btn" aria-label="Share selection">SHARE</button>
    </div>
  `;
  block.appendChild(header);

  // Filters
  const filters = el('div', 'vs-filters');
  block.appendChild(filters);

  // Main area
  const main = el('div', 'vs-main');

  const navPrev = el('button', 'vs-nav vs-nav--prev');
  navPrev.innerHTML = SVG_CHEVRON_LEFT;
  navPrev.setAttribute('aria-label', 'Previous vehicle');
  navPrev.addEventListener('click', goPrev);
  main.appendChild(navPrev);

  const navNext = el('button', 'vs-nav vs-nav--next');
  navNext.innerHTML = SVG_CHEVRON_RIGHT;
  navNext.setAttribute('aria-label', 'Next vehicle');
  navNext.addEventListener('click', goNext);
  main.appendChild(navNext);

  const hero = el('div', 'vs-hero');
  infoLeftEl = el('div', 'vs-info-left');
  hero.appendChild(infoLeftEl);

  const heroImageWrap = el('div', 'vs-hero-image-wrap');
  heroImageEl = document.createElement('img');
  heroImageEl.className = 'vs-hero-image';
  heroImageEl.alt = '';
  heroImageEl.addEventListener('click', () => {
    if (vehicles[currentIndex]) navigateToDetail(vehicles[currentIndex]);
  });
  heroImageEl.style.cursor = 'pointer';
  heroImageWrap.appendChild(heroImageEl);
  hero.appendChild(heroImageWrap);

  infoRightEl = el('div', 'vs-info-right');
  hero.appendChild(infoRightEl);
  main.appendChild(hero);
  block.appendChild(main);

  // Carousel
  const carousel = el('div', 'vs-carousel');
  carouselTrackEl = el('div', 'vs-carousel-track');
  carousel.appendChild(carouselTrackEl);
  progressEl = el('div', 'vs-progress');
  carousel.appendChild(progressEl);
  block.appendChild(carousel);

  // Action bar
  const actionBar = el('div', 'vs-action-bar');
  actionBar.innerHTML = `
    <div class="vs-action-inner">
      <div class="vs-action-ctas">
        <a class="vs-cta vs-cta--primary vs-cta-enquire" href="#">ENQUIRE NOW</a>
        <a class="vs-cta vs-cta--secondary vs-cta-detail" href="#">VIEW DETAILS</a>
        <button class="vs-cta vs-cta--tertiary vs-cta-finance">FINANCE OPTIONS</button>
      </div>
      <div class="vs-counter">
        <span class="vs-counter-label">VEHICLE</span>
        <span class="vs-counter-current">1</span>
        <span class="vs-counter-sep">/</span>
        <span class="vs-counter-total">0</span>
      </div>
    </div>
  `;
  block.appendChild(actionBar);

  counterCurrentEl = actionBar.querySelector('.vs-counter-current');
  counterTotalEl = actionBar.querySelector('.vs-counter-total');

  actionBar.querySelector('.vs-cta-enquire').addEventListener('click', (e) => {
    e.preventDefault();
    if (vehicles[currentIndex]) {
      window.location.href = `/enquire?id=${vehicles[currentIndex].id}`;
    }
  });

  actionBar.querySelector('.vs-cta-detail').addEventListener('click', (e) => {
    e.preventDefault();
    if (vehicles[currentIndex]) navigateToDetail(vehicles[currentIndex]);
  });
}

/* ---------- Keyboard & touch ---------- */

function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goNext();
    else if (e.key === 'ArrowLeft') goPrev();
    else if (e.key === 'Enter' && vehicles[currentIndex]) {
      navigateToDetail(vehicles[currentIndex]);
    }
  });
}

function setupTouch(block) {
  let startX = 0;
  let startY = 0;
  let tracking = false;

  block.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });

  block.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    }
  }, { passive: true });
}

/* ---------- Decorate (entry point) ---------- */

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/styles/showcase-theme.css`);

  const rows = [...block.children];
  let detailPage = '/used-cars/vehicle-showcase-detail';
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const val = cells[1].textContent.trim();
      if (key === 'detail-page') detailPage = val;
    }
  });

  block.dataset.detailPage = detailPage;

  buildShowcase(block);
  setupKeyboard();
  setupTouch(block);

  const loading = el('div', 'vs-loading');
  loading.innerHTML = '<div class="vs-loading-content"><p>Loading vehicles...</p><div class="vs-loading-bar"></div></div>';
  block.appendChild(loading);

  try {
    const data = await queryAPI(SEARCH_QUERY, { input: { pageSize: 24 } });
    const result = data.searchUsedVehicles;
    vehicles = result.vehicles || [];
    facets = result.facets || {};
    currentIndex = 0;

    loading.remove();
    buildFilterTabs(block.querySelector('.vs-filters'));
    buildThumbnails();

    if (vehicles.length) {
      updateHero(vehicles[0]);
    }
  } catch (err) {
    loading.innerHTML = '<div class="vs-loading-content"><p>Unable to load vehicles. Please try again.</p></div>';
    // eslint-disable-next-line no-console
    console.error('Showcase load error:', err);
  }
}
