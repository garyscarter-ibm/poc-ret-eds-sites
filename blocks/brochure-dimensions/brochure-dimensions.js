export default async function decorate(block) {
  const content = document.createElement('div');
  content.className = 'brochure-dimensions-content';

  // Check for an authored background image in any row
  const authoredImg = block.querySelector('img');
  if (authoredImg) {
    block.style.backgroundImage = `url('${authoredImg.src}')`;
    authoredImg.closest('div')?.remove();
  }

  // Process remaining rows
  const remainingRows = [...block.children];
  remainingRows.forEach((row) => {
    const inner = row.querySelector(':scope > div') || row;
    content.append(...[...inner.childNodes].map((n) => n.cloneNode(true)));
  });

  // Add download icon before the link
  const link = content.querySelector('a');
  if (link) {
    const icon = document.createElement('span');
    icon.className = 'brochure-dimensions-download-icon';
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    link.parentElement.insertBefore(icon, link);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-dimensions-inner';
  wrapper.append(content);

  block.textContent = '';
  block.append(wrapper);
}
