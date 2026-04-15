export default async function decorate(block) {
  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-blockquote-layout';

  // Row 0: image
  // Row 1: blockquote text
  const imageRow = rows[0];
  const quoteRow = rows[1];

  const imageCol = document.createElement('div');
  imageCol.className = 'brochure-blockquote-image animate-child';
  const img = imageRow?.querySelector('img');
  if (img) {
    img.loading = 'lazy';
    imageCol.append(img);
  }

  const quoteCol = document.createElement('div');
  quoteCol.className = 'brochure-blockquote-text animate-child';
  if (quoteRow) {
    const content = quoteRow.querySelector(':scope > div') || quoteRow;
    const text = content.textContent.trim();
    const bq = document.createElement('blockquote');
    bq.textContent = text;
    quoteCol.append(bq);
  }

  wrapper.append(imageCol, quoteCol);
  block.textContent = '';
  block.append(wrapper);
}
