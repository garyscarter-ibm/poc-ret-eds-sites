export default async function decorate(block) {
  const rows = [...block.children];
  const grid = document.createElement('div');
  grid.className = 'brochure-features-grid';

  rows.forEach((row, index) => {
    const cols = [...row.children];
    const card = document.createElement('div');
    card.className = 'brochure-feature-card animate-child';

    const num = document.createElement('div');
    num.className = 'brochure-feature-num';
    num.textContent = String(index + 1).padStart(2, '0');

    const title = document.createElement('h4');
    title.className = 'brochure-feature-title';
    title.textContent = cols[0]?.textContent?.trim() || '';

    card.append(num, title);

    // Optional overlay link (col 1)
    const overlayId = cols[1]?.textContent?.trim();
    if (overlayId) {
      const link = document.createElement('a');
      link.className = 'brochure-feature-link';
      link.href = `#overlay-${overlayId}`;
      link.textContent = 'Learn more';
      card.append(link);
    }

    grid.append(card);
  });

  block.textContent = '';
  block.append(grid);
}
