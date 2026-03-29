import { getMetadata } from '../../scripts/aem.js';

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);

  if (!resp.ok) return;

  const html = await resp.text();
  block.textContent = '';

  const footer = document.createElement('div');
  footer.classList.add('footer-content');
  footer.innerHTML = html;

  // Structure the columns
  const columns = footer.querySelector(':scope > div');
  if (columns) {
    columns.classList.add('footer-columns');
    const cols = columns.querySelectorAll(':scope > div');
    if (cols[0]) cols[0].classList.add('footer-legal');
    if (cols[1]) cols[1].classList.add('footer-contact');
    if (cols[2]) cols[2].classList.add('footer-quicklinks');

    // Extract "Follow us" into its own div for responsive reordering
    if (cols[2]) {
      const headings = cols[2].querySelectorAll('h2');
      const lists = cols[2].querySelectorAll('ul');
      if (headings[1] && lists[1]) {
        const followDiv = document.createElement('div');
        followDiv.classList.add('footer-follow');
        followDiv.append(headings[1], lists[1]);
        lists[1].classList.add('footer-social');
        columns.append(followDiv);
      }
    }
  }

  // Copyright paragraph
  const copyright = footer.querySelector(':scope > p');
  if (copyright) copyright.classList.add('footer-copyright');

  block.append(footer);
}
