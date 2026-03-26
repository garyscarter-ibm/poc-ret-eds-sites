export default function decorate(block) {
  const rows = [...block.children];

  // Dealer location coordinates (Grassicks BMW, Perth)
  const DEALER_LAT = 56.417873;
  const DEALER_LNG = -3.462354;
  const DEALER_ZOOM = 17;
  const AREAS_SERVED = 'Perth as well as surrounding areas including Blairgowrie, Cupar, Crieff and Auchterarder';

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

    // Add "View map" toggle link
    const mapToggle = document.createElement('button');
    mapToggle.className = 'tabs-dealer-locator-map-toggle';
    mapToggle.textContent = 'View map';
    panel.appendChild(mapToggle);

    // Add map section (hidden by default)
    const mapSection = document.createElement('div');
    mapSection.className = 'tabs-dealer-locator-map-section';

    const mapHeading = document.createElement('h5');
    mapHeading.textContent = 'Map';
    mapSection.appendChild(mapHeading);

    const mapIframe = document.createElement('iframe');
    mapIframe.title = 'Grassicks BMW location map';
    mapIframe.loading = 'lazy';
    mapIframe.referrerPolicy = 'no-referrer-when-downgrade';
    mapIframe.src = `https://maps.google.com/maps?q=${DEALER_LAT},${DEALER_LNG}&z=${DEALER_ZOOM}&output=embed`;
    mapSection.appendChild(mapIframe);

    const areasDiv = document.createElement('div');
    areasDiv.className = 'tabs-dealer-locator-areas';
    const areasHeading = document.createElement('h5');
    areasHeading.textContent = 'Areas served';
    areasDiv.appendChild(areasHeading);
    const areasText = document.createElement('p');
    areasText.textContent = AREAS_SERVED;
    areasDiv.appendChild(areasText);
    mapSection.appendChild(areasDiv);

    panel.appendChild(mapSection);

    // Toggle map on click
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
