/**
 * Brochure footer block.
 * Expected authored structure:
 *   Row 0: Social links — col 0 = heading ("Social Media"), col 1 = links (a tags)
 *   Rows 1–N-1: Link columns — col 0 = heading, col 1 = list of links
 *   Last row: Legal text — col 0 = disclaimer paragraphs
 */
export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const footer = document.createElement('div');
  footer.className = 'brochure-footer-inner';

  // Row 0: Social media section
  const socialRow = rows[0];
  if (socialRow) {
    const socialSection = document.createElement('div');
    socialSection.className = 'brochure-footer-social';
    const cols = [...socialRow.children];

    // Col 0: heading
    const heading = cols[0]?.querySelector('h2, h3, h4, h5, h6, p');
    if (heading) {
      const h3 = document.createElement('h3');
      h3.textContent = heading.textContent;
      socialSection.append(h3);
    }

    // Col 1: social links
    const links = cols[1]?.querySelectorAll('a') || cols[0]?.querySelectorAll('a') || [];
    if (links.length) {
      const ul = document.createElement('ul');
      ul.className = 'brochure-footer-social-links';
      links.forEach((a) => {
        const li = document.createElement('li');
        const link = a.cloneNode(true);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        li.append(link);
        ul.append(li);
      });
      socialSection.append(ul);
    }

    footer.append(socialSection);
  }

  // Middle rows: link columns
  const linkRows = rows.slice(1, -1);
  if (linkRows.length) {
    const linksSection = document.createElement('div');
    linksSection.className = 'brochure-footer-links';

    linkRows.forEach((row) => {
      const col = document.createElement('div');
      col.className = 'brochure-footer-column';
      const cells = [...row.children];

      // Col 0: column heading
      const heading = cells[0]?.querySelector('h2, h3, h4, h5, h6, p');
      if (heading) {
        const h3 = document.createElement('h3');
        h3.textContent = heading.textContent;
        col.append(h3);
      }

      // Col 1 (or col 0 if single column): links
      const linkCell = cells[1] || cells[0];
      const anchors = linkCell?.querySelectorAll('a') || [];
      if (anchors.length) {
        const ul = document.createElement('ul');
        anchors.forEach((a) => {
          const li = document.createElement('li');
          const link = a.cloneNode(true);
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          li.append(link);
          ul.append(li);
        });
        col.append(ul);
      }

      linksSection.append(col);
    });

    footer.append(linksSection);
  }

  // Last row: legal disclaimer
  const legalRow = rows[rows.length - 1];
  if (rows.length > 1 && legalRow) {
    const legal = document.createElement('div');
    legal.className = 'brochure-footer-legal';
    const content = legalRow.querySelector(':scope > div') || legalRow;
    legal.append(...[...content.childNodes].map((n) => n.cloneNode(true)));
    footer.append(legal);
  }

  block.textContent = '';
  block.append(footer);
}
