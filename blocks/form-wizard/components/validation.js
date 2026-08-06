/**
 * Validate a field value against its config.
 * @param {*} value - The field value
 * @param {object} fieldConfig - Field configuration from the form config
 * @returns {string[]} Array of error messages (empty if valid)
 */
export function validate(value, fieldConfig) {
  const errors = [];
  if (fieldConfig.required && !value) {
    errors.push('This field is required');
    return errors;
  }
  if (!value) return errors;

  const { attributes, pattern } = fieldConfig;

  if (pattern) {
    const regex = new RegExp(pattern);
    if (!regex.test(value)) {
      errors.push('Please enter a valid value');
    }
  }

  if (attributes?.maxlength && value.length > attributes.maxlength) {
    errors.push(`Maximum ${attributes.maxlength} characters`);
  }

  if (attributes?.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      errors.push('Please enter a valid email address');
    }
  }

  if (attributes?.type === 'tel') {
    const telRegex = /^\+?[\d\s\-()]{7,18}$/;
    if (!telRegex.test(value)) {
      errors.push('Please enter a valid phone number');
    }
  }

  return errors;
}

/**
 * Show validation error on a field element.
 * @param {HTMLElement} fieldEl - The field wrapper element
 * @param {string} message - Error message to display
 */
export function showError(fieldEl, message) {
  clearError(fieldEl);
  fieldEl.classList.add('fw-field--error');
  const errorEl = document.createElement('span');
  errorEl.className = 'fw-field-error';
  errorEl.setAttribute('role', 'alert');
  errorEl.textContent = message;
  fieldEl.appendChild(errorEl);
}

/**
 * Clear validation error from a field element.
 * @param {HTMLElement} fieldEl - The field wrapper element
 */
export function clearError(fieldEl) {
  fieldEl.classList.remove('fw-field--error');
  const existing = fieldEl.querySelector('.fw-field-error');
  if (existing) existing.remove();
}
