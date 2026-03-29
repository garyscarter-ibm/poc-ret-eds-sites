function createStarRating(rating = 5.0) {
  const container = document.createElement('div');
  container.className = 'columns-feature-star-rating';
  const fullStars = Math.floor(rating);
  for (let i = 0; i < 5; i += 1) {
    const star = document.createElement('span');
    star.className = `columns-feature-star${i < fullStars ? ' active' : ''}`;
    star.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg>';
    container.append(star);
  }
  const num = document.createElement('span');
  num.className = 'columns-feature-rating-number';
  num.textContent = rating.toFixed(1);
  container.append(num);
  return container;
}

export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row, i) => {
    const cols = [...row.children];
    const imgCol = cols.find((c) => c.querySelector('img'));
    const textCol = cols.find((c) => !c.querySelector('img'));

    if (imgCol) imgCol.classList.add('columns-feature-image');
    if (textCol) textCol.classList.add('columns-feature-text');

    // Alternate layout: even rows get image on right
    if (i % 2 !== 0) {
      row.classList.add('columns-feature-alt');
    }
  });

  block.querySelectorAll('a').forEach((a) => {
    a.classList.add('cta-chevron', 'cta-chevron--blue');
  });

  // Inject star rating for SERVICE RATING / SALES RATING sections
  const heading = block.querySelector('h3, h5');
  if (heading) {
    const text = heading.textContent.trim().toUpperCase();
    if (text.includes('SERVICE RATING') || text.includes('SALES RATING')) {
      const desc = heading.nextElementSibling;
      const insertBefore = desc?.tagName === 'P' && !desc.querySelector('a') ? desc.nextElementSibling : desc;
      if (insertBefore) {
        insertBefore.parentNode.insertBefore(createStarRating(5.0), insertBefore);
      }
    }
  }
}
