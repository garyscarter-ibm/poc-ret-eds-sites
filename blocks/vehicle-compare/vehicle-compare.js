import queryAPI from '../../scripts/used-cars-api.js';
import {
  formatPrice,
  formatMonthly,
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

const AI_SUMMARY_QUERY = `query CompareSummary($ids: [ID!]!, $tone: CompareTone) {
  compareVehicleSummary(ids: $ids, tone: $tone) {
    overview
    keyDifferences
    targetBuyer
    valueAssessment
    recommendation
  }
}`;

const FINANCE_QUERY = `query VehicleFinance($vehicleId: ID!) {
  vehicleFinanceQuotes(vehicleId: $vehicleId) {
    quoteId monthlyPayment apr term totalDeposit cashDeposit
    balance residualValue totalAmountPayable chargesForCredit
    annualMileage productName productKey vehiclePrice
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
      <button type="button" class="vc-tab" data-persona="russell">Russell Mode 🏎️</button>
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

function populateInsights(section, summaryData, ids) {
  const content = section.querySelector('.vc-insights-content');
  const cache = { lifestyle: summaryData, russell: null };

  function renderCards(persona) {
    const data = cache[persona];
    if (!data) {
      content.innerHTML = '<p class="vc-insights-fallback">AI insights are currently unavailable. Please try again later.</p>';
      return;
    }
    content.innerHTML = '';
    const keys = PERSONA_FILTERS[persona] || PERSONA_FILTERS.lifestyle;
    AI_SECTIONS.filter(({ key }) => keys.includes(key)).forEach(
      ({ key, title }) => {
        const text = data[key];
        if (!text) return;
        const card = el('div', 'vc-insight-card');
        card.innerHTML = `<h4 class="vc-insight-title">${title}</h4><p class="vc-insight-text">${text}</p>`;
        content.append(card);
      },
    );
  }

  function showLoading() {
    content.innerHTML = `
      <div class="vc-insight-card vc-insight-card--loading"><div class="vc-skeleton-shimmer"></div></div>
      <div class="vc-insight-card vc-insight-card--loading"><div class="vc-skeleton-shimmer"></div></div>
      <div class="vc-insight-card vc-insight-card--loading"><div class="vc-skeleton-shimmer"></div></div>`;
  }

  async function loadAndRender(persona) {
    if (cache[persona]) {
      renderCards(persona);
      return;
    }
    showLoading();
    try {
      const tone = persona.toUpperCase();
      const result = await queryAPI(AI_SUMMARY_QUERY, { ids, tone });
      cache[persona] = result.compareVehicleSummary || null;
    } catch {
      cache[persona] = null;
    }
    renderCards(persona);
  }

  // Tab switching
  section.querySelector('.vc-insights-tabs').addEventListener('click', (e) => {
    const tab = e.target.closest('.vc-tab');
    if (!tab) return;
    section
      .querySelectorAll('.vc-tab')
      .forEach((t) => t.classList.remove('vc-tab--active'));
    tab.classList.add('vc-tab--active');
    loadAndRender(tab.dataset.persona);
  });

  // Initial render
  renderCards('lifestyle');
}

/* ---------- Finance Comparison ---------- */

function renderFinanceGrid(container, vehicles, quotes) {
  const rows = [
    {
      label: 'Monthly Payment',
      fn: (q) => (q ? formatMonthly(q.monthlyPayment) : '—'),
    },
    { label: 'APR', fn: (q) => (q ? `${q.apr}%` : '—') },
    { label: 'Term', fn: (q) => (q ? `${q.term} months` : '—') },
    { label: 'Deposit', fn: (q) => (q ? formatPrice(q.totalDeposit) : '—') },
    {
      label: 'Total Payable',
      fn: (q) => (q ? formatPrice(q.totalAmountPayable) : '—'),
    },
    {
      label: 'Final Payment',
      fn: (q) => (q && q.residualValue ? formatPrice(q.residualValue) : '—'),
    },
    {
      label: 'Credit Charges',
      fn: (q) => (q ? formatPrice(q.chargesForCredit) : '—'),
    },
    {
      label: 'Annual Mileage',
      fn: (q) => (q && q.annualMileage
        ? `${q.annualMileage.toLocaleString('en-GB')} miles`
        : '—'),
    },
  ];

  /* eslint-disable-next-line no-param-reassign */
  container.innerHTML = `
    <div class="vc-finance-header">
      <div class="vc-finance-label-col"></div>
      ${vehicles.map((v) => `<div class="vc-finance-vehicle-col">${v.model}</div>`).join('')}
    </div>
    ${rows
    .map(({ label, fn }) => {
      const values = quotes.map((q) => fn(q));
      const diff = values[0] !== values[1];
      return `
        <div class="vc-finance-row${diff ? ' vc-finance-row--diff' : ''}">
          <div class="vc-finance-label-col">${label}</div>
          ${values.map((val) => `<div class="vc-finance-value-col">${val}</div>`).join('')}
        </div>`;
    })
    .join('')}
    ${quotes.some(Boolean) ? '<p class="vc-finance-disclaimer">Representative example. Finance subject to status.</p>' : ''}`;
}

function renderFinanceComparison(vehicles, financeData) {
  const section = el('div', 'vc-finance');
  section.innerHTML = '<h3 class="vc-finance-title">Finance Comparison</h3>';

  const hasAny = financeData.some((quotes) => quotes && quotes.length);
  if (!hasAny) {
    section.innerHTML
      += '<p class="vc-finance-empty">Finance quotes are not available for these vehicles.</p>';
    return section;
  }

  // Find PCP quotes (or first available) for comparison
  const primaryQuotes = financeData.map((quotes) => {
    if (!quotes || !quotes.length) return null;
    return quotes.find((q) => q.productKey === 'PCP') || quotes[0];
  });

  // Product type tabs
  const allProducts = [
    ...new Set(
      financeData
        .flat()
        .filter(Boolean)
        .map((q) => q.productName),
    ),
  ];

  if (allProducts.length > 1) {
    const tabs = el('div', 'vc-finance-tabs');
    allProducts.forEach((name, i) => {
      const btn = el(
        'button',
        `vc-finance-tab${i === 0 ? ' vc-finance-tab--active' : ''}`,
        name,
      );
      btn.dataset.product = name;
      tabs.append(btn);
    });
    section.append(tabs);

    tabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.vc-finance-tab');
      if (!tab) return;
      tabs
        .querySelectorAll('.vc-finance-tab')
        .forEach((t) => t.classList.remove('vc-finance-tab--active'));
      tab.classList.add('vc-finance-tab--active');
      const { product } = tab.dataset;
      const selected = financeData.map((quotes) => {
        if (!quotes || !quotes.length) return null;
        return quotes.find((q) => q.productName === product) || null;
      });
      renderFinanceGrid(
        section.querySelector('.vc-finance-grid'),
        vehicles,
        selected,
      );
    });
  }

  const grid = el('div', 'vc-finance-grid');
  section.append(grid);
  renderFinanceGrid(grid, vehicles, primaryQuotes);

  return section;
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

async function loadCompareData(block, skeleton, ids, detailPath) {
  let vehicles;
  try {
    const data = await queryAPI(COMPARE_QUERY, { ids });
    vehicles = data.compareVehicles?.vehicles || [];
  } catch (err) {
    skeleton.replaceWith(
      el(
        'div',
        'vc-error',
        `<p>Unable to load comparison. Please try again later.</p><p class="vc-error-detail">${err.message}</p>`,
      ),
    );
    return;
  }

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

  // Render vehicle cards and specs immediately
  const wrapper = el('div', 'vc-content');
  wrapper.append(renderVehicleCards(vehicles, detailPath));
  wrapper.append(renderSpecTable(vehicles));

  // Finance placeholder with skeleton
  const financePlaceholder = el('div', 'vc-finance vc-finance--loading');
  financePlaceholder.innerHTML = `
    <h3 class="vc-finance-title">Finance Comparison</h3>
    <div class="vc-finance-grid">
      <div class="vc-skeleton-shimmer" style="height:200px"></div>
    </div>`;
  wrapper.append(financePlaceholder);

  // AI Insights placeholder (already has its own skeleton)
  const insightsSection = renderInsightsSection();
  wrapper.append(insightsSection);

  skeleton.replaceWith(wrapper);

  // Load finance and AI in parallel, populate when ready
  const [aiData, ...financeResults] = await Promise.all([
    queryAPI(AI_SUMMARY_QUERY, { ids, tone: 'LIFESTYLE' }).catch(() => null),
    ...ids.map((vid) => queryAPI(FINANCE_QUERY, { vehicleId: vid })
      .then((d) => d.vehicleFinanceQuotes || [])
      .catch(() => [])),
  ]);

  // Replace finance skeleton with real content
  financePlaceholder.replaceWith(
    renderFinanceComparison(vehicles, financeResults),
  );

  // Populate AI insights
  populateInsights(insightsSection, aiData?.compareVehicleSummary || null, ids);
}

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

  // Skeleton — visible immediately while data loads
  const skeleton = renderSkeleton();
  block.append(skeleton);

  // Load data without blocking section visibility
  loadCompareData(block, skeleton, ids, detailPath);
}
