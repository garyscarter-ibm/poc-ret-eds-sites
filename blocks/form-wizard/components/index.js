import textInput from './text-input.js';
import checkboxGroup from './checkbox-group.js';
import modelSelect from './model-select.js';
import postcodeLookup from './postcode-lookup.js';
import appointmentPicker from './appointment-picker.js';

/**
 * Map of element type strings to their component render functions.
 */
const COMPONENT_MAP = {
  'text-input': textInput,
  'checkbox-group': checkboxGroup,
  'model-select': modelSelect,
  'postcode-lookup': postcodeLookup,
  'appointment-picker': appointmentPicker,
};

/**
 * Get the renderer function for a given element type.
 * @param {string} elementType - The element type from the config
 * @returns {function|null} The component render function or null
 */
export function getComponentRenderer(elementType) {
  return COMPONENT_MAP[elementType] || null;
}
