/**
 * Renders the model selection grid.
 * Fetches available model series from the API and displays them as selectable cards.
 * @param {object} fieldConfig - Field configuration
 * @param {object} formState - Current form state
 * @param {function} onChange - Callback (fieldId, value)
 * @param {object} api - API client instance
 * @returns {HTMLElement}
 */
export default function modelSelect(fieldConfig, formState, onChange, api) {
  const { id } = fieldConfig;
  const currentValue = formState.values[id];

  const wrapper = document.createElement('div');
  wrapper.className = 'fw-field fw-field--model-select';
  wrapper.dataset.fieldId = id;

  // Render skeleton while loading
  renderSkeleton(wrapper);
  loadModels(wrapper, api, id, currentValue, onChange);

  return wrapper;
}

function renderSkeleton(wrapper) {
  const grid = document.createElement('div');
  grid.className = 'fw-model-grid fw-model-grid--loading';
  for (let i = 0; i < 6; i += 1) {
    const card = document.createElement('div');
    card.className = 'fw-model-card fw-model-card--skeleton';
    card.innerHTML = '<div class="fw-model-card-img-placeholder"></div><div class="fw-model-card-text-placeholder"></div>';
    grid.appendChild(card);
  }
  wrapper.appendChild(grid);
}

async function loadModels(wrapper, api, fieldId, currentValue, onChange) {
  try {
    const data = await api.getModels();
    const results = data.results || data;

    wrapper.textContent = '';

    const grid = document.createElement('div');
    grid.className = 'fw-model-grid';
    grid.setAttribute('role', 'radiogroup');
    grid.setAttribute('aria-label', 'Select a model');

    // Convert object to sorted array
    const series = Object.entries(results)
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    series.forEach((model) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'fw-model-card';
      if (currentValue?.series === model.key) {
        card.classList.add('fw-model-card--selected');
        card.setAttribute('aria-pressed', 'true');
      } else {
        card.setAttribute('aria-pressed', 'false');
      }

      const img = document.createElement('img');
      img.className = 'fw-model-card-img';
      img.src = model.modelSelectorThumbImg || '';
      img.alt = model.key;
      img.loading = 'lazy';

      const name = document.createElement('span');
      name.className = 'fw-model-card-name';
      name.textContent = model.key;

      card.appendChild(img);
      card.appendChild(name);

      card.addEventListener('click', () => {
        // Deselect previous
        grid.querySelectorAll('.fw-model-card--selected').forEach((el) => {
          el.classList.remove('fw-model-card--selected');
          el.setAttribute('aria-pressed', 'false');
        });
        card.classList.add('fw-model-card--selected');
        card.setAttribute('aria-pressed', 'true');

        // Find the first body type to get the modelTreeReference
        const firstBodyType = model.bodyTypes?.[0];
        onChange(fieldId, {
          series: model.key,
          treeRef: firstBodyType?.modelTreeReference || '',
          thumbImg: model.modelSelectorThumbImg || '',
        });
      });

      grid.appendChild(card);
    });

    wrapper.appendChild(grid);
  } catch (err) {
    wrapper.textContent = '';
    const error = document.createElement('div');
    error.className = 'fw-field-api-error';
    error.innerHTML = `
      <p>Unable to load models. Please try again.</p>
      <button type="button" class="fw-retry-btn">Try again</button>
    `;
    error.querySelector('.fw-retry-btn').addEventListener('click', () => {
      wrapper.textContent = '';
      renderSkeleton(wrapper);
      loadModels(wrapper, api, fieldId, currentValue, onChange);
    });
    wrapper.appendChild(error);
  }
}
