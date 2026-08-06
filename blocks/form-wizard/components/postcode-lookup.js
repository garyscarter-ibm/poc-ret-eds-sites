/**
 * Renders the postcode lookup + retailer list.
 * @param {object} fieldConfig - Field configuration
 * @param {object} formState - Current form state
 * @param {function} onChange - Callback (fieldId, value)
 * @param {object} api - API client instance
 * @returns {HTMLElement}
 */
export default function postcodeLookup(fieldConfig, formState, onChange, api) {
  const { id, label, required } = fieldConfig;
  const currentValue = formState.values[id];

  const wrapper = document.createElement('div');
  wrapper.className = 'fw-field fw-field--postcode-lookup';
  wrapper.dataset.fieldId = id;

  // Label
  const labelEl = document.createElement('label');
  labelEl.className = 'fw-field-label';
  labelEl.htmlFor = `fw-${id}-input`;
  labelEl.textContent = label;
  if (required) {
    const star = document.createElement('span');
    star.className = 'fw-field-required';
    star.textContent = ' *';
    star.setAttribute('aria-hidden', 'true');
    labelEl.appendChild(star);
  }

  // Postcode input row
  const inputRow = document.createElement('div');
  inputRow.className = 'fw-postcode-input-row';

  const input = document.createElement('input');
  input.className = 'fw-field-input fw-postcode-input';
  input.id = `fw-${id}-input`;
  input.type = 'text';
  input.placeholder = 'e.g. SW1A 1AA';
  input.autocomplete = 'postal-code';
  if (currentValue?.postcode) input.value = currentValue.postcode;

  const searchBtn = document.createElement('button');
  searchBtn.type = 'button';
  searchBtn.className = 'fw-postcode-search-btn';
  searchBtn.textContent = 'Find centres';

  inputRow.appendChild(input);
  inputRow.appendChild(searchBtn);

  // Results container
  const resultsEl = document.createElement('div');
  resultsEl.className = 'fw-retailer-results';
  resultsEl.setAttribute('aria-live', 'polite');

  // If already selected, show the selection
  if (currentValue?.name) {
    renderSelectedRetailer(resultsEl, currentValue);
  }

  // Search handler
  async function doSearch() {
    const postcode = input.value.trim();
    if (!postcode) return;

    resultsEl.innerHTML = '<div class="fw-loading-spinner" aria-label="Searching..."></div>';

    try {
      const retailers = await api.getRetailers(postcode);
      resultsEl.textContent = '';

      // Filter to RTTD-enabled retailers only
      const rttdRetailers = retailers.filter((r) => r.rttdEnabled);

      if (!rttdRetailers.length) {
        resultsEl.innerHTML = '<p class="fw-no-results">No BMW centres with real-time test drive booking found near this postcode. Try a different postcode.</p>';
        return;
      }

      const list = document.createElement('ul');
      list.className = 'fw-retailer-list';
      list.setAttribute('role', 'listbox');
      list.setAttribute('aria-label', 'Select a BMW Centre');

      rttdRetailers.forEach((retailer) => {
        const item = document.createElement('li');
        item.className = 'fw-retailer-item';
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', currentValue?.id === retailer.dealer_number ? 'true' : 'false');
        if (currentValue?.id === retailer.dealer_number) {
          item.classList.add('fw-retailer-item--selected');
        }

        const distance = retailer.distance != null
          ? `${retailer.distance.toFixed(1)} miles`
          : '';

        item.innerHTML = `
          <span class="fw-retailer-name">${retailer.dealer_name}</span>
          <span class="fw-retailer-address">${retailer.address_line_1}, ${retailer.town} ${retailer.postcode}</span>
          ${distance ? `<span class="fw-retailer-distance">${distance}</span>` : ''}
        `;

        item.addEventListener('click', () => {
          list.querySelectorAll('.fw-retailer-item--selected').forEach((el) => {
            el.classList.remove('fw-retailer-item--selected');
            el.setAttribute('aria-selected', 'false');
          });
          item.classList.add('fw-retailer-item--selected');
          item.setAttribute('aria-selected', 'true');

          const value = {
            id: retailer.dealer_number,
            postcode,
            name: retailer.dealer_name,
            externalRef: extractExternalRef(retailer),
          };
          onChange(id, value);
        });

        list.appendChild(item);
      });

      resultsEl.appendChild(list);
    } catch (err) {
      resultsEl.innerHTML = `
        <div class="fw-field-api-error">
          <p>Unable to find centres. Please try again.</p>
          <button type="button" class="fw-retry-btn">Try again</button>
        </div>
      `;
      resultsEl.querySelector('.fw-retry-btn').addEventListener('click', doSearch);
    }
  }

  searchBtn.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      doSearch();
    }
  });

  wrapper.appendChild(labelEl);
  wrapper.appendChild(inputRow);
  wrapper.appendChild(resultsEl);

  return wrapper;
}

function renderSelectedRetailer(container, retailer) {
  container.innerHTML = `
    <div class="fw-retailer-selected">
      <span class="fw-retailer-name">${retailer.name}</span>
      <button type="button" class="fw-change-btn">Change</button>
    </div>
  `;
}

/**
 * Extract external reference ID from retailer URL or site reference.
 */
function extractExternalRef(retailer) {
  if (retailer.rttdLink) {
    const match = retailer.rttdLink.match(/\/\/(?:www\.)?([^/]+)/);
    if (match) {
      return match[1].replace(/\.co\.uk$/, '').replace(/[^a-z0-9]/g, '');
    }
  }
  return retailer.siteReference || retailer.dealer_number;
}
