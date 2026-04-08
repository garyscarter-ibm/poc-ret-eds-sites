/**
 * Hotspot Image block
 * Car image with positioned clickable hotspot markers
 *
 * Content model:
 *   Row 1: background image
 *   Rows 2+: x% | y% | label | link URL
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  // Row 1: background image
  const imgRow = rows.shift();
  const img = imgRow?.querySelector('picture img, img');

  const container = document.createElement('div');
  container.className = 'hotspot-image-container';

  if (img) {
    const bgImg = document.createElement('img');
    bgImg.src = img.src;
    bgImg.alt = img.alt || '';
    bgImg.className = 'hotspot-image-bg';
    bgImg.loading = 'eager';
    container.append(bgImg);
  }

  // Remaining rows: hotspot markers
  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 3) return;

    const x = parseFloat(cells[0].textContent.trim());
    const y = parseFloat(cells[1].textContent.trim());
    if (Number.isNaN(x) || Number.isNaN(y)) return;
    const label = cells[2].textContent.trim();
    const linkCell = cells[3];
    const link = linkCell?.querySelector('a');
    const href = link?.href || '';

    const marker = document.createElement('a');
    marker.className = 'hotspot-marker';
    marker.style.left = `${x}%`;
    marker.style.top = `${y}%`;
    marker.title = label;
    marker.setAttribute('aria-label', label);
    if (href) marker.href = href;

    // Pulsing dot
    const dot = document.createElement('span');
    dot.className = 'hotspot-dot';
    marker.append(dot);

    // Tooltip label
    const tooltip = document.createElement('span');
    tooltip.className = 'hotspot-tooltip';
    tooltip.textContent = label;
    marker.append(tooltip);

    container.append(marker);
  });

  block.append(container);
}
