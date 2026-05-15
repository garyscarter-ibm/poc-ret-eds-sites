import queryAPI from '../../scripts/used-cars-api.js';
import {
  DETAIL_PAGE_PATH,
  formatPrice,
  formatMileage,
  formatFuelType,
  formatTransmission,
  formatDate,
  getUserId,
} from '../../scripts/used-cars-config.js';

/* ---------- GraphQL ---------- */

const GARAGE_IDS_QUERY = `query GarageIds($userId: String!) {
  garageVehicleIds(userId: $userId)
}`;

const COMPARE_QUERY = `query Compare($ids: [ID!]!) {
  compareVehicles(ids: $ids) {
    vehicles {
      id model series price mileage fuelType transmission
      registrationDate bodyType images { url alt order }
      dealer { name }
    }
  }
}`;

const REMOVE_GARAGE = `mutation RemoveFromGarage($userId: String!, $vehicleId: ID!) {
  removeFromGarage(userId: $userId, vehicleId: $vehicleId)
}`;

/* ---------- Helpers ---------- */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

/* ---------- Skeleton ---------- */

function renderSkeleton() {
  return el(
    'div',
    'vg-grid',
    `
    ${Array.from(
    { length: 3 },
    () => `
      <div class="vg-card vg-card--skeleton">
        <div class="vg-card-image"><div class="vg-skeleton-shimmer"></div></div>
        <div class="vg-card-body">
          <div class="vg-skeleton-line vg-skeleton-line--wide"></div>
          <div class="vg-skeleton-line vg-skeleton-line--medium"></div>
          <div class="vg-skeleton-line vg-skeleton-line--narrow"></div>
        </div>
      </div>`,
  ).join('')}
  `,
  );
}

/* ---------- Empty State ---------- */

function renderEmpty() {
  return el(
    'div',
    'vg-empty',
    `
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <h3>Your garage is empty</h3>
    <p>Save vehicles you're interested in and they'll appear here for easy comparison.</p>
    <a href="/used-cars/inventory" class="vg-btn vg-btn--primary">Browse vehicles</a>
  `,
  );
}

/* ---------- Vehicle Card ---------- */

function renderGarageCard(vehicle, detailPath, onRemove) {
  const card = el('div', 'vg-card');
  const img = vehicle.images?.sort((a, b) => a.order - b.order)[0];

  card.innerHTML = `
    <a href="${detailPath}?id=${vehicle.id}" class="vg-card-image">
      <img src="${img?.url || ''}" alt="${img?.alt || vehicle.model}" loading="lazy">
    </a>
    <div class="vg-card-body">
      <h3 class="vg-card-title">
        <a href="${detailPath}?id=${vehicle.id}">${vehicle.model}</a>
      </h3>
      <span class="vg-card-price">${formatPrice(vehicle.price)}</span>
      <div class="vg-card-specs">
        <span>${formatMileage(vehicle.mileage)}</span>
        <span>${formatFuelType(vehicle.fuelType)}</span>
        <span>${formatTransmission(vehicle.transmission)}</span>
        <span>${formatDate(vehicle.registrationDate)}</span>
      </div>
      <div class="vg-card-actions">
        <a href="${detailPath}?id=${vehicle.id}" class="vg-btn vg-btn--primary">View details</a>
        <button type="button" class="vg-btn vg-btn--remove" aria-label="Remove from garage">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Remove
        </button>
      </div>
    </div>`;

  card.querySelector('.vg-btn--remove').addEventListener('click', () => {
    card.classList.add('vg-card--removing');
    setTimeout(() => onRemove(vehicle.id, card), 300);
  });

  return card;
}

/* ---------- Main Decorate ---------- */

export default async function decorate(block) {
  let detailPath = DETAIL_PAGE_PATH;
  [...block.children].forEach((row) => {
    const key = row.children[0]?.textContent?.trim().toLowerCase();
    const value = row.children[1]?.textContent?.trim();
    if (key === 'detail-page' && value) detailPath = value;
  });
  block.textContent = '';

  const userId = getUserId();

  // Header
  const header = el('div', 'vg-header');
  header.innerHTML = `
    <h2 class="vg-title">My Garage</h2>
    <p class="vg-subtitle">Your saved vehicles</p>`;
  block.append(header);

  // Skeleton
  const skeleton = renderSkeleton();
  block.append(skeleton);

  try {
    // Get garage IDs
    const garageData = await queryAPI(GARAGE_IDS_QUERY, { userId });
    const ids = garageData.garageVehicleIds || [];

    if (!ids.length) {
      skeleton.replaceWith(renderEmpty());
      return;
    }

    // Fetch full vehicle details via compare query
    const data = await queryAPI(COMPARE_QUERY, { ids });
    const vehicles = data.compareVehicles?.vehicles || [];

    if (!vehicles.length) {
      skeleton.replaceWith(renderEmpty());
      return;
    }

    // Render grid
    const grid = el('div', 'vg-grid');
    const handleRemove = async (vehicleId, card) => {
      try {
        await queryAPI(REMOVE_GARAGE, { userId, vehicleId });
        card.remove();
        // Check if empty
        if (!grid.children.length) {
          grid.replaceWith(renderEmpty());
        }
      } catch {
        card.classList.remove('vg-card--removing');
      }
    };

    vehicles.forEach((v) => {
      grid.append(renderGarageCard(v, detailPath, handleRemove));
    });

    skeleton.replaceWith(grid);
  } catch (err) {
    skeleton.replaceWith(
      el(
        'div',
        'vg-error',
        `<p>Unable to load your garage. Please try again later.</p><p class="vg-error-detail">${err.message}</p>`,
      ),
    );
  }
}
