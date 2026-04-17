export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'hotspot-image-inner';

  // First row contains the image
  const imageRow = rows[0];
  const img = imageRow?.querySelector('img');

  const imageContainer = document.createElement('div');
  imageContainer.className = 'hotspot-image-container';

  if (img) {
    img.loading = 'lazy';
    imageContainer.append(img);
  }

  // Remaining rows are hotspots: x%, y%, label, link
  const hotspots = [];
  for (let i = 1; i < rows.length; i += 1) {
    const cols = [...rows[i].children];
    if (cols.length >= 3) {
      const x = parseFloat(cols[0]?.textContent?.trim()) || 0;
      const y = parseFloat(cols[1]?.textContent?.trim()) || 0;
      const label = cols[2]?.textContent?.trim() || '';

      const dot = document.createElement('button');
      dot.className = 'hotspot-dot';
      dot.setAttribute('aria-label', label);
      dot.style.left = `${x}%`;
      dot.style.top = `${y}%`;

      const tooltip = document.createElement('span');
      tooltip.className = 'hotspot-tooltip';
      tooltip.textContent = label;
      dot.append(tooltip);

      dot.addEventListener('click', () => {
        // Toggle active state
        const wasActive = dot.classList.contains('active');
        imageContainer.querySelectorAll('.hotspot-dot.active').forEach((d) => d.classList.remove('active'));
        if (!wasActive) dot.classList.add('active');
      });

      hotspots.push(dot);
      imageContainer.append(dot);
    }
  }

  wrapper.append(imageContainer);
  block.textContent = '';
  block.append(wrapper);
}
