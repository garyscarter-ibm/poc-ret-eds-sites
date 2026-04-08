/**
 * CTA Bar block
 * Horizontal row of icon-based action links (Build your BMW, New Car Locator, etc.)
 *
 * Content model:
 *   Each row: icon image + link
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const bar = document.createElement('div');
  bar.className = 'cta-bar-items';

  rows.forEach((row) => {
    const cells = [...row.children];
    const cell = cells[0];
    if (!cell) return;

    const link = cell.querySelector('a');
    const img = cell.querySelector('img');

    if (link) {
      const item = document.createElement('a');
      item.href = link.href;
      item.className = 'cta-bar-item';
      item.title = link.textContent.trim() || '';

      if (img) {
        const icon = document.createElement('img');
        icon.src = img.src;
        icon.alt = link.textContent.trim() || img.alt || '';
        icon.loading = 'lazy';
        item.append(icon);
        item.setAttribute('aria-label', link.textContent.trim() || img.alt || '');
      } else {
        item.textContent = link.textContent.trim();
      }

      bar.append(item);
    }
  });

  block.append(bar);
}
