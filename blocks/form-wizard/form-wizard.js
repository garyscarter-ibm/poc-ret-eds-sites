import { getComponentRenderer } from './components/index.js';
import { createApiClient } from '../../scripts/forms-api.js';
import { validate, showError } from './components/validation.js';

const STORAGE_KEY_PREFIX = 'fw-state-';

/**
 * Creates a simple observable form store.
 */
function createFormStore(configId) {
  const storageKey = `${STORAGE_KEY_PREFIX}${configId}`;
  let state = loadState(storageKey);
  const listeners = new Set();

  function notify(changedField) {
    listeners.forEach((fn) => fn(state, changedField));
    saveState(storageKey, state);
  }

  return {
    get: () => state,
    getField: (id) => state.values[id],
    set: (fieldId, value) => {
      state.values[fieldId] = value;
      notify(fieldId);
    },
    setStep: (step) => {
      state.currentStep = step;
      notify('__step');
    },
    setError: (fieldId, errors) => {
      state.errors[fieldId] = errors;
      notify('__error');
    },
    clearErrors: () => {
      state.errors = {};
      notify('__error');
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    clear: () => {
      state = { currentStep: 0, values: {}, errors: {} };
      try { sessionStorage.removeItem(storageKey); } catch (e) { /* noop */ }
    },
  };
}

function loadState(key) {
  try {
    const saved = sessionStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Expire after 30 minutes
      if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
        return { currentStep: parsed.currentStep || 0, values: parsed.values || {}, errors: {} };
      }
    }
  } catch (e) { /* noop */ }
  return { currentStep: 0, values: {}, errors: {} };
}

function saveState(key, state) {
  try {
    sessionStorage.setItem(key, JSON.stringify({
      currentStep: state.currentStep,
      values: state.values,
      timestamp: Date.now(),
    }));
  } catch (e) { /* noop */ }
}

/**
 * Loads and decorates the form-wizard block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // 1. Extract config path from authored content
  const configPath = block.querySelector('p')?.textContent.trim();
  if (!configPath) return;

  // 2. Fetch form configuration
  let config;
  try {
    const resp = await fetch(configPath);
    config = await resp.json();
  } catch (err) {
    block.innerHTML = '<p class="fw-error">Unable to load form configuration.</p>';
    return;
  }

  // 3. Initialise state and API client
  const store = createFormStore(config.id);
  const api = createApiClient();

  // 4. Render wizard shell
  block.textContent = '';
  block.classList.add('fw-wizard');

  const header = document.createElement('div');
  header.className = 'fw-header';
  header.innerHTML = `
    <h2 class="fw-title">${config.title}</h2>
    <p class="fw-subtitle">${config.subtitle}</p>
  `;

  const stepsNav = document.createElement('nav');
  stepsNav.className = 'fw-steps-nav';
  stepsNav.setAttribute('aria-label', 'Form progress');

  const body = document.createElement('div');
  body.className = 'fw-body';

  const footer = document.createElement('div');
  footer.className = 'fw-footer';

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'fw-btn fw-btn--back';
  backBtn.textContent = 'Back';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'fw-btn fw-btn--next';
  nextBtn.textContent = 'Next';

  footer.appendChild(backBtn);
  footer.appendChild(nextBtn);

  block.appendChild(header);
  block.appendChild(stepsNav);
  block.appendChild(body);
  block.appendChild(footer);

  // 5. Render functions
  function renderStepIndicator() {
    stepsNav.textContent = '';
    const ol = document.createElement('ol');
    ol.className = 'fw-steps-list';

    config.steps.forEach((step, i) => {
      const li = document.createElement('li');
      li.className = 'fw-step-indicator';
      if (i === store.get().currentStep) li.classList.add('fw-step-indicator--active');
      if (i < store.get().currentStep) li.classList.add('fw-step-indicator--complete');

      const span = document.createElement('span');
      span.className = 'fw-step-indicator-label';
      span.textContent = step.label;
      li.appendChild(span);
      ol.appendChild(li);
    });

    stepsNav.appendChild(ol);
  }

  function renderCurrentStep() {
    const stepIndex = store.get().currentStep;
    const stepConfig = config.steps[stepIndex];
    body.textContent = '';

    const stepEl = document.createElement('div');
    stepEl.className = 'fw-step';
    stepEl.setAttribute('role', 'group');
    stepEl.setAttribute('aria-label', stepConfig.label);

    stepConfig.fields.forEach((fieldConfig) => {
      const renderer = getComponentRenderer(fieldConfig.element);
      if (renderer) {
        const fieldEl = renderer(fieldConfig, store.get(), handleChange, api);
        stepEl.appendChild(fieldEl);
      }
    });

    body.appendChild(stepEl);

    // Update button states
    backBtn.hidden = stepIndex === 0;
    const isLastStep = stepIndex === config.steps.length - 1;
    nextBtn.textContent = isLastStep ? config.submitText : 'Next';

    // Focus first interactive element
    requestAnimationFrame(() => {
      const firstInput = body.querySelector('input, button[aria-pressed], [role="option"]');
      if (firstInput) firstInput.focus();
    });

    // Dispatch analytics event
    document.dispatchEvent(new CustomEvent('form-wizard:step-view', {
      detail: { formId: config.id, stepId: stepConfig.id, stepIndex },
    }));
  }

  function handleChange(fieldId, value) {
    store.set(fieldId, value);
  }

  function validateStep(stepIndex) {
    const stepConfig = config.steps[stepIndex];
    let valid = true;

    stepConfig.fields.forEach((fieldConfig) => {
      if (!fieldConfig.required) return;
      const value = store.getField(fieldConfig.id);
      const errors = validate(value, fieldConfig);
      if (errors.length) {
        store.setError(fieldConfig.id, errors);
        valid = false;

        // Show inline error
        const fieldEl = body.querySelector(`[data-field-id="${fieldConfig.id}"]`);
        if (fieldEl) {
          showError(fieldEl, errors[0]);
        }
      }
    });

    return valid;
  }

  async function handleSubmit() {
    nextBtn.disabled = true;
    nextBtn.textContent = 'Submitting...';

    const { values } = store.get();
    const payload = {
      model: values.moi,
      retailer: values.retailerId,
      appointment: values.appointment,
      user: {
        firstName: values.userFirstName,
        lastName: values.userLastName,
        email: values.userEmailAddress,
        phone: values.userPhoneNumber,
      },
      gdpr: values.gdprConsent || {},
      recaptchaToken: values.recaptchaToken || '',
    };

    try {
      await api.submit(payload);
      store.clear();
      renderConfirmation();

      document.dispatchEvent(new CustomEvent('form-wizard:submit', {
        detail: { formId: config.id },
      }));
    } catch (err) {
      nextBtn.disabled = false;
      nextBtn.textContent = config.submitText;

      const errorEl = document.createElement('div');
      errorEl.className = 'fw-submit-error';
      errorEl.setAttribute('role', 'alert');
      errorEl.innerHTML = '<p>Something went wrong. Please try again.</p>';
      body.appendChild(errorEl);
    }
  }

  function renderConfirmation() {
    block.textContent = '';
    block.classList.add('fw-wizard--complete');
    block.innerHTML = `
      <div class="fw-confirmation">
        <div class="fw-confirmation-icon" aria-hidden="true">✓</div>
        <h2 class="fw-confirmation-title">${config.confirmation.title}</h2>
        <p class="fw-confirmation-body">${config.confirmation.body}</p>
      </div>
    `;
  }

  // 6. Event handlers
  nextBtn.addEventListener('click', async () => {
    const stepIndex = store.get().currentStep;
    const isLastStep = stepIndex === config.steps.length - 1;

    if (!validateStep(stepIndex)) return;

    if (isLastStep) {
      await handleSubmit();
    } else {
      store.setStep(stepIndex + 1);
      store.clearErrors();
      renderStepIndicator();
      renderCurrentStep();

      document.dispatchEvent(new CustomEvent('form-wizard:step-complete', {
        detail: { formId: config.id, stepId: config.steps[stepIndex].id, stepIndex },
      }));
    }
  });

  backBtn.addEventListener('click', () => {
    const stepIndex = store.get().currentStep;
    if (stepIndex > 0) {
      store.setStep(stepIndex - 1);
      store.clearErrors();
      renderStepIndicator();
      renderCurrentStep();
    }
  });

  // 7. Initial render
  renderStepIndicator();
  renderCurrentStep();

  // Dispatch start event
  document.dispatchEvent(new CustomEvent('form-wizard:start', {
    detail: { formId: config.id },
  }));
}
