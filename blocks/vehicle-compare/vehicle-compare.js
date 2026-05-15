import queryAPI from '../../scripts/used-cars-api.js';
import {
  formatPrice,
  formatMileage,
  formatFuelType,
  formatTransmission,
  formatDate,
  formatPower,
  formatAcceleration,
  formatTopSpeed,
  DETAIL_PAGE_PATH,
} from '../../scripts/used-cars-config.js';

/* ---------- GraphQL ---------- */

const COMPARE_QUERY = `query Compare($ids: [ID!]!) {
  compareVehicles(ids: $ids) {
    vehicles {
      id model series price mileage fuelType transmission power
      registrationDate bodyType colour co2Emissions mpgCombined
      electricRange acceleration topSpeed drivetrain
      images { url alt order }
      dealer { name }
    }
  }
}`;

const AI_SUMMARY_QUERY = `query CompareSummary($ids: [ID!]!) {
  compareVehicleSummary(ids: $ids) {
    overview
    keyDifferences
    targetBuyer
    valueAssessment
    recommendation
  }
}`;

/* ---------- Helpers ---------- */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

/* ---------- AI Insights (backend-powered) ---------- */

const AI_SECTIONS = [
  { key: 'overview', title: 'Overview' },
  { key: 'keyDifferences', title: 'Key Differences' },
  { key: 'targetBuyer', title: 'Who Is It For' },
  { key: 'valueAssessment', title: 'Value Assessment' },
  { key: 'recommendation', title: 'Recommendation' },
];

const PERSONA_FILTERS = {
  lifestyle: ['overview', 'targetBuyer', 'valueAssessment', 'recommendation'],
  russell: ['overview', 'keyDifferences', 'valueAssessment', 'recommendation'],
};

/* ---------- Skeleton ---------- */

function renderSkeleton() {
  return el(
    'div',
    'vc-loading',
    `
    <div class="vc-skeleton-cards">
      <div class="vc-skeleton-card"><div class="vc-skeleton-shimmer"></div></div>
      <div class="vc-skeleton-card"><div class="vc-skeleton-shimmer"></div></div>
    </div>
  `,
  );
}

/* ---------- Spec Table ---------- */

function renderSpecTable(vehicles) {
  const specs = [
    { label: 'Price', fn: (v) => formatPrice(v.price) },
    { label: 'Series', fn: (v) => v.series || '—' },
    {
      label: 'Body Type',
      fn: (v) => (v.bodyType || '—')
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase()),
    },
    { label: 'Mileage', fn: (v) => formatMileage(v.mileage) },
    { label: 'Registration', fn: (v) => formatDate(v.registrationDate) },
    { label: 'Fuel Type', fn: (v) => formatFuelType(v.fuelType) },
    { label: 'Transmission', fn: (v) => formatTransmission(v.transmission) },
    { label: 'Power', fn: (v) => formatPower(v.power) },
    { label: '0-62 mph', fn: (v) => formatAcceleration(v.acceleration) },
    { label: 'Top Speed', fn: (v) => formatTopSpeed(v.topSpeed) },
    {
      label: 'CO₂',
      fn: (v) => (v.co2Emissions ? `${v.co2Emissions} g/km` : '—'),
    },
    {
      label: 'MPG (Combined)',
      fn: (v) => (v.mpgCombined ? `${v.mpgCombined}` : '—'),
    },
    {
      label: 'Electric Range',
      fn: (v) => (v.electricRange ? `${v.electricRange} miles` : '—'),
    },
    { label: 'Colour', fn: (v) => v.colour || '—' },
    { label: 'Dealer', fn: (v) => v.dealer?.name || '—' },
  ];

  const table = el('div', 'vc-spec-table');
  table.innerHTML = `
    <div class="vc-spec-header">
      <div class="vc-spec-label-col"></div>
      ${vehicles.map((v) => `<div class="vc-spec-vehicle-col">${v.model}</div>`).join('')}
    </div>
    ${specs
    .map(({ label, fn }) => {
      const values = vehicles.map((v) => fn(v));
      const allSame = values.every((val) => val === values[0]);
      return `
        <div class="vc-spec-row${allSame ? '' : ' vc-spec-row--diff'}">
          <div class="vc-spec-label-col">${label}</div>
          ${values.map((val) => `<div class="vc-spec-value-col">${val}</div>`).join('')}
        </div>`;
    })
    .join('')}`;

  return table;
}

/* ---------- AI Insights Panel ---------- */

function renderInsightsSection() {
  const section = el('div', 'vc-insights');

  const header = el('div', 'vc-insights-header');
  header.innerHTML = `
    <div class="vc-insights-badge">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      AI Comparison Insights
    </div>
    <div class="vc-insights-tabs">
      <button type="button" class="vc-tab vc-tab--active" data-persona="lifestyle">Lifestyle</button>
      <button type="button" class="vc-tab" data-persona="russell">Russell</button>
    </div>`;
  section.append(header);

  const content = el('div', 'vc-insights-content');
  // Loading skeleton
  content.innerHTML = `
    <div class="vc-insight-card vc-insight-card--loading"><div class="vc-skeleton-shimmer"></div></div>
    <div class="vc-insight-card vc-insight-card--loading"><div class="vc-skeleton-shimmer"></div></div>
    <div class="vc-insight-card vc-insight-card--loading"><div class="vc-skeleton-shimmer"></div></div>`;
  section.append(content);

  return section;
}

function populateInsights(section, summaryData) {
  const content = section.querySelector('.vc-insights-content');

  function renderCards(persona) {
    content.innerHTML = '';
    if (!summaryData) {
      content.innerHTML = '<p class="vc-insights-fallback">AI insights are currently unavailable. Please try again later.</p>';
      return;
    }
    const keys = PERSONA_FILTERS[persona] || PERSONA_FILTERS.lifestyle;
    AI_SECTIONS.filter(({ key }) => keys.includes(key)).forEach(
      ({ key, title }) => {
        const text = summaryData[key];
        if (!text) return;
        const card = el('div', 'vc-insight-card');
        card.innerHTML = `<h4 class="vc-insight-title">${title}</h4><p class="vc-insight-text">${text}</p>`;
        content.append(card);
      },
    );
  }

  // Tab switching
  section.querySelector('.vc-insights-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.vc-tab');
    if (!tab) return;
    section
      .querySelectorAll('.vc-tab')
      .forEach((t) => t.classList.remove('vc-tab--active'));
    tab.classList.add('vc-tab--active');
    renderCards(tab.dataset.persona);
  });

  // Initial render
  renderCards('lifestyle');
}

/* ---------- Vehicle Header Cards ---------- */

function renderVehicleCards(vehicles, detailPath) {
  const row = el('div', 'vc-vehicles');

  vehicles.forEach((v) => {
    const img = v.images?.sort((a, b) => a.order - b.order)[0];
    const card = el('div', 'vc-vehicle-card');
    card.innerHTML = `
      <a href="${detailPath}?id=${v.id}" class="vc-vehicle-img">
        <img src="${img?.url || ''}" alt="${img?.alt || v.model}" loading="lazy">
      </a>
      <div class="vc-vehicle-info">
        <h3 class="vc-vehicle-name"><a href="${detailPath}?id=${v.id}">${v.model}</a></h3>
        <span class="vc-vehicle-price">${formatPrice(v.price)}</span>
        <span class="vc-vehicle-meta">${formatDate(v.registrationDate)} · ${formatMileage(v.mileage)}</span>
      </div>`;
    row.append(card);
  });

  return row;
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

  // Get vehicle IDs from URL
  const params = new URLSearchParams(window.location.search);
  const ids = (params.get('ids') || '').split(',').filter(Boolean);

  if (ids.length < 2) {
    block.append(
      el(
        'div',
        'vc-error',
        `
      <h2>Select vehicles to compare</h2>
      <p>Choose at least 2 vehicles from the search results to see a side-by-side comparison.</p>
      <a href="/used-cars/inventory" class="vc-btn vc-btn--primary">Browse vehicles</a>
    `,
      ),
    );
    return;
  }

  // Header
  const header = el('div', 'vc-header');
  header.innerHTML = `
    <a href="/used-cars/inventory" class="vc-back-link">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      Back to search
    </a>
    <h2 class="vc-title">Vehicle Comparison</h2>`;
  block.append(header);

  // Skeleton
  const skeleton = renderSkeleton();
  block.append(skeleton);

  try {
    // Fire both queries in parallel — specs render instantly, AI arrives later
    const [data, aiData] = await Promise.all([
      queryAPI(COMPARE_QUERY, { ids }),
      queryAPI(AI_SUMMARY_QUERY, { ids }).catch(() => null),
    ]);
    const vehicles = data.compareVehicles?.vehicles || [];

    if (vehicles.length < 2) {
      skeleton.replaceWith(
        el(
          'div',
          'vc-error',
          '<p>Could not load comparison data. Please try again.</p>',
        ),
      );
      return;
    }

    const wrapper = el('div', 'vc-content');

    // Vehicle cards at top
    wrapper.append(renderVehicleCards(vehicles, detailPath));

    // Spec comparison table
    wrapper.append(renderSpecTable(vehicles));

    // AI Insights (render section with data from backend)
    const insightsSection = renderInsightsSection();
    wrapper.append(insightsSection);
    populateInsights(insightsSection, aiData?.compareVehicleSummary || null);

    skeleton.replaceWith(wrapper);
  } catch (err) {
    skeleton.replaceWith(
      el(
        'div',
        'vc-error',
        `<p>Unable to load comparison. Please try again later.</p><p class="vc-error-detail">${err.message}</p>`,
      ),
    );
  }
}
