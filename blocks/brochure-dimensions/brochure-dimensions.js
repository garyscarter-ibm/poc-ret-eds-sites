export default async function decorate(block) {
  const DEFAULT_BG = 'https://assets.foleon.com/eu-central-1/de-uploads-7e3kk3/15958/x7-lci-dimensions-column_overlap_banners.accc75f6718b.jpg?ext=webp&width=1100';

  // Grab authored image if present
  const authoredImg = block.querySelector('picture img') || block.querySelector('img');
  const bgUrl = authoredImg ? authoredImg.src : DEFAULT_BG;

  // Remove image row so it doesn't appear in text content
  if (authoredImg) {
    const pictureRow = authoredImg.closest('picture')?.closest('div')
      || authoredImg.closest('div');
    if (pictureRow && pictureRow !== block) pictureRow.remove();
  }

  // Collect all remaining text content
  const h4 = block.querySelector('h4');
  const paragraphs = block.querySelectorAll('p');
  const link = block.querySelector('a');

  // Build the content card
  const content = document.createElement('div');
  content.className = 'brochure-dimensions-content';

  if (h4) content.append(h4);
  paragraphs.forEach((p) => content.append(p));

  // Add download icon before the link
  if (link) {
    const icon = document.createElement('span');
    icon.className = 'brochure-dimensions-download-icon';
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    link.parentElement.insertBefore(icon, link);
  }

  // Build wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-dimensions-inner';
  wrapper.style.setProperty('--dimensions-bg', `url('${bgUrl}')`);
  wrapper.append(content);

  block.textContent = '';
  block.append(wrapper);
}
