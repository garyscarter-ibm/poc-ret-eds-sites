export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-promo-inner';

  // Detect which row has the image vs text content
  let textRow = null;
  let imageRow = null;
  rows.forEach((row) => {
    if (!imageRow && row.querySelector('img')) {
      imageRow = row;
    } else if (!textRow) {
      textRow = row;
    }
  });

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
