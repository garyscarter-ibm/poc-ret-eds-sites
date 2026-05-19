/**
 * Renders a checkbox group (e.g., GDPR consent channels).
 * @param {object} fieldConfig - Field configuration
 * @param {object} formState - Current form state
 * @param {function} onChange - Callback (fieldId, value)
 * @returns {HTMLElement}
 */
export default function checkboxGroup(fieldConfig, formState, onChange) {
  const { id, label, options = [], introHtml } = fieldConfig;
  const currentValues = formState.values[id] || {};

  const wrapper = document.createElement('div');
  wrapper.className = 'fw-field fw-field--checkbox-group';
  wrapper.dataset.fieldId = id;

  if (label) {
    const legend = document.createElement('p');
    legend.className = 'fw-field-label';
    legend.textContent = label;
    wrapper.appendChild(legend);
  }

  if (introHtml) {
    const intro = document.createElement('div');
    intro.className = 'fw-field-intro';
    intro.innerHTML = introHtml;
    wrapper.appendChild(intro);
  }

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'fw-checkbox-fieldset';

  options.forEach((option) => {
    const checked = currentValues[option.id] === option.values.checked;

    const itemEl = document.createElement('label');
    itemEl.className = 'fw-checkbox-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = option.id;
    checkbox.checked = checked;
    checkbox.className = 'fw-checkbox-input';

    const labelText = document.createElement('span');
    labelText.className = 'fw-checkbox-label';
    labelText.textContent = option.label;

    checkbox.addEventListener('change', () => {
      const newValues = { ...currentValues };
      newValues[option.id] = checkbox.checked
        ? option.values.checked
        : option.values.unchecked;
      onChange(id, newValues);
    });

    itemEl.appendChild(checkbox);
    itemEl.appendChild(labelText);
    fieldset.appendChild(itemEl);
  });

  wrapper.appendChild(fieldset);
  return wrapper;
}
