const CTA_ICON_MAP = {
  'build now': '/icons/cta-build.svg',
  'build your bmw': '/icons/cta-build.svg',
  'new car locator': '/icons/cta-locator.svg',
  'book a test drive': '/icons/cta-test-drive.svg',
  'book a test ride': '/icons/cta-test-drive.svg',
  'offers and finance': '/icons/cta-offers.svg',
  'explore the model': '/icons/cta-explore.svg',
  'find a dealer': '/icons/cta-locator.svg',
};

const CTA_LABEL_MAP = {
  'https://www.bmw.co.uk/en/all-models.html': 'Build your BMW',
  'https://stock.bmw.co.uk/marketing_search': 'New Car Locator',
  /* eslint-disable-next-line quote-props */
  pdi_bmw: 'Book a Test Drive',
  'offers.bmw.co.uk': 'Offers and Finance',
  'configure.bmw.co.uk': 'Build now',
  'bmw-motorrad.co.uk/en/models/': 'Explore the model',
  'bmw-motorrad.co.uk/en/test-ride': 'Book a test ride',
  'bmw-motorrad.co.uk/en/shopping-tools/find-a-dealer': 'Find a dealer',
};

function resolveLabel(href) {
  const url = href || '';
  const entries = Object.entries(CTA_LABEL_MAP);
  for (let i = 0; i < entries.length; i += 1) {
    if (url.includes(entries[i][0])) return entries[i][1];
  }
  return '';
}

function resolveIcon(label) {
  const key = (label || '').toLowerCase().trim();
  return CTA_ICON_MAP[key] || null;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const grid = document.createElement('div');
  grid.className = 'cta-bar-grid';

  rows.forEach((row) => {
    const link = row.querySelector('a');
    if (!link) return;

    const card = document.createElement('a');
    card.className = 'cta-bar-card';
    card.href = link.href;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const label = resolveLabel(link.href) || link.textContent.trim();
    const iconSrc = resolveIcon(label);

    if (iconSrc) {
      const icon = document.createElement('img');
      icon.src = iconSrc;
      icon.alt = label;
      icon.loading = 'lazy';
      icon.className = 'cta-bar-icon';
      card.append(icon);
    }

    if (label) {
      const span = document.createElement('span');
      span.className = 'cta-bar-label';
      span.textContent = label;
      card.append(span);
    }

    grid.append(card);
  });

  block.textContent = '';
  block.append(grid);
}
