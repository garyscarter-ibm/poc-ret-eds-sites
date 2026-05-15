import queryAPI from '../../scripts/used-cars-api.js';
import { formatPrice, formatMonthly } from '../../scripts/used-cars-config.js';

/* ---------- GraphQL Queries ---------- */

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

/* ---------- Helpers ---------- */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

/* ---------- Skeleton ---------- */

function renderSkeleton() {
  const skeleton = el('div', 'fc-skeleton');
  skeleton.innerHTML = `
    <div class="fc-skeleton-tabs">
      <div class="fc-skeleton-tab"></div>
      <div class="fc-skeleton-tab"></div>
    </div>
    <div class="fc-skeleton-card">
      <div class="fc-skeleton-line fc-skeleton-line--wide"></div>
      <div class="fc-skeleton-line fc-skeleton-line--medium"></div>
      <div class="fc-skeleton-grid">
        <div class="fc-skeleton-line fc-skeleton-line--narrow"></div>
        <div class="fc-skeleton-line fc-skeleton-line--narrow"></div>
        <div class="fc-skeleton-line fc-skeleton-line--narrow"></div>
        <div class="fc-skeleton-line fc-skeleton-line--narrow"></div>
      </div>
    </div>`;
  return skeleton;
}

/* ---------- Finance Render ---------- */

function renderFinance(quotes, block) {
  block.textContent = '';

  if (!quotes || !quotes.length) {
    block.innerHTML = '<p class="fc-empty">No finance options available for this vehicle.</p>';
    return;
  }

  const title = el('h2', 'fc-title', 'Finance Options');
  block.append(title);

  const toggle = el('div', 'fc-toggle');
  const cards = el('div', 'fc-cards');

  quotes.forEach((q, i) => {
    const btn = el('button', `fc-tab-btn${i === 0 ? ' active' : ''}`, q.productName);
    btn.dataset.index = i;
    toggle.append(btn);

    const card = el('div', `fc-card${i === 0 ? ' active' : ''}`);
    card.dataset.index = i;
    card.innerHTML = `
      <div class="fc-headline">
        <span class="fc-monthly">${formatMonthly(q.monthlyPayment)}</span>
        <span class="fc-apr">${q.apr}% APR</span>
      </div>
      <div class="fc-grid">
        <div class="fc-item"><span class="fc-label">Term</span><span class="fc-value">${q.term} months</span></div>
        <div class="fc-item"><span class="fc-label">Deposit</span><span class="fc-value">${formatPrice(q.totalDeposit)}</span></div>
        <div class="fc-item"><span class="fc-label">Total Payable</span><span class="fc-value">${formatPrice(q.totalAmountPayable)}</span></div>
        ${q.residualValue ? `<div class="fc-item"><span class="fc-label">Final Payment</span><span class="fc-value">${formatPrice(q.residualValue)}</span></div>` : ''}
        <div class="fc-item"><span class="fc-label">Annual Mileage</span><span class="fc-value">${q.annualMileage?.toLocaleString('en-GB')} miles</span></div>
        <div class="fc-item"><span class="fc-label">Credit Charges</span><span class="fc-value">${formatPrice(q.chargesForCredit)}</span></div>
      </div>
      <details class="fc-adjust">
        <summary>Adjust Finance</summary>
        <div class="fc-sliders">
          <label class="fc-slider-label">Deposit: <strong>£<span class="fc-deposit-display">${q.cashDeposit}</span></strong>
            <input type="range" class="fc-slider" data-field="deposit" min="0" max="${Math.round(q.vehiclePrice * 0.5)}" step="500" value="${q.cashDeposit}">
          </label>
          <label class="fc-slider-label">Term: <strong><span class="fc-term-display">${q.term}</span> months</strong>
            <input type="range" class="fc-slider" data-field="term" min="24" max="60" step="12" value="${q.term}">
          </label>
          <label class="fc-slider-label">Annual Mileage: <strong><span class="fc-mileage-display">${q.annualMileage}</span> miles</strong>
            <input type="range" class="fc-slider" data-field="annualMileage" min="5000" max="20000" step="1000" value="${q.annualMileage}">
          </label>
        </div>
      </details>
      <p class="fc-disclaimer">Representative example. Finance subject to status.</p>`;
    cards.append(card);
  });

  // Tab switching
  toggle.addEventListener('click', (e) => {
    const btn = e.target.closest('.fc-tab-btn');
    if (!btn) return;
    toggle.querySelectorAll('.fc-tab-btn').forEach((b) => b.classList.remove('active'));
    cards.querySelectorAll('.fc-card').forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');
    cards.querySelector(`[data-index="${btn.dataset.index}"]`).classList.add('active');
  });

  // Slider recalculation (debounced) with loading state
  let debounceTimer;
  cards.addEventListener('input', (e) => {
    const slider = e.target.closest('.fc-slider');
    if (!slider) return;
    const card = slider.closest('.fc-card');
    const { field } = slider.dataset;
    const val = Number(slider.value);

    // Update display immediately
    if (field === 'deposit') card.querySelector('.fc-deposit-display').textContent = val.toLocaleString('en-GB');
    if (field === 'term') card.querySelector('.fc-term-display').textContent = val;
    if (field === 'annualMileage') card.querySelector('.fc-mileage-display').textContent = val.toLocaleString('en-GB');

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const idx = Number(card.dataset.index);
      const { quoteId } = quotes[idx];
      const input = { quoteId };
      if (field === 'deposit') input.deposit = val;
      if (field === 'term') input.term = val;
      if (field === 'annualMileage') input.annualMileage = val;

      // Show loading state
      card.classList.add('fc-card--loading');

      try {
        const data = await queryAPI(RECALC_MUTATION, { input });
        const updated = data.recalculateFinance;
        if (updated) {
          quotes[idx] = { ...quotes[idx], ...updated };
          card.querySelector('.fc-monthly').textContent = formatMonthly(updated.monthlyPayment);
          card.querySelector('.fc-apr').textContent = `${updated.apr}% APR`;
          const items = card.querySelectorAll('.fc-value');
          items[0].textContent = `${updated.term} months`;
          items[1].textContent = formatPrice(updated.totalDeposit);
          items[2].textContent = formatPrice(updated.totalAmountPayable);
        }
      } catch {
        /* silent fail on recalc */
      } finally {
        card.classList.remove('fc-card--loading');
      }
    }, 600);
  });

  block.append(toggle, cards);
}

/* ---------- Main Decorate ---------- */

export default async function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const vehicleId = params.get('id');

  if (!vehicleId) {
    block.innerHTML = '<p class="fc-empty">No vehicle selected.</p>';
    return;
  }

  // Show skeleton while loading
  block.textContent = '';
  block.append(renderSkeleton());

  try {
    const data = await queryAPI(FINANCE_QUERY, { vehicleId });
    const quotes = data.vehicleFinanceQuotes || [];
    renderFinance(quotes, block);
  } catch {
    block.innerHTML = '<p class="fc-empty">Unable to load finance options.</p>';
  }
}
