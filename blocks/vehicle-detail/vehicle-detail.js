import queryAPI from '../../scripts/used-cars-api.js';
import {
  formatPrice,
  formatMileage,
  formatDate,
  formatFuelType,
  formatTransmission,
  formatPower,
  formatTorque,
  formatAcceleration,
  formatTopSpeed,
  formatDimension,
  formatWeight,
  formatVolume,
  formatDrivetrain,
  formatMonthly,
  getUserId,
} from '../../scripts/used-cars-config.js';

/* ---------- GraphQL Queries ---------- */

const VEHICLE_QUERY = `query GetVehicle($id: ID!) {
  usedVehicle(id: $id) {
    id vin series model price bodyType fuelType transmission drivetrain
    colour upholstery mileage registrationDate registrationNumber
    power torque acceleration topSpeed
    co2Emissions mpgCombined mpgUrban mpgExtraUrban
    electricRange electricRangeCity energyConsumption
    insuranceGroup financeAvailable estimatedMonthlyPayment
    length width height weight bootVolume
    images { url alt order }
    standardFeatures optionalPacks
    dealer { id name address postcode phone latitude longitude }
  }
}`;

const FINANCE_QUERY = `query VehicleFinance($vehicleId: ID!) {
  vehicleFinanceQuotes(vehicleId: $vehicleId) {
    quoteId monthlyPayment apr term totalDeposit cashDeposit
    balance residualValue totalAmountPayable chargesForCredit
    annualMileage contractMileage excessMileageRate
    productName productKey vehiclePrice validFrom validTo
  }
}`;

const RECALC_MUTATION = `mutation RecalcFinance($input: RecalculateFinanceInput!) {
  recalculateFinance(input: $input) {
    quoteId monthlyPayment apr term totalDeposit cashDeposit
    balance residualValue totalAmountPayable chargesForCredit
    annualMileage contractMileage excessMileageRate
    productName productKey vehiclePrice validFrom validTo
  }
}`;

const ENQUIRY_MUTATION = `mutation SubmitEnquiry($input: VehicleEnquiryInput!) {
  submitVehicleEnquiry(input: $input) { id success message }
}`;

const GARAGE_ADD = `mutation AddToGarage($userId: String!, $vehicleId: ID!) {
  addToGarage(userId: $userId, vehicleId: $vehicleId)
}`;

const GARAGE_REMOVE = `mutation RemoveFromGarage($userId: String!, $vehicleId: ID!) {
  removeFromGarage(userId: $userId, vehicleId: $vehicleId)
}`;

const GARAGE_IDS = `query GarageIds($userId: String!) {
  garageVehicleIds(userId: $userId)
}`;

/* ---------- Helpers ---------- */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

function specRow(label, value) {
  if (!value || value === '—') return '';
  return `<div class="vd-spec-row"><span class="vd-spec-label">${label}</span><span class="vd-spec-value">${value}</span></div>`;
}

/* ---------- Skeleton ---------- */

function renderSkeleton(block) {
  block.innerHTML = `
    <div class="vd-skeleton">
      <div class="vd-skeleton-gallery"><div class="vd-skeleton-shimmer"></div></div>
      <div class="vd-skeleton-body">
        <div class="vd-skeleton-line vd-skeleton-line--wide"></div>
        <div class="vd-skeleton-line vd-skeleton-line--medium"></div>
        <div class="vd-skeleton-line vd-skeleton-line--narrow"></div>
        <div class="vd-skeleton-line vd-skeleton-line--wide"></div>
        <div class="vd-skeleton-line vd-skeleton-line--medium"></div>
      </div>
    </div>`;
}

/* ---------- Error State ---------- */

function renderError(block, message) {
  block.innerHTML = `
    <div class="vd-error">
      <h2>Vehicle not found</h2>
      <p>${message}</p>
      <a href="/used-cars/inventory" class="vd-error-link">Back to search results</a>
    </div>`;
}

/* ---------- Image Gallery ---------- */

function renderGallery(images) {
  const sorted = [...images].sort((a, b) => a.order - b.order);
  const gallery = el('div', 'vd-gallery');

  // Main image
  const main = el('div', 'vd-gallery-main');
  const mainImg = document.createElement('img');
  mainImg.src = sorted[0]?.url || '';
  mainImg.alt = sorted[0]?.alt || 'Vehicle image';
  mainImg.loading = 'eager';
  main.append(mainImg);

  // Navigation arrows
  const prevBtn = el('button', 'vd-gallery-nav vd-gallery-prev');
  prevBtn.innerHTML = '<img src="/icons/chevron-left.svg" alt="Previous" width="24" height="24">';
  prevBtn.setAttribute('aria-label', 'Previous image');
  const nextBtn = el('button', 'vd-gallery-nav vd-gallery-next');
  nextBtn.innerHTML = '<img src="/icons/chevron-right.svg" alt="Next" width="24" height="24">';
  nextBtn.setAttribute('aria-label', 'Next image');
  main.append(prevBtn, nextBtn);

  // Counter
  const counter = el('div', 'vd-gallery-counter', `1 / ${sorted.length}`);
  main.append(counter);

  gallery.append(main);

  // Thumbnails
  const thumbStrip = el('div', 'vd-gallery-thumbs');
  sorted.forEach((img, i) => {
    const thumb = document.createElement('img');
    thumb.src = img.url;
    thumb.alt = img.alt || `Image ${i + 1}`;
    thumb.loading = 'lazy';
    thumb.className = i === 0 ? 'vd-thumb active' : 'vd-thumb';
    thumb.dataset.index = i;
    thumbStrip.append(thumb);
  });
  gallery.append(thumbStrip);

  // Gallery logic
  let current = 0;
  function goTo(idx) {
    current = (idx + sorted.length) % sorted.length;
    mainImg.src = sorted[current].url;
    mainImg.alt = sorted[current].alt || `Image ${current + 1}`;
    counter.textContent = `${current + 1} / ${sorted.length}`;
    thumbStrip.querySelectorAll('.vd-thumb').forEach((t, i) => {
      t.classList.toggle('active', i === current);
    });
    // Scroll active thumb into view
    const activeThumb = thumbStrip.querySelector('.vd-thumb.active');
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  thumbStrip.addEventListener('click', (e) => {
    if (e.target.dataset.index != null) goTo(Number(e.target.dataset.index));
  });

  return gallery;
}

/* ---------- Key Facts Bar ---------- */

function renderKeyFacts(vehicle) {
  const facts = el('div', 'vd-key-facts');
  const items = [
    { label: 'Mileage', value: formatMileage(vehicle.mileage) },
    { label: 'Registered', value: formatDate(vehicle.registrationDate) },
    { label: 'Fuel', value: formatFuelType(vehicle.fuelType) },
    { label: 'Transmission', value: formatTransmission(vehicle.transmission) },
    { label: 'Drivetrain', value: formatDrivetrain(vehicle.drivetrain) },
    {
      label: 'Body',
      value: vehicle.bodyType
        ? vehicle.bodyType.charAt(0) + vehicle.bodyType.slice(1).toLowerCase()
        : '—',
    },
  ];
  items.forEach(({ label, value }) => {
    if (value && value !== '—') {
      facts.append(
        el(
          'div',
          'vd-fact',
          `<span class="vd-fact-label">${label}</span><span class="vd-fact-value">${value}</span>`,
        ),
      );
    }
  });
  return facts;
}

/* ---------- Overview / Header ---------- */

function renderOverview(vehicle, isSaved, onToggleSave) {
  const overview = el('div', 'vd-overview');

  // Left column: title + details
  const left = el('div', 'vd-overview-left');
  const h1 = el('h1', 'vd-title', vehicle.model);
  left.append(h1);

  const details = el('div', 'vd-overview-details');
  if (vehicle.colour) details.append(el('span', 'vd-detail-tag', vehicle.colour));
  if (vehicle.upholstery) details.append(el('span', 'vd-detail-tag', vehicle.upholstery));
  if (vehicle.registrationNumber) details.append(el('span', 'vd-detail-tag', vehicle.registrationNumber));
  left.append(details);
  overview.append(left);

  // Right column: price card
  const right = el('div', 'vd-price-card');
  right.innerHTML = `
    <div class="vd-price">${formatPrice(vehicle.price)}</div>
    ${vehicle.estimatedMonthlyPayment ? `<div class="vd-monthly">From ${formatMonthly(vehicle.estimatedMonthlyPayment)} PCP</div>` : ''}
    <div class="vd-price-ctas">
      <a href="#enquire" class="vd-btn vd-btn--primary">Enquire Now</a>
      <a href="#enquire" class="vd-btn vd-btn--secondary">Book a Test Drive</a>
    </div>`;

  // Heart/save button
  const heartBtn = el('button', `vd-heart-btn${isSaved ? ' saved' : ''}`);
  heartBtn.innerHTML = `<img src="/icons/${isSaved ? 'heart-filled' : 'heart'}.svg" alt="Save" width="24" height="24">`;
  heartBtn.setAttribute(
    'aria-label',
    isSaved ? 'Remove from saved' : 'Save vehicle',
  );
  heartBtn.addEventListener('click', () => onToggleSave(heartBtn));
  right.append(heartBtn);

  overview.append(right);
  return overview;
}

/* ---------- Specifications ---------- */

function renderSpecs(vehicle) {
  const section = el('div', 'vd-specs');
  section.innerHTML = '<h2 class="vd-section-title">Specifications</h2>';

  const tabs = el('div', 'vd-tabs');
  const tabNav = el('div', 'vd-tab-nav');
  const tabPanels = el('div', 'vd-tab-panels');

  const tabData = [
    {
      id: 'performance',
      label: 'Performance',
      content: [
        specRow('Power', formatPower(vehicle.power)),
        specRow('Torque', formatTorque(vehicle.torque)),
        specRow('0-62 mph', formatAcceleration(vehicle.acceleration)),
        specRow('Top Speed', formatTopSpeed(vehicle.topSpeed)),
        specRow('Insurance Group', vehicle.insuranceGroup),
      ].join(''),
    },
    {
      id: 'efficiency',
      label: 'Efficiency',
      content: [
        specRow(
          'CO₂ Emissions',
          vehicle.co2Emissions ? `${vehicle.co2Emissions} g/km` : null,
        ),
        specRow(
          'MPG (Combined)',
          vehicle.mpgCombined ? `${vehicle.mpgCombined} mpg` : null,
        ),
        specRow(
          'MPG (Urban)',
          vehicle.mpgUrban ? `${vehicle.mpgUrban} mpg` : null,
        ),
        specRow(
          'MPG (Extra Urban)',
          vehicle.mpgExtraUrban ? `${vehicle.mpgExtraUrban} mpg` : null,
        ),
        specRow(
          'Electric Range',
          vehicle.electricRange ? `${vehicle.electricRange} miles` : null,
        ),
        specRow(
          'Electric Range (City)',
          vehicle.electricRangeCity
            ? `${vehicle.electricRangeCity} miles`
            : null,
        ),
        specRow(
          'Energy Consumption',
          vehicle.energyConsumption
            ? `${vehicle.energyConsumption} kWh/100km`
            : null,
        ),
      ].join(''),
    },
    {
      id: 'dimensions',
      label: 'Dimensions',
      content: [
        specRow('Length', formatDimension(vehicle.length)),
        specRow('Width', formatDimension(vehicle.width)),
        specRow('Height', formatDimension(vehicle.height)),
        specRow('Weight', formatWeight(vehicle.weight)),
        specRow('Boot Volume', formatVolume(vehicle.bootVolume)),
      ].join(''),
    },
  ];

  // Filter out tabs with no content
  const activeTabs = tabData.filter((t) => t.content.trim().length > 0);

  activeTabs.forEach((tab, i) => {
    const btn = el(
      'button',
      `vd-tab-btn${i === 0 ? ' active' : ''}`,
      tab.label,
    );
    btn.dataset.tab = tab.id;
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    tabNav.append(btn);

    const panel = el('div', `vd-tab-panel${i === 0 ? ' active' : ''}`);
    panel.dataset.tab = tab.id;
    panel.innerHTML = tab.content;
    tabPanels.append(panel);
  });

  tabNav.addEventListener('click', (e) => {
    const btn = e.target.closest('.vd-tab-btn');
    if (!btn) return;
    tabNav.querySelectorAll('.vd-tab-btn').forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    tabPanels
      .querySelectorAll('.vd-tab-panel')
      .forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    tabPanels
      .querySelector(`[data-tab="${btn.dataset.tab}"]`)
      .classList.add('active');
  });

  tabs.append(tabNav, tabPanels);
  section.append(tabs);
  return section;
}

/* ---------- Features ---------- */

function renderFeatures(vehicle) {
  const { standardFeatures, optionalPacks } = vehicle;
  if (
    (!standardFeatures || !standardFeatures.length)
    && (!optionalPacks || !optionalPacks.length)
  ) return null;

  const section = el('div', 'vd-features');
  section.innerHTML = '<h2 class="vd-section-title">Features &amp; Equipment</h2>';

  if (standardFeatures && standardFeatures.length) {
    const list = el('div', 'vd-features-list');
    standardFeatures.forEach((f) => list.append(el('span', 'vd-feature-pill', f)));
    section.append(el('h3', 'vd-features-subtitle', 'Standard Features'), list);
  }

  if (optionalPacks && optionalPacks.length) {
    const list = el('div', 'vd-features-list');
    optionalPacks.forEach((p) => list.append(el('span', 'vd-feature-pill vd-feature-pill--highlight', p)));
    section.append(el('h3', 'vd-features-subtitle', 'Optional Packs'), list);
  }

  return section;
}

/* ---------- Dealer Info ---------- */

function renderDealer(dealer) {
  if (!dealer) return null;
  const section = el('div', 'vd-dealer');
  section.innerHTML = `
    <h2 class="vd-section-title">Dealer</h2>
    <div class="vd-dealer-card">
      <h3 class="vd-dealer-name">${dealer.name}</h3>
      ${dealer.address ? `<p class="vd-dealer-address">${dealer.address}${dealer.postcode ? `, ${dealer.postcode}` : ''}</p>` : ''}
      ${dealer.phone ? `<a href="tel:${dealer.phone}" class="vd-dealer-phone">${dealer.phone}</a>` : ''}
      ${dealer.latitude && dealer.longitude ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${dealer.latitude},${dealer.longitude}" target="_blank" rel="noopener" class="vd-btn vd-btn--secondary vd-dealer-directions">Get Directions</a>` : ''}
    </div>`;
  return section;
}

/* ---------- Finance Calculator ---------- */

function renderFinance(quotes) {
  if (!quotes || !quotes.length) return null;

  const section = el('div', 'vd-finance');
  section.innerHTML = '<h2 class="vd-section-title">Finance Options</h2>';

  const toggle = el('div', 'vd-finance-toggle');
  const cards = el('div', 'vd-finance-cards');

  quotes.forEach((q, i) => {
    const btn = el(
      'button',
      `vd-finance-tab-btn${i === 0 ? ' active' : ''}`,
      q.productName,
    );
    btn.dataset.index = i;
    toggle.append(btn);

    const card = el('div', `vd-finance-card${i === 0 ? ' active' : ''}`);
    card.dataset.index = i;
    card.innerHTML = `
      <div class="vd-finance-headline">
        <span class="vd-finance-monthly">${formatMonthly(q.monthlyPayment)}</span>
        <span class="vd-finance-apr">${q.apr}% APR</span>
      </div>
      <div class="vd-finance-grid">
        <div class="vd-finance-item"><span class="vd-finance-label">Term</span><span class="vd-finance-value">${q.term} months</span></div>
        <div class="vd-finance-item"><span class="vd-finance-label">Deposit</span><span class="vd-finance-value">${formatPrice(q.totalDeposit)}</span></div>
        <div class="vd-finance-item"><span class="vd-finance-label">Total Payable</span><span class="vd-finance-value">${formatPrice(q.totalAmountPayable)}</span></div>
        ${q.residualValue ? `<div class="vd-finance-item"><span class="vd-finance-label">Final Payment</span><span class="vd-finance-value">${formatPrice(q.residualValue)}</span></div>` : ''}
        <div class="vd-finance-item"><span class="vd-finance-label">Annual Mileage</span><span class="vd-finance-value">${q.annualMileage?.toLocaleString('en-GB')} miles</span></div>
        <div class="vd-finance-item"><span class="vd-finance-label">Credit Charges</span><span class="vd-finance-value">${formatPrice(q.chargesForCredit)}</span></div>
      </div>
      <details class="vd-finance-adjust">
        <summary>Adjust Finance</summary>
        <div class="vd-finance-sliders">
          <label class="vd-slider-label">Deposit: <strong>£<span class="vd-deposit-display">${q.cashDeposit}</span></strong>
            <input type="range" class="vd-slider" data-field="deposit" min="0" max="${Math.round(q.vehiclePrice * 0.5)}" step="500" value="${q.cashDeposit}">
          </label>
          <label class="vd-slider-label">Term: <strong><span class="vd-term-display">${q.term}</span> months</strong>
            <input type="range" class="vd-slider" data-field="term" min="24" max="60" step="12" value="${q.term}">
          </label>
          <label class="vd-slider-label">Annual Mileage: <strong><span class="vd-mileage-display">${q.annualMileage}</span> miles</strong>
            <input type="range" class="vd-slider" data-field="annualMileage" min="5000" max="20000" step="1000" value="${q.annualMileage}">
          </label>
        </div>
      </details>
      <p class="vd-finance-disclaimer">Representative example. Finance subject to status.</p>`;
    cards.append(card);
  });

  // Tab switching
  toggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.vd-finance-tab-btn');
    if (!btn) return;
    toggle
      .querySelectorAll('.vd-finance-tab-btn')
      .forEach((b) => b.classList.remove('active'));
    cards
      .querySelectorAll('.vd-finance-card')
      .forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');
    cards
      .querySelector(`[data-index="${btn.dataset.index}"]`)
      .classList.add('active');
  });

  // Slider recalculation (debounced)
  let debounceTimer;
  cards.addEventListener('input', (e) => {
    const slider = e.target.closest('.vd-slider');
    if (!slider) return;
    const card = slider.closest('.vd-finance-card');
    const { field } = slider.dataset;
    const val = Number(slider.value);

    // Update display
    if (field === 'deposit') card.querySelector('.vd-deposit-display').textContent = val.toLocaleString('en-GB');
    if (field === 'term') card.querySelector('.vd-term-display').textContent = val;
    if (field === 'annualMileage') card.querySelector('.vd-mileage-display').textContent = val.toLocaleString('en-GB');

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const idx = Number(card.dataset.index);
      const { quoteId } = quotes[idx];
      const input = { quoteId };
      if (field === 'deposit') input.deposit = val;
      if (field === 'term') input.term = val;
      if (field === 'annualMileage') input.annualMileage = val;

      try {
        const data = await queryAPI(RECALC_MUTATION, { input });
        const updated = data.recalculateFinance;
        if (updated) {
          quotes[idx] = { ...quotes[idx], ...updated };
          card.querySelector('.vd-finance-monthly').textContent = formatMonthly(
            updated.monthlyPayment,
          );
          card.querySelector('.vd-finance-apr').textContent = `${updated.apr}% APR`;
          const items = card.querySelectorAll('.vd-finance-value');
          items[0].textContent = `${updated.term} months`;
          items[1].textContent = formatPrice(updated.totalDeposit);
          items[2].textContent = formatPrice(updated.totalAmountPayable);
        }
      } catch {
        /* silent fail on recalc */
      }
    }, 600);
  });

  section.append(toggle, cards);
  return section;
}

/* ---------- Enquiry Form ---------- */

function renderEnquiryForm(vehicleId, vehicleModel) {
  const section = el('div', 'vd-enquiry');
  section.id = 'enquire';
  section.innerHTML = `
    <h2 class="vd-section-title">Enquire About This Vehicle</h2>
    <p class="vd-enquiry-subtitle">Interested in the ${vehicleModel}? Fill in your details and a dealer will be in touch.</p>
    <form class="vd-enquiry-form" novalidate>
      <div class="vd-form-row">
        <label class="vd-form-field">
          <span class="vd-form-label">Full Name *</span>
          <input type="text" name="customerName" required autocomplete="name">
        </label>
        <label class="vd-form-field">
          <span class="vd-form-label">Email *</span>
          <input type="email" name="customerEmail" required autocomplete="email">
        </label>
      </div>
      <div class="vd-form-row">
        <label class="vd-form-field">
          <span class="vd-form-label">Phone *</span>
          <input type="tel" name="customerPhone" required autocomplete="tel">
        </label>
        <label class="vd-form-field">
          <span class="vd-form-label">Preferred Contact</span>
          <select name="preferredContactMethod">
            <option value="EMAIL">Email</option>
            <option value="PHONE">Phone</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </label>
      </div>
      <label class="vd-form-field vd-form-field--full">
        <span class="vd-form-label">Message</span>
        <textarea name="message" rows="3" placeholder="Any questions about this vehicle?"></textarea>
      </label>
      <div class="vd-form-checkboxes">
        <label class="vd-checkbox"><input type="checkbox" name="interestedInFinance"> I'm interested in finance options</label>
        <label class="vd-checkbox"><input type="checkbox" name="interestedInPartExchange"> I have a vehicle to part-exchange</label>
      </div>
      <button type="submit" class="vd-btn vd-btn--primary vd-enquiry-submit">Send Enquiry</button>
      <div class="vd-enquiry-status" aria-live="polite"></div>
    </form>`;

  const form = section.querySelector('form');
  const status = section.querySelector('.vd-enquiry-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    status.className = 'vd-enquiry-status';

    const fd = new FormData(form);
    const name = fd.get('customerName')?.trim();
    const email = fd.get('customerEmail')?.trim();
    const phone = fd.get('customerPhone')?.trim();

    if (!name || !email || !phone) {
      status.textContent = 'Please fill in all required fields.';
      status.classList.add('vd-enquiry-status--error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = 'Please enter a valid email address.';
      status.classList.add('vd-enquiry-status--error');
      return;
    }

    const submitBtn = form.querySelector('.vd-enquiry-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
      const input = {
        vehicleId,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        message: fd.get('message')?.trim() || undefined,
        preferredContactMethod: fd.get('preferredContactMethod'),
        interestedInFinance: fd.get('interestedInFinance') === 'on',
        interestedInPartExchange: fd.get('interestedInPartExchange') === 'on',
      };
      const data = await queryAPI(ENQUIRY_MUTATION, { input });
      if (data.submitVehicleEnquiry?.success) {
        status.textContent = 'Enquiry sent successfully! A dealer will be in touch shortly.';
        status.classList.add('vd-enquiry-status--success');
        form.reset();
      } else {
        throw new Error(
          data.submitVehicleEnquiry?.message || 'Submission failed',
        );
      }
    } catch (err) {
      status.textContent = `Something went wrong. Please try again. (${err.message})`;
      status.classList.add('vd-enquiry-status--error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Enquiry';
    }
  });

  return section;
}

/* ---------- Back Navigation ---------- */

function renderBackLink() {
  const nav = el('div', 'vd-back');
  const link = el('a', 'vd-back-link', '← Back to search results');
  link.href = document.referrer && document.referrer.includes('/used-cars/')
    ? document.referrer
    : '/used-cars/inventory';
  nav.append(link);
  return nav;
}

/* ---------- Main Decorate ---------- */

export default async function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const vehicleId = params.get('id');

  if (!vehicleId) {
    renderError(
      block,
      'No vehicle ID provided. Please select a vehicle from the search results.',
    );
    return;
  }

  renderSkeleton(block);

  // Fetch vehicle + garage status + finance in parallel
  let vehicle;
  let garageIds = [];
  let financeQuotes = [];

  try {
    const userId = getUserId();
    const [vehicleData, garageData, financeData] = await Promise.allSettled([
      queryAPI(VEHICLE_QUERY, { id: vehicleId }),
      queryAPI(GARAGE_IDS, { userId }),
      queryAPI(FINANCE_QUERY, { vehicleId }),
    ]);

    if (vehicleData.status === 'rejected' || !vehicleData.value?.usedVehicle) {
      renderError(
        block,
        'This vehicle could not be found. It may have been sold or removed.',
      );
      return;
    }

    vehicle = vehicleData.value.usedVehicle;
    if (garageData.status === 'fulfilled') garageIds = garageData.value?.garageVehicleIds || [];
    if (financeData.status === 'fulfilled') financeQuotes = financeData.value?.vehicleFinanceQuotes || [];
  } catch (err) {
    renderError(block, `Failed to load vehicle details. ${err.message}`);
    return;
  }

  // Update page title
  document.title = `${vehicle.model} | BMW Used Cars`;

  // Clear skeleton and render
  block.textContent = '';
  const isSaved = garageIds.includes(vehicleId);

  // Toggle save handler
  async function onToggleSave(btn) {
    const userId = getUserId();
    const currentlySaved = btn.classList.contains('saved');
    btn.classList.toggle('saved');
    btn.querySelector('img').src = `/icons/${currentlySaved ? 'heart' : 'heart-filled'}.svg`;
    btn.setAttribute(
      'aria-label',
      currentlySaved ? 'Save vehicle' : 'Remove from saved',
    );
    try {
      if (currentlySaved) {
        await queryAPI(GARAGE_REMOVE, { userId, vehicleId });
      } else {
        await queryAPI(GARAGE_ADD, { userId, vehicleId });
      }
    } catch {
      /* optimistic - ignore failures */
    }
  }

  // Build page sections
  block.append(renderBackLink());
  if (vehicle.images?.length) block.append(renderGallery(vehicle.images));
  block.append(renderOverview(vehicle, isSaved, onToggleSave));
  block.append(renderKeyFacts(vehicle));
  block.append(renderSpecs(vehicle));

  const features = renderFeatures(vehicle);
  if (features) block.append(features);

  const dealer = renderDealer(vehicle.dealer);
  if (dealer) block.append(dealer);

  const finance = renderFinance(financeQuotes);
  if (finance) block.append(finance);

  block.append(renderEnquiryForm(vehicleId, vehicle.model));

  // Auto-scroll to enquiry form if hash is #enquire
  if (window.location.hash === '#enquire') {
    setTimeout(() => {
      document
        .getElementById('enquire')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
}
