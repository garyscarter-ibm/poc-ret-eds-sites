import { getMetadata } from '../../scripts/aem.js';

export default async function decorate(block) {
  const theme = getMetadata('theme');
  if (theme) block.classList.add(theme);

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
    let cols = [...columns.querySelectorAll(':scope > div')];

    // da.live serves flat structure (no inner divs) - group by h2 headings
    if (cols.length === 0) {
      const headings = [...columns.querySelectorAll(':scope > h2')];
      const groups = headings.map((h2) => {
        const col = document.createElement('div');
        let next = h2.nextSibling;
        col.append(h2);
        while (next && !(next.nodeType === 1 && next.tagName === 'H2')) {
          const current = next;
          next = next.nextSibling;
          if (current.nodeType === 1) col.append(current);
        }
        return col;
      });
      // Merge extra groups into the 3rd column (e.g. Quick links + Follow us)
      if (groups.length > 3) {
        for (let i = 3; i < groups.length; i += 1) {
          while (groups[i].firstChild) groups[2].append(groups[i].firstChild);
        }
        groups.length = 3;
      }
      cols = groups;
      // Move copyright out before appending columns
      const copyright = columns.querySelector(':scope > p');
      columns.replaceChildren(...cols);
      if (copyright) footer.append(copyright);
    }

    if (cols[0]) cols[0].classList.add('footer-legal');
    if (cols[1]) cols[1].classList.add('footer-contact');
    if (cols[2]) cols[2].classList.add('footer-quicklinks');

    // Extract "Follow us" into its own div for responsive reordering
    const quicklinksCol = cols[2];
    if (quicklinksCol) {
      const headings = quicklinksCol.querySelectorAll('h2');
      const lists = quicklinksCol.querySelectorAll('ul');
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
