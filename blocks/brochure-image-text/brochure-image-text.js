export default async function decorate(block) {
  const rows = [...block.children];
  const isReversed = block.classList.contains('reversed');

  const wrapper = document.createElement('div');
  wrapper.className = `brochure-image-text-layout${isReversed ? ' reversed' : ''}`;

  // Row 0: image
  // Row 1: text content (hr, heading, paragraph)
  const imageRow = rows[0];
  const textRow = rows[1];

  const imageCol = document.createElement('div');
  imageCol.className = 'brochure-image-text-image animate-child';
  const img = imageRow?.querySelector('img');
  if (img) {
    img.loading = 'lazy';
    imageCol.append(img);
  }

  const textCol = document.createElement('div');
  textCol.className = 'brochure-image-text-content animate-child';
  if (textRow) {
    // Move all child elements to the text column
    [...textRow.querySelectorAll(':scope > div')].forEach((div) => {
      textCol.append(...div.childNodes);
    });
    if (textCol.childNodes.length === 0) {
      textCol.append(...textRow.childNodes);
    }
  }

  wrapper.append(imageCol, textCol);
  block.textContent = '';
  block.append(wrapper);
}
