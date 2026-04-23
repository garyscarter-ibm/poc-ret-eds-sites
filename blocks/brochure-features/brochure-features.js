const FEATURE_IMAGES = {
  'Sky-Lounge-Panoramic-Glass-Sunroof': '/content/brochures/x7/interior-design/media_142ca6223d472c9b94711f2631f356dfe519e4bbc.jpg?width=750&format=jpg&optimize=medium',
  'Crafted-Clarity-Controls': '/content/brochures/x7/interior-design/media_1222bae8a1d051c9f77871891cdbb2243f97a9241.jpg?width=750&format=jpg&optimize=medium',
  'M-Electric-Front-Sport-Seats': '/content/brochures/x7/interior-design/media_15d96b90d1e7e6b20e7b6ba71155a37657a2fb97e.jpg?width=750&format=jpg&optimize=medium',
  'Five-Zone-Automatic-Air-Conditioning': '/content/brochures/x7/interior-design/media_1bab98bf27fb17581d1dc9acaa3dd2d5cf62308b6.jpg?width=750&format=jpg&optimize=medium',
};

export default async function decorate(block) {
  const rows = [...block.children];
  const grid = document.createElement('div');
  grid.className = 'brochure-features-grid';

  rows.forEach((row, index) => {
    const cols = [...row.children];
    const card = document.createElement('div');
    card.className = 'brochure-feature-card animate-child';

    const overlayId = cols[1]?.textContent?.trim();

    // Use authored image (col 2) if present, otherwise fall back to hardcoded map
    const authoredImg = cols[2]?.querySelector('img');
    if (authoredImg) {
      authoredImg.className = 'brochure-feature-bg';
      authoredImg.loading = 'lazy';
      authoredImg.alt = '';
      card.append(authoredImg);
    } else {
      const imgSrc = FEATURE_IMAGES[overlayId];
      if (imgSrc) {
        const img = document.createElement('img');
        img.className = 'brochure-feature-bg';
        img.src = imgSrc;
        img.alt = '';
        img.loading = 'lazy';
        card.append(img);
      }
    }

    const num = document.createElement('div');
    num.className = 'brochure-feature-num';
    num.textContent = String(index + 1).padStart(2, '0');

    const title = document.createElement('h4');
    title.className = 'brochure-feature-title';
    title.textContent = cols[0]?.textContent?.trim() || '';

    card.append(num, title);

    if (overlayId) {
      const link = document.createElement('a');
      link.className = 'brochure-feature-link';
      link.href = `#overlay-${overlayId}`;
      link.textContent = 'Learn more';
      card.append(link);
    }

    grid.append(card);
  });

  block.textContent = '';
  block.append(grid);
}
