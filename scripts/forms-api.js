const API_BASE = 'https://bmw-backend.29rwihxro1te.eu-de.codeengine.appdomain.cloud';

/**
 * Creates an API client for the TDA (Test Drive Appointment) proxy endpoints.
 * @returns {object} API client with methods for each TDA endpoint
 */
export function createApiClient() {
  async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const resp = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      throw new Error(`API ${resp.status}: ${body.slice(0, 200)}`);
    }
    return resp.json();
  }

  return {
    /** Fetch available model series */
    getModels() {
      return request('/api/tda/models');
    },

    /** Fetch retailers near a postcode */
    getRetailers(postcode) {
      return request(`/api/tda/retailers/${encodeURIComponent(postcode)}`);
    },

    /** Fetch available time slots for a retailer + model */
    getAvailability(retailerId, modelTreeRef, start, end) {
      const params = new URLSearchParams({
        retailerId,
        modelTreeRef,
        start,
        end,
      });
      return request(`/api/tda/availability?${params}`);
    },

    /** Submit the test drive booking */
    submit(payload) {
      return request('/api/tda/submit', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };
}
