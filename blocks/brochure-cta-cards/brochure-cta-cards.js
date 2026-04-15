export default async function decorate(block) {
  const rows = [...block.children];
  const cards = document.createElement('div');
  cards.className = 'brochure-cta-cards-grid';

  rows.forEach((row) => {
    const cols = [...row.children];
    const card = document.createElement('a');
    card.className = 'brochure-cta-card';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    // First col: image, Second col: link/text
    const imgCol = cols[0];
    const linkCol = cols[1];

    const img = imgCol?.querySelector('img');
    if (img) {
      img.loading = 'lazy';
      card.append(img);
    }

    const link = linkCol?.querySelector('a');
    if (link) {
      card.href = link.href;
      const label = document.createElement('span');
      label.className = 'brochure-cta-card-label';
      label.textContent = link.textContent;
      card.append(label);
    }

    cards.append(card);
  });

  block.textContent = '';
  block.append(cards);
}
