import queryAPI from '../../scripts/used-cars-api.js';
import {
  formatPrice,
  formatMileage,
  formatDate,
  formatFuelType,
  formatTransmission,
  formatPower,
  formatAcceleration,
  formatTopSpeed,
  formatDrivetrain,
  formatMonthly,
} from '../../scripts/used-cars-config.js';
import { loadCSS } from '../../scripts/aem.js';

/* ---------- GraphQL ---------- */

const VEHICLE_QUERY = `query GetVehicle($id: ID!) {
  usedVehicle(id: $id) {
    id vin series model price bodyType fuelType transmission drivetrain
    colour upholstery mileage registrationDate
    power torque acceleration topSpeed
    estimatedMonthlyPayment financeAvailable
    images { url alt order }
    standardFeatures optionalPacks
    dealer { name address postcode phone }
  }
}`;

/* ---------- Helpers ---------- */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

function getVehicleImages(vehicle) {
  if (!vehicle.images || !vehicle.images.length) return [];
  return [...vehicle.images].sort((a, b) => a.order - b.order);
}

const SVG_CHEVRON_LEFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>';
const SVG_CHEVRON_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>';
const SVG_ARROW_LEFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';

/* ---------- State ---------- */

let vehicleIds = [];
let currentIdIndex = 0;
let isTransitioning = false;
let blockEl;

/* ---------- Swipe dots ---------- */

function updateSwipeDots() {
  const dots = blockEl.querySelectorAll('.vsd-swipe-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('vsd-dot-active', i === currentIdIndex);
  });
}

/* ---------- Render vehicle content ---------- */

function renderVehicle(vehicle) {
  const images = getVehicleImages(vehicle);
  const heroImage = images.length ? images[0] : { url: '', alt: '' };

  const monthlyHtml = vehicle.estimatedMonthlyPayment
    ? `<span class="vsd-price-monthly">${formatMonthly(vehicle.estimatedMonthlyPayment)} PCP</span>`
    : '';

  const specsHtml = [
    vehicle.mileage != null ? `<div class="vsd-spec-card"><div class="vsd-spec-label">Mileage</div><div class="vsd-spec-value">${formatMileage(vehicle.mileage)}</div></div>` : '',
    vehicle.registrationDate ? `<div class="vsd-spec-card"><div class="vsd-spec-label">Registered</div><div class="vsd-spec-value">${formatDate(vehicle.registrationDate)}</div></div>` : '',
    vehicle.fuelType ? `<div class="vsd-spec-card"><div class="vsd-spec-label">Fuel</div><div class="vsd-spec-value">${formatFuelType(vehicle.fuelType)}</div></div>` : '',
    vehicle.transmission ? `<div class="vsd-spec-card"><div class="vsd-spec-label">Transmission</div><div class="vsd-spec-value">${formatTransmission(vehicle.transmission)}</div></div>` : '',
    vehicle.power ? `<div class="vsd-spec-card"><div class="vsd-spec-label">Power</div><div class="vsd-spec-value">${formatPower(vehicle.power)}</div></div>` : '',
    vehicle.acceleration ? `<div class="vsd-spec-card"><div class="vsd-spec-label">0-62 mph</div><div class="vsd-spec-value">${formatAcceleration(vehicle.acceleration)}</div></div>` : '',
    vehicle.topSpeed ? `<div class="vsd-spec-card"><div class="vsd-spec-label">Top Speed</div><div class="vsd-spec-value">${formatTopSpeed(vehicle.topSpeed)}</div></div>` : '',
    vehicle.drivetrain ? `<div class="vsd-spec-card"><div class="vsd-spec-label">Drivetrain</div><div class="vsd-spec-value">${formatDrivetrain(vehicle.drivetrain)}</div></div>` : '',
  ].filter(Boolean).join('');

  const featuresHtml = vehicle.standardFeatures && vehicle.standardFeatures.length
    ? `<div class="vsd-features">
        <p class="vsd-features-title">Standard Features</p>
        <div class="vsd-features-grid">
          ${vehicle.standardFeatures.map((f) => `<span class="vsd-feature-pill">${f}</span>`).join('')}
        </div>
      </div>`
    : '';

  const galleryHtml = images.length > 1
    ? `<div class="vsd-gallery">
        <div class="vsd-gallery-grid">
          ${images.slice(1, 7).map((img) => `
            <div class="vsd-gallery-item">
              <img src="${img.url}" alt="${img.alt || vehicle.model}" loading="lazy" />
            </div>
          `).join('')}
        </div>
      </div>`
    : '';

  const content = el('div', 'vsd-vehicle');
  content.innerHTML = `
    <div class="vsd-hero">
      <img src="${heroImage.url}" alt="${heroImage.alt || vehicle.model}" />
      <div class="vsd-hero-gradient"></div>
      <div class="vsd-hero-glow"></div>
    </div>
    <div class="vsd-title-area">
      <span class="vsd-series-badge">${vehicle.series || ''}</span>
      <h1 class="vsd-model-name">${vehicle.model}</h1>
      <div class="vsd-price-row">
        <span class="vsd-price-main">${formatPrice(vehicle.price)}</span>
        ${monthlyHtml}
      </div>
    </div>
    <div class="vsd-specs-bar">${specsHtml}</div>
    ${featuresHtml}
    ${galleryHtml}
    <div class="vsd-bottom-spacer"></div>
  `;

  return content;
}

/* ---------- Swipe transition ---------- */

async function transitionToVehicle(direction) {
  if (isTransitioning || vehicleIds.length <= 1) return;
  isTransitioning = true;

  let nextIndex;
  if (direction === 'next') {
    nextIndex = (currentIdIndex + 1) % vehicleIds.length;
  } else {
    nextIndex = currentIdIndex === 0 ? vehicleIds.length - 1 : currentIdIndex - 1;
  }

  const nextId = vehicleIds[nextIndex];

  try {
    const data = await queryAPI(VEHICLE_QUERY, { id: nextId });
    const nextVehicle = data.usedVehicle;
    if (!nextVehicle) {
      isTransitioning = false;
      return;
    }

    const container = blockEl.querySelector('.vsd-slide-container');
    const currentContent = container.querySelector('.vsd-vehicle');

    const outClass = direction === 'next' ? 'vsd-sliding-out-left' : 'vsd-sliding-out-right';
    if (currentContent) currentContent.classList.add(outClass);

    await new Promise((resolve) => { setTimeout(resolve, 400); });

    currentIdIndex = nextIndex;
    const newContent = renderVehicle(nextVehicle);
    const inClass = direction === 'next' ? 'vsd-sliding-in-left' : 'vsd-sliding-in-right';
    newContent.classList.add(inClass);

    if (currentContent) currentContent.remove();
    container.appendChild(newContent);

    const url = new URL(window.location);
    url.searchParams.set('id', nextId);
    window.history.replaceState({}, '', url);

    updateSwipeDots();

    setTimeout(() => {
      newContent.classList.remove(inClass);
      isTransitioning = false;
    }, 600);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load next vehicle:', err);
    isTransitioning = false;
  }
}

/* ---------- Build page structure ---------- */

function buildDetailPage(block, vehicle) {
  block.innerHTML = '';
  blockEl = block;

  // Back link
  const back = el('a', 'vsd-back');
  back.href = '/used-cars/vehicle-showcase';
  back.innerHTML = `${SVG_ARROW_LEFT}<span>Back</span>`;
  block.appendChild(back);

  // Swipe nav arrows
  if (vehicleIds.length > 1) {
    const prevBtn = el('button', 'vsd-swipe-nav vsd-swipe-prev');
    prevBtn.innerHTML = SVG_CHEVRON_LEFT;
    prevBtn.setAttribute('aria-label', 'Previous vehicle');
    prevBtn.addEventListener('click', () => transitionToVehicle('prev'));
    block.appendChild(prevBtn);

    const nextBtn = el('button', 'vsd-swipe-nav vsd-swipe-next');
    nextBtn.innerHTML = SVG_CHEVRON_RIGHT;
    nextBtn.setAttribute('aria-label', 'Next vehicle');
    nextBtn.addEventListener('click', () => transitionToVehicle('next'));
    block.appendChild(nextBtn);
  }

  // Slide container
  const slideContainer = el('div', 'vsd-slide-container');
  slideContainer.appendChild(renderVehicle(vehicle));
  block.appendChild(slideContainer);

  // Swipe indicator
  if (vehicleIds.length > 1) {
    const indicator = el('div', 'vsd-swipe-indicator');
    const dotsHtml = vehicleIds.map((_, i) => `<div class="vsd-swipe-dot ${i === currentIdIndex ? 'vsd-dot-active' : ''}"></div>`).join('');
    indicator.innerHTML = `
      <span class="vsd-swipe-indicator-text">Swipe to browse</span>
      <div class="vsd-swipe-dots">${dotsHtml}</div>
    `;
    block.appendChild(indicator);
  }

  // Action bar
  const actionBar = el('div', 'vsd-action-bar');
  actionBar.innerHTML = `
    <div class="vsd-action-inner">
      <div class="vsd-action-ctas">
        <a class="vsd-cta vsd-cta--primary" href="/enquire?id=${vehicle.id}">ENQUIRE NOW</a>
        <a class="vsd-cta vsd-cta--secondary" href="#">TEST DRIVE</a>
      </div>
    </div>
  `;
  block.appendChild(actionBar);
}

/* ---------- Keyboard & touch ---------- */

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

  const params = new URLSearchParams(window.location.search);
  const vehicleId = params.get('id');

  if (!vehicleId) {
    block.innerHTML = '<div class="vsd-loading"><p class="vsd-loading-text">No vehicle specified.</p></div>';
    return;
  }

  // Read stored vehicle IDs for swipe-between
  try {
    const stored = sessionStorage.getItem('showcase-vehicle-ids');
    if (stored) {
      vehicleIds = JSON.parse(stored);
      currentIdIndex = vehicleIds.indexOf(vehicleId);
      if (currentIdIndex === -1) {
        vehicleIds = [vehicleId];
        currentIdIndex = 0;
      }
    } else {
      vehicleIds = [vehicleId];
      currentIdIndex = 0;
    }
  } catch (e) {
    vehicleIds = [vehicleId];
    currentIdIndex = 0;
  }

  block.innerHTML = '<div class="vsd-loading"><p class="vsd-loading-text">Loading...</p></div>';

  try {
    const data = await queryAPI(VEHICLE_QUERY, { id: vehicleId });
    const vehicle = data.usedVehicle;

    if (!vehicle) {
      block.innerHTML = '<div class="vsd-loading"><p class="vsd-loading-text">Vehicle not found.</p></div>';
      return;
    }

    buildDetailPage(block, vehicle);
    setupInteractions(block);
  } catch (err) {
    block.innerHTML = '<div class="vsd-loading"><p class="vsd-loading-text">Failed to load vehicle details.</p></div>';
    // eslint-disable-next-line no-console
    console.error('Showcase detail error:', err);
  }
}
