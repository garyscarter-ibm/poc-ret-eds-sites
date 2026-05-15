const API_ENDPOINT = 'https://bmw-backend.29rwihxro1te.eu-de.codeengine.appdomain.cloud/graphql';
const API_KEY = 'bmw-demo-api-key-2026';

/**
 * Execute a GraphQL query against the used cars API.
 * @param {string} query - GraphQL query string
 * @param {object} variables - Query variables
 * @returns {Promise<object>} The `data` property from the GraphQL response
 */
export default async function queryAPI(query, variables = {}) {
  const resp = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!resp.ok) {
    throw new Error(`API request failed: ${resp.status}`);
  }

  const json = await resp.json();

  if (json.errors && json.errors.length) {
    throw new Error(json.errors[0].message);
  }

  return json.data;
}
