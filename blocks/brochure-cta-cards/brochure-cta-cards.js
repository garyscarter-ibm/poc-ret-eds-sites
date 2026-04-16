const CTA_ICON_MAP = {
  'build your bmw': '/icons/cta-build.svg',
  'build now': '/icons/cta-build.svg',
  'new car locator': '/icons/cta-locator.svg',
  'book a test drive': '/icons/cta-test-drive.svg',
  'offers and finance': '/icons/cta-offers.svg',
};

function resolveIcon(img) {
  if (img && img.src && !img.src.includes('about:error') && img.naturalWidth > 0) {
    return img.src;
  }
  const alt = (img?.alt || '').toLowerCase().trim();
  return CTA_ICON_MAP[alt] || null;
}

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

    const imgCol = cols[0];
    const linkCol = cols[1];

    const img = imgCol?.querySelector('img');
    const iconSrc = resolveIcon(img);
    if (iconSrc) {
      const icon = document.createElement('img');
      icon.src = iconSrc;
      icon.loading = 'lazy';
      icon.alt = img?.alt || '';
      icon.className = 'brochure-cta-card-icon';
      card.append(icon);
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
