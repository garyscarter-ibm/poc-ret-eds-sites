export default async function decorate(block) {
  const rows = [...block.children];
  const table = document.createElement('div');
  table.className = 'brochure-spec-table-grid';

  rows.forEach((row) => {
    const cols = [...row.children];
    const item = document.createElement('div');
    item.className = 'brochure-spec-item animate-child';

    const label = document.createElement('div');
    label.className = 'brochure-spec-label';
    label.textContent = cols[0]?.textContent?.trim() || '';

    const value = document.createElement('div');
    value.className = 'brochure-spec-value';
    value.textContent = cols[1]?.textContent?.trim() || '';

    item.append(label, value);
    table.append(item);
  });

  block.textContent = '';
  block.append(table);
}
