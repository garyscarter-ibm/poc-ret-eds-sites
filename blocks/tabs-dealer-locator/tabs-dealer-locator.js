const DEFAULT_ZOOM = 17;

/**
 * Parse map config from a block row.
 * Expects: col0 = coordinates ("lat, lng" or "lat, lng, zoom"), col1 = areas served text
 */
function parseMapRow(row) {
  const cols = [...row.children];
  const coordText = cols[0]?.textContent?.trim() || '';
  const areasText = cols[1]?.textContent?.trim() || '';

  const parts = coordText.split(',').map((s) => s.trim());
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  const zoom = parts[2] ? parseInt(parts[2], 10) : DEFAULT_ZOOM;

  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return {
    lat, lng, zoom, areas: areasText,
  };
}

/**
 * Check if a row looks like map config (first cell contains coordinates).
 */
function isMapRow(row) {
  const text = row.children[0]?.textContent?.trim() || '';
  return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)/.test(text);
}

export default function decorate(block) {
  const rows = [...block.children];

  // Check if the last row contains map coordinates
  let mapConfig = null;
  const lastRow = rows[rows.length - 1];
  if (lastRow && isMapRow(lastRow)) {
    mapConfig = parseMapRow(lastRow);
    rows.pop(); // Remove map row from tab rows
  }

  // Map-only mode: block contains only coordinates, no tab rows
  if (mapConfig && rows.length === 0) {
    block.textContent = '';
    block.classList.add('map-only');

    const mapIframe = document.createElement('iframe');
    mapIframe.title = 'Dealer location map';
    mapIframe.loading = 'lazy';
    mapIframe.referrerPolicy = 'no-referrer-when-downgrade';
    mapIframe.src = `https://maps.google.com/maps?q=${mapConfig.lat},${mapConfig.lng}&z=${mapConfig.zoom}&output=embed`;
    block.appendChild(mapIframe);

    if (mapConfig.areas) {
      const areasDiv = document.createElement('div');
      areasDiv.className = 'tabs-dealer-locator-areas';
      const areasHeading = document.createElement('h5');
      areasHeading.textContent = 'Areas served';
      areasDiv.appendChild(areasHeading);
      const areasText = document.createElement('p');
      areasText.textContent = mapConfig.areas;
      areasDiv.appendChild(areasText);
      block.appendChild(areasDiv);
    }
    return;
  }

  // Create tab navigation
  const tabNav = document.createElement('div');
  tabNav.className = 'tabs-dealer-locator-nav';

  // Create content container
  const contentBox = document.createElement('div');
  contentBox.className = 'tabs-dealer-locator-content';

  rows.forEach((row, index) => {
    const labelDiv = row.children[0];
    const contentDiv = row.children[1];

    // Create tab button from label
    const tab = document.createElement('button');
    tab.textContent = labelDiv.textContent.trim();
    tab.className = 'tabs-dealer-locator-tab';
    if (index === 0) tab.classList.add('active');
    tabNav.appendChild(tab);

    // Create panel
    const panel = document.createElement('div');
    panel.className = 'tabs-dealer-locator-panel';
    if (index === 0) panel.classList.add('active');

    // Group h4 + following p elements into columns
    if (contentDiv) {
      const columns = document.createElement('div');
      columns.className = 'tabs-dealer-locator-columns';
      let currentCol = null;

      [...contentDiv.children].forEach((child) => {
        if (child.tagName === 'H4') {
          currentCol = document.createElement('div');
          currentCol.className = 'tabs-dealer-locator-col';
          columns.appendChild(currentCol);
        }
        if (currentCol) {
          currentCol.appendChild(child);
        }
      });

      panel.appendChild(columns);
    }

    // Add map section if coordinates were provided
    if (mapConfig) {
      const mapSection = document.createElement('div');
      mapSection.className = 'tabs-dealer-locator-map-section';

      const mapHeading = document.createElement('h5');
      mapHeading.textContent = 'Map';
      mapSection.appendChild(mapHeading);

      const mapIframe = document.createElement('iframe');
      mapIframe.title = 'Dealer location map';
      mapIframe.loading = 'lazy';
      mapIframe.referrerPolicy = 'no-referrer-when-downgrade';
      mapIframe.src = `https://maps.google.com/maps?q=${mapConfig.lat},${mapConfig.lng}&z=${mapConfig.zoom}&output=embed`;
      mapSection.appendChild(mapIframe);

      if (mapConfig.areas) {
        const areasDiv = document.createElement('div');
        areasDiv.className = 'tabs-dealer-locator-areas';
        const areasHeading = document.createElement('h5');
        areasHeading.textContent = 'Areas served';
        areasDiv.appendChild(areasHeading);
        const areasText = document.createElement('p');
        areasText.textContent = mapConfig.areas;
        areasDiv.appendChild(areasText);
        mapSection.appendChild(areasDiv);
      }

      panel.appendChild(mapSection);

      // Add "View map" toggle
      const mapToggle = document.createElement('button');
      mapToggle.className = 'tabs-dealer-locator-map-toggle';
      mapToggle.textContent = 'View map';
      panel.appendChild(mapToggle);

      mapToggle.addEventListener('click', () => {
        const isOpen = mapSection.classList.contains('active');
        if (isOpen) {
          mapSection.classList.remove('active');
          mapToggle.textContent = 'View map';
        } else {
          mapSection.classList.add('active');
          mapToggle.textContent = 'Close map';
        }
      });
    }

    contentBox.appendChild(panel);
  });

  // Replace block contents with tabbed structure
  block.textContent = '';
  block.appendChild(tabNav);
  block.appendChild(contentBox);

  // Tab click handlers
  const tabs = tabNav.querySelectorAll('.tabs-dealer-locator-tab');
  const panels = contentBox.querySelectorAll('.tabs-dealer-locator-panel');

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      panels[index].classList.add('active');
    });
  });
}
