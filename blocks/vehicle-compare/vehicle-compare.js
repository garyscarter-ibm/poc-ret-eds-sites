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

/* ---------- Helpers ---------- */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

/* ---------- AI Insight Generation (client-side) ---------- */

function generateInsights(vehicles, persona) {
  const insights = [];

  if (persona === 'lifestyle') {
    // Price comparison
    const sorted = [...vehicles].sort((a, b) => a.price - b.price);
    if (sorted.length >= 2) {
      const diff = sorted[sorted.length - 1].price - sorted[0].price;
      insights.push({
        title: 'Value',
        text: `The ${sorted[0].model} offers the most accessible entry point at ${formatPrice(sorted[0].price)}, which is ${formatPrice(diff)} less than the ${sorted[sorted.length - 1].model}. Consider what that saving could fund — a holiday, home improvements, or simply peace of mind.`,
      });
    }

    // Running costs
    const fuelEfficient = [...vehicles].sort((a, b) => (b.mpgCombined || 0) - (a.mpgCombined || 0));
    if (fuelEfficient[0]?.mpgCombined) {
      insights.push({
        title: 'Running Costs',
        text: `For daily commuting, the ${fuelEfficient[0].model} leads with ${fuelEfficient[0].mpgCombined} mpg combined. ${fuelEfficient[0].co2Emissions ? `Its ${fuelEfficient[0].co2Emissions} g/km CO₂ output also means lower road tax.` : ''}`,
      });
    }

    // Practicality
    const bodyTypes = vehicles.map((v) => `${v.model} (${v.bodyType?.toLowerCase() || 'saloon'})`);
    insights.push({
      title: 'Lifestyle Fit',
      text: `Consider your typical week: ${bodyTypes.join(' vs ')}. ${vehicles.some((v) => v.bodyType === 'ESTATE' || v.bodyType === 'SUV') ? 'The estate/SUV option gives you space for family trips and weekend adventures.' : 'Both are well-suited to urban driving with presence.'}`,
    });

    // Mileage/age
    const freshest = [...vehicles].sort((a, b) => (b.registrationDate || '').localeCompare(a.registrationDate || ''));
    if (freshest[0]) {
      insights.push({
        title: 'Peace of Mind',
        text: `The ${freshest[0].model} is the newest, registered ${formatDate(freshest[0].registrationDate)} with ${formatMileage(freshest[0].mileage)}. Lower mileage typically means more warranty remaining and fewer wear items to budget for.`,
      });
    }
  } else if (persona === 'performance') {
    // Power comparison
    const powerful = [...vehicles].sort((a, b) => (b.power || 0) - (a.power || 0));
    if (powerful[0]?.power) {
      insights.push({
        title: 'Power Delivery',
        text: `The ${powerful[0].model} tops the group at ${formatPower(powerful[0].power)}${powerful[0].acceleration ? `, reaching 62 mph in just ${formatAcceleration(powerful[0].acceleration)}` : ''}. ${powerful[0].fuelType === 'PETROL_PLUG_IN_HYBRID' ? 'Its hybrid powertrain combines instant electric torque with sustained performance.' : 'Pure combustion power for an engaging driving experience.'}`,
      });
    }

    // Drivetrain
    const awdVehicles = vehicles.filter((v) => v.drivetrain === 'AWD' || v.drivetrain === 'XDRIVE');
    if (awdVehicles.length) {
      insights.push({
        title: 'Traction',
        text: `${awdVehicles.map((v) => v.model).join(' and ')} ${awdVehicles.length > 1 ? 'feature' : 'features'} xDrive all-wheel drive, distributing power dynamically for maximum grip in all conditions.`,
      });
    }

    // Top speed
    const fastest = [...vehicles].sort((a, b) => (b.topSpeed || 0) - (a.topSpeed || 0));
    if (fastest[0]?.topSpeed) {
      insights.push({
        title: 'Top End',
        text: `For track day potential, the ${fastest[0].model} reaches ${formatTopSpeed(fastest[0].topSpeed)}${fastest.length > 1 && fastest[1]?.topSpeed ? ` vs the ${fastest[1].model} at ${formatTopSpeed(fastest[1].topSpeed)}` : ''}.`,
      });
    }

    // Weight/efficiency
    insights.push({
      title: 'The Verdict',
      text: 'Both are M-bred machines engineered for driving pleasure. The choice comes down to whether you prioritise outright power or a more balanced, exploitable chassis.',
    });
  }

  return insights;
}

/* ---------- Skeleton ---------- */

function renderSkeleton() {
  return el('div', 'vc-loading', `
    <div class="vc-skeleton-cards">
      <div class="vc-skeleton-card"><div class="vc-skeleton-shimmer"></div></div>
      <div class="vc-skeleton-card"><div class="vc-skeleton-shimmer"></div></div>
    </div>
  `);
}

/* ---------- Spec Table ---------- */

function renderSpecTable(vehicles) {
  const specs = [
    { label: 'Price', fn: (v) => formatPrice(v.price) },
    { label: 'Series', fn: (v) => v.series || '—' },
    { label: 'Body Type', fn: (v) => (v.bodyType || '—').toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) },
    { label: 'Mileage', fn: (v) => formatMileage(v.mileage) },
    { label: 'Registration', fn: (v) => formatDate(v.registrationDate) },
    { label: 'Fuel Type', fn: (v) => formatFuelType(v.fuelType) },
    { label: 'Transmission', fn: (v) => formatTransmission(v.transmission) },
    { label: 'Power', fn: (v) => formatPower(v.power) },
    { label: '0-62 mph', fn: (v) => formatAcceleration(v.acceleration) },
    { label: 'Top Speed', fn: (v) => formatTopSpeed(v.topSpeed) },
    { label: 'CO₂', fn: (v) => (v.co2Emissions ? `${v.co2Emissions} g/km` : '—') },
    { label: 'MPG (Combined)', fn: (v) => (v.mpgCombined ? `${v.mpgCombined}` : '—') },
    { label: 'Electric Range', fn: (v) => (v.electricRange ? `${v.electricRange} miles` : '—') },
    { label: 'Colour', fn: (v) => v.colour || '—' },
    { label: 'Dealer', fn: (v) => v.dealer?.name || '—' },
  ];

  const table = el('div', 'vc-spec-table');
  table.innerHTML = `
    <div class="vc-spec-header">
      <div class="vc-spec-label-col"></div>
      ${vehicles.map((v) => `<div class="vc-spec-vehicle-col">${v.model}</div>`).join('')}
    </div>
    ${specs.map(({ label, fn }) => {
    const values = vehicles.map((v) => fn(v));
    const allSame = values.every((val) => val === values[0]);
    return `
        <div class="vc-spec-row${allSame ? '' : ' vc-spec-row--diff'}">
          <div class="vc-spec-label-col">${label}</div>
          ${values.map((val) => `<div class="vc-spec-value-col">${val}</div>`).join('')}
        </div>`;
  }).join('')}`;

  return table;
}

/* ---------- AI Insights Panel ---------- */

function renderInsights(vehicles) {
  const section = el('div', 'vc-insights');

  const header = el('div', 'vc-insights-header');
  header.innerHTML = `
    <div class="vc-insights-badge">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      AI Comparison Insights
    </div>
    <div class="vc-insights-tabs">
      <button type="button" class="vc-tab vc-tab--active" data-persona="lifestyle">Lifestyle</button>
      <button type="button" class="vc-tab" data-persona="performance">Performance</button>
    </div>`;
  section.append(header);

  const content = el('div', 'vc-insights-content');
  section.append(content);

  function renderPersona(persona) {
    const insights = generateInsights(vehicles, persona);
    content.innerHTML = '';
    insights.forEach(({ title, text }) => {
      const card = el('div', 'vc-insight-card');
      card.innerHTML = `<h4 class="vc-insight-title">${title}</h4><p class="vc-insight-text">${text}</p>`;
      content.append(card);
    });
  }

  // Tab switching
  header.addEventListener('click', (e) => {
    const tab = e.target.closest('.vc-tab');
    if (!tab) return;
    header.querySelectorAll('.vc-tab').forEach((t) => t.classList.remove('vc-tab--active'));
    tab.classList.add('vc-tab--active');
    renderPersona(tab.dataset.persona);
  });

  // Initial render
  renderPersona('lifestyle');

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
    block.append(el('div', 'vc-error', `
      <h2>Select vehicles to compare</h2>
      <p>Choose at least 2 vehicles from the search results to see a side-by-side comparison.</p>
      <a href="/used-cars/inventory" class="vc-btn vc-btn--primary">Browse vehicles</a>
    `));
    return;
  }

  // Header
  const header = el('div', 'vc-header');
  header.innerHTML = '<h2 class="vc-title">Vehicle Comparison</h2>';
  block.append(header);

  // Skeleton
  const skeleton = renderSkeleton();
  block.append(skeleton);

  try {
    const data = await queryAPI(COMPARE_QUERY, { ids });
    const vehicles = data.compareVehicles?.vehicles || [];

    if (vehicles.length < 2) {
      skeleton.replaceWith(el('div', 'vc-error', '<p>Could not load comparison data. Please try again.</p>'));
      return;
    }

    const wrapper = el('div', 'vc-content');

    // Vehicle cards at top
    wrapper.append(renderVehicleCards(vehicles, detailPath));

    // Spec comparison table
    wrapper.append(renderSpecTable(vehicles));

    // AI Insights
    wrapper.append(renderInsights(vehicles));

    skeleton.replaceWith(wrapper);
  } catch (err) {
    skeleton.replaceWith(
      el('div', 'vc-error', `<p>Unable to load comparison. Please try again later.</p><p class="vc-error-detail">${err.message}</p>`),
    );
  }
}
