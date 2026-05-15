import queryAPI from '../../scripts/used-cars-api.js';
import {
  formatPrice,
  formatMileage,
  formatFuelType,
  formatTransmission,
  formatMonthly,
  getUserId,
} from '../../scripts/used-cars-config.js';
import { loadCSS } from '../../scripts/aem.js';

/* ---------- GraphQL ---------- */

const GARAGE_QUERY = `query GetGarage($userId: String!) {
  userGarage(userId: $userId) {
    vehicles {
      id series model price mileage fuelType transmission
      estimatedMonthlyPayment
      images { url alt order }
    }
  }
}`;

const REMOVE_MUTATION = `mutation RemoveFromGarage($userId: String!, $vehicleId: ID!) {
  removeFromGarage(userId: $userId, vehicleId: $vehicleId) { success }
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

const SVG_CHEVRON_LEFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';
const SVG_CHEVRON_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
const SVG_REMOVE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>';
const SVG_GARAGE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>';

/* ---------- State ---------- */

let garageVehicles = [];
let currentIndex = 0;
let isTransitioning = false;
let blockEl;

/* ---------- Render functions (leaf → callers) ---------- */

function updateDots() {
  const dots = blockEl.querySelectorAll('.vsg-swipe-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('vsg-dot-active', i === currentIndex);
  });
}

function updateCount() {
  const countEl = blockEl.querySelector('.vsg-count-value');
  if (countEl) countEl.textContent = garageVehicles.length;
}

function rebuildDots() {
  const indicator = blockEl.querySelector('.vsg-swipe-dots');
  if (!indicator) return;
  indicator.innerHTML = garageVehicles.map((_, i) => `<div class="vsg-swipe-dot ${i === currentIndex ? 'vsg-dot-active' : ''}"></div>`).join('');
}

function renderEmpty() {
  const container = blockEl.querySelector('.vsg-slide-container');
  if (!container) return;
  container.innerHTML = `
    <div class="vsg-empty">
      <div class="vsg-empty-icon">${SVG_GARAGE}</div>
      <h2 class="vsg-empty-title">Your Garage is Empty</h2>
      <p class="vsg-empty-text">Save vehicles from the selection view to compare later.</p>
      <a class="vsg-empty-cta" href="/used-cars/vehicle-showcase">EXPLORE VEHICLES</a>
    </div>
  `;
  const indicator = blockEl.querySelector('.vsg-swipe-indicator');
  if (indicator) indicator.style.display = 'none';
}

function renderVehicleCard(vehicle) {
  const imageUrl = getVehicleImage(vehicle);
  const monthlyHtml = vehicle.estimatedMonthlyPayment
    ? `<span class="vsg-card-monthly">${formatMonthly(vehicle.estimatedMonthlyPayment)}</span>`
    : '';

  const card = el('div', 'vsg-vehicle-card');
  card.innerHTML = `
    <div class="vsg-card-image-wrap">
      <img src="${imageUrl}" alt="${vehicle.model}" />
      <div class="vsg-card-glow"></div>
    </div>
    <div class="vsg-card-info">
      <span class="vsg-card-series">${vehicle.series || ''}</span>
      <h2 class="vsg-card-model">${vehicle.model}</h2>
      <div class="vsg-card-price-row">
        <span class="vsg-card-price">${formatPrice(vehicle.price)}</span>
        ${monthlyHtml}
      </div>
      <div class="vsg-card-specs">
        <span class="vsg-card-spec">${formatMileage(vehicle.mileage)}</span>
        <span class="vsg-card-spec">${formatFuelType(vehicle.fuelType)}</span>
        <span class="vsg-card-spec">${formatTransmission(vehicle.transmission)}</span>
      </div>
    </div>
    <button class="vsg-remove-btn" aria-label="Remove from garage">${SVG_REMOVE}</button>
  `;
  return card;
}

/* ---------- Remove vehicle ---------- */

async function removeVehicle(vehicleId) {
  const userId = getUserId();
  try {
    await queryAPI(REMOVE_MUTATION, { userId, vehicleId });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Remove failed:', e);
  }

  garageVehicles = garageVehicles.filter((v) => v.id !== vehicleId);

  if (!garageVehicles.length) {
    renderEmpty();
    updateCount();
    return;
  }

  if (currentIndex >= garageVehicles.length) {
    currentIndex = garageVehicles.length - 1;
  }

  const container = blockEl.querySelector('.vsg-slide-container');
  const current = container.querySelector('.vsg-vehicle-card');
  if (current) {
    current.classList.add('vsg-removing');
    await new Promise((resolve) => { setTimeout(resolve, 500); });
  }

  // eslint-disable-next-line no-use-before-define
  showCurrentCard();
  rebuildDots();
  updateCount();
}

function wireRemoveButton(card, vehicleId) {
  const btn = card.querySelector('.vsg-remove-btn');
  if (btn) btn.addEventListener('click', () => removeVehicle(vehicleId));
}

function showCurrentCard() {
  const container = blockEl.querySelector('.vsg-slide-container');
  container.innerHTML = '';
  if (!garageVehicles.length) {
    renderEmpty();
    return;
  }
  const card = renderVehicleCard(garageVehicles[currentIndex]);
  wireRemoveButton(card, garageVehicles[currentIndex].id);
  container.appendChild(card);
}

/* ---------- Swipe transition ---------- */

async function transitionToVehicle(direction) {
  if (isTransitioning || garageVehicles.length <= 1) return;
  isTransitioning = true;

  let nextIndex;
  if (direction === 'next') {
    nextIndex = (currentIndex + 1) % garageVehicles.length;
  } else {
    nextIndex = currentIndex === 0 ? garageVehicles.length - 1 : currentIndex - 1;
  }

  const container = blockEl.querySelector('.vsg-slide-container');
  const currentCard = container.querySelector('.vsg-vehicle-card');

  const outClass = direction === 'next' ? 'vsg-sliding-out-left' : 'vsg-sliding-out-right';
  if (currentCard) currentCard.classList.add(outClass);

  await new Promise((resolve) => { setTimeout(resolve, 400); });

  currentIndex = nextIndex;
  const newCard = renderVehicleCard(garageVehicles[currentIndex]);
  wireRemoveButton(newCard, garageVehicles[currentIndex].id);
  const inClass = direction === 'next' ? 'vsg-sliding-in-left' : 'vsg-sliding-in-right';
  newCard.classList.add(inClass);

  if (currentCard) currentCard.remove();
  container.appendChild(newCard);

  updateDots();

  setTimeout(() => {
    newCard.classList.remove(inClass);
    isTransitioning = false;
  }, 600);
}

/* ---------- Build page ---------- */

function buildGaragePage(block) {
  block.innerHTML = '';
  blockEl = block;

  // Header
  const header = el('div', 'vsg-header');
  header.innerHTML = `
    <div class="vsg-header-left">
      <div class="vsg-header-icon">${SVG_GARAGE}</div>
      <h1 class="vsg-header-title">My Garage</h1>
    </div>
    <div class="vsg-header-right">
      <span class="vsg-count-label">Saved:</span>
      <span class="vsg-count-value">${garageVehicles.length}</span>
    </div>
  `;
  block.appendChild(header);

  // Nav arrows
  if (garageVehicles.length > 1) {
    const prevBtn = el('button', 'vsg-swipe-nav vsg-swipe-prev');
    prevBtn.innerHTML = SVG_CHEVRON_LEFT;
    prevBtn.setAttribute('aria-label', 'Previous vehicle');
    prevBtn.addEventListener('click', () => transitionToVehicle('prev'));
    block.appendChild(prevBtn);

    const nextBtn = el('button', 'vsg-swipe-nav vsg-swipe-next');
    nextBtn.innerHTML = SVG_CHEVRON_RIGHT;
    nextBtn.setAttribute('aria-label', 'Next vehicle');
    nextBtn.addEventListener('click', () => transitionToVehicle('next'));
    block.appendChild(nextBtn);
  }

  // Slide container
  const slideContainer = el('div', 'vsg-slide-container');
  block.appendChild(slideContainer);

  if (garageVehicles.length) {
    const card = renderVehicleCard(garageVehicles[0]);
    wireRemoveButton(card, garageVehicles[0].id);
    slideContainer.appendChild(card);

    // Indicator
    const indicator = el('div', 'vsg-swipe-indicator');
    const dotsHtml = garageVehicles.map((_, i) => `<div class="vsg-swipe-dot ${i === 0 ? 'vsg-dot-active' : ''}"></div>`).join('');
    indicator.innerHTML = `
      <span class="vsg-swipe-indicator-text">Swipe to browse</span>
      <div class="vsg-swipe-dots">${dotsHtml}</div>
    `;
    block.appendChild(indicator);
  } else {
    renderEmpty();
  }

  // Action bar
  const actionBar = el('div', 'vsg-action-bar');
  actionBar.innerHTML = `
    <div class="vsg-action-inner">
      <a class="vsg-cta vsg-cta--primary" href="/used-cars/vehicle-showcase">EXPLORE MORE</a>
      <a class="vsg-cta vsg-cta--secondary" href="/used-cars/vehicle-showcase-detail">VIEW DETAILS</a>
    </div>
  `;
  block.appendChild(actionBar);

  // Wire detail link
  actionBar.querySelector('.vsg-cta--secondary').addEventListener('click', (e) => {
    if (garageVehicles[currentIndex]) {
      e.preventDefault();
      window.location.href = `/used-cars/vehicle-showcase-detail?id=${garageVehicles[currentIndex].id}`;
    }
  });
}

/* ---------- Interactions ---------- */

function setupInteractions(block) {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') transitionToVehicle('next');
    else if (e.key === 'ArrowLeft') transitionToVehicle('prev');
  });

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
      if (dx < 0) transitionToVehicle('next');
      else transitionToVehicle('prev');
    }
  }, { passive: true });
}

/* ---------- Decorate (entry point) ---------- */

export default async function decorate(block) {
  await loadCSS(`${window.hlx.codeBasePath}/styles/showcase-theme.css`);

  block.innerHTML = '<div class="vsg-loading"><p class="vsg-loading-text">Loading your garage...</p></div>';

  const userId = getUserId();

  try {
    const data = await queryAPI(GARAGE_QUERY, { userId });
    const result = data.userGarage;
    garageVehicles = result && result.vehicles ? result.vehicles : [];
    currentIndex = 0;

    buildGaragePage(block);
    setupInteractions(block);
  } catch (err) {
    block.innerHTML = '<div class="vsg-loading"><p class="vsg-loading-text">Failed to load your garage.</p></div>';
    // eslint-disable-next-line no-console
    console.error('Garage load error:', err);
  }
}
