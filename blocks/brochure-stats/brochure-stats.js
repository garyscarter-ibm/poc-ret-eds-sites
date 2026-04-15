export default async function decorate(block) {
  const rows = [...block.children];
  const grid = document.createElement('div');
  grid.className = 'brochure-stats-grid';

  rows.forEach((row) => {
    const cols = [...row.children];
    const stat = document.createElement('div');
    stat.className = 'brochure-stat animate-child';

    // Col 0: big number/value (h2)
    // Col 1: label (h4)
    const valueEl = cols[0];
    const labelEl = cols[1];

    if (valueEl) {
      const value = document.createElement('div');
      value.className = 'brochure-stat-value';
      value.textContent = valueEl.textContent.trim();
      stat.append(value);
    }

    if (labelEl) {
      const label = document.createElement('div');
      label.className = 'brochure-stat-label';
      label.textContent = labelEl.textContent.trim();
      stat.append(label);
    }

    grid.append(stat);
  });

  block.textContent = '';
  block.append(grid);
}
