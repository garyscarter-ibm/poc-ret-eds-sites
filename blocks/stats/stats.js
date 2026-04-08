/**
 * Stats block
 * Renders key figures/metrics in a horizontal row
 *
 * Content model (authored as a table):
 *   Each row: value | label
 *   e.g.: "846-954mm" | "REAR LEGROOM"
 *   Optional last row with single cell: footnote text
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  const grid = document.createElement('div');
  grid.className = 'stats-grid';

  rows.forEach((row) => {
    const cells = [...row.children];

    if (cells.length >= 2) {
      // Stat pair: value + label
      const stat = document.createElement('div');
      stat.className = 'stats-item';

      const value = document.createElement('div');
      value.className = 'stats-value';
      value.textContent = cells[0].textContent.trim();

      const label = document.createElement('div');
      label.className = 'stats-label';
      label.textContent = cells[1].textContent.trim();

      stat.append(value, label);
      grid.append(stat);
    } else if (cells.length === 1 && cells[0].textContent.trim().length > 0) {
      // Footnote row (single cell)
      const footnote = document.createElement('p');
      footnote.className = 'stats-footnote';
      footnote.textContent = cells[0].textContent.trim();
      block.dataset.hasFootnote = 'true';
      block.append(grid, footnote);
    }
  });

  if (!block.querySelector('.stats-grid')) {
    block.prepend(grid);
  }
}
