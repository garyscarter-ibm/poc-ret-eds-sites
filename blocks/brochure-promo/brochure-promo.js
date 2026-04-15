export default async function decorate(block) {
  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-promo-inner';

  // Row 0: text content (heading, paragraph, link)
  // Row 1: image
  const textRow = rows[0];
  const imageRow = rows[1];

  const textCol = document.createElement('div');
  textCol.className = 'brochure-promo-text animate-child';
  if (textRow) {
    const content = textRow.querySelector(':scope > div') || textRow;
    textCol.append(...content.childNodes);
  }

  const imageCol = document.createElement('div');
  imageCol.className = 'brochure-promo-image animate-child';
  const img = imageRow?.querySelector('img');
  if (img) {
    img.loading = 'lazy';
    imageCol.append(img);
  }

  wrapper.append(textCol, imageCol);
  block.textContent = '';
  block.append(wrapper);
}
