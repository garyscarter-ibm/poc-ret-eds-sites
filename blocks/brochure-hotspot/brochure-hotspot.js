export default async function decorate(block) {
  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-hotspot-inner';

  // Row 0: Title content (heading + instructions)
  // Row 1: Main image
  // Row 2+: Hotspot items (label | x-position | y-position | overlay-id)
  const titleRow = rows[0];
  const imageRow = rows[1];
  const hotspotRows = rows.slice(2);

  // Title
  if (titleRow) {
    const titleEl = document.createElement('div');
    titleEl.className = 'brochure-hotspot-title animate-child';
    const content = titleRow.querySelector(':scope > div') || titleRow;
    titleEl.append(...content.childNodes);
    wrapper.append(titleEl);
  }

  // Image container with hotspots
  const imageContainer = document.createElement('div');
  imageContainer.className = 'brochure-hotspot-image-container animate-child';

  const img = imageRow?.querySelector('img');
  if (img) {
    img.loading = 'lazy';
    imageContainer.append(img);
  }

  // Create hotspot buttons
  hotspotRows.forEach((row) => {
    const cols = [...row.children];
    const label = cols[0]?.textContent?.trim() || '';
    const xPos = cols[1]?.textContent?.trim() || '50';
    const yPos = cols[2]?.textContent?.trim() || '50';
    const overlayId = cols[3]?.textContent?.trim() || '';

    const btn = document.createElement('button');
    btn.className = 'brochure-hotspot-btn';
    btn.style.left = `${xPos}%`;
    btn.style.top = `${yPos}%`;
    btn.setAttribute('aria-label', label);
    btn.title = label;

    // Pulsing dot indicator
    btn.innerHTML = `<span class="brochure-hotspot-dot"></span><span class="brochure-hotspot-label">${label}</span>`;

    if (overlayId) {
      btn.addEventListener('click', () => {
        window.location.hash = `overlay-${overlayId}`;
      });
    }

    imageContainer.append(btn);
  });

  wrapper.append(imageContainer);
  block.textContent = '';
  block.append(wrapper);
}
