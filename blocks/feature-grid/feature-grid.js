/**
 * Feature Grid block
 * Grid of feature cards with background image, number, title, and link
 * Used for KEY FEATURES sections in brochure pages
 *
 * Content model:
 *   Each row: image | number + title | link (optional)
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const grid = document.createElement('div');
  grid.className = 'feature-grid-items';

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const card = document.createElement('div');
    card.className = 'feature-grid-card';

    // Cell 1: background image
    const img = cells[0].querySelector('picture img, img');
    if (img) {
      card.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${img.src}')`;
    }

    // Cell 2: number + title
    const numberEl = cells[1].querySelector('span');
    const titleEl = cells[1].querySelector('h4, h3, h5');

    if (numberEl) {
      const num = document.createElement('span');
      num.className = 'feature-grid-number';
      num.textContent = numberEl.textContent.trim();
      card.append(num);
    }

    if (titleEl) {
      const title = document.createElement('h4');
      title.className = 'feature-grid-title';
      title.textContent = titleEl.textContent.trim();
      card.append(title);
    }

    // Cell 3: optional link
    if (cells[2]) {
      const link = cells[2].querySelector('a');
      if (link) {
        const a = document.createElement('a');
        a.href = link.href;
        a.className = 'feature-grid-link';
        a.textContent = link.textContent.trim();
        card.append(a);
      }
    }

    grid.append(card);
  });

  block.append(grid);
}
