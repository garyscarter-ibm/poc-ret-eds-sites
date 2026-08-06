import { validate, showError, clearError } from './validation.js';

/**
 * Renders a text input field (text, email, tel, number).
 * @param {object} fieldConfig - Field configuration
 * @param {object} formState - Current form state
 * @param {function} onChange - Callback (fieldId, value)
 * @returns {HTMLElement}
 */
export default function textInput(fieldConfig, formState, onChange) {
  const { id, label, attributes = {}, required } = fieldConfig;
  const currentValue = formState.values[id] || '';

  const wrapper = document.createElement('div');
  wrapper.className = 'fw-field fw-field--text';
  wrapper.dataset.fieldId = id;

  const labelEl = document.createElement('label');
  labelEl.className = 'fw-field-label';
  labelEl.htmlFor = `fw-${id}`;
  labelEl.textContent = label;
  if (required) {
    const star = document.createElement('span');
    star.className = 'fw-field-required';
    star.textContent = ' *';
    star.setAttribute('aria-hidden', 'true');
    labelEl.appendChild(star);
  }

  const input = document.createElement('input');
  input.className = 'fw-field-input';
  input.id = `fw-${id}`;
  input.name = id;
  input.type = attributes.type || 'text';
  input.value = currentValue;
  if (attributes.maxlength) input.maxLength = attributes.maxlength;
  if (attributes.placeholder) input.placeholder = attributes.placeholder;
  if (attributes.autocomplete) input.autocomplete = attributes.autocomplete;
  if (required) input.required = true;

  input.addEventListener('input', () => {
    clearError(wrapper);
    onChange(id, input.value);
  });

  input.addEventListener('blur', () => {
    const errors = validate(input.value, fieldConfig);
    if (errors.length) {
      showError(wrapper, errors[0]);
    }
  });

  wrapper.appendChild(labelEl);
  wrapper.appendChild(input);

  return wrapper;
}
