export default async function decorate(block) {
  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-hero-cards-inner';

  // Rows are card items: image + link
  // Last row may be the hero heading + CTA links section
  const cards = document.createElement('div');
  cards.className = 'brochure-hero-cards-grid';

  const heroContent = document.createElement('div');
  heroContent.className = 'brochure-hero-cards-content';

  rows.forEach((row) => {
    const cols = [...row.children];
    const hasImage = row.querySelector('img');
    const hasHeading = row.querySelector('h2');

    if (hasHeading) {
      // This is the hero content row
      const content = cols[0] || row;
      heroContent.append(...content.childNodes);
    } else if (hasImage) {
      // This is a card
      const card = document.createElement('a');
      card.className = 'brochure-hero-card';
      card.target = '_blank';
      card.rel = 'noopener noreferrer';

      const img = row.querySelector('img');
      if (img) {
        img.loading = 'lazy';
        card.append(img);
      }

      const link = row.querySelector('a');
      if (link) {
        card.href = link.href;
      }

      cards.append(card);
    }
  });

  wrapper.append(cards, heroContent);
  block.textContent = '';
  block.append(wrapper);
}
