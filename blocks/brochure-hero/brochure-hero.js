const HERO_LINKS = [
  {
    text: 'Build now',
    url: 'https://configure.bmw.co.uk/en_GB/configid/0c83sgb6',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l4-4h10l4 4"/><rect x="2" y="9" width="20" height="9" rx="1"/><circle cx="6.5" cy="14" r="1.5"/><circle cx="17.5" cy="14" r="1.5"/><path d="M2 18v2h4v-2M18 18v2h4v-2"/></svg>',
  },
  {
    text: 'New Car Locator',
    url: 'https://stock.bmw.co.uk/marketing_search?model=G07',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  },
  {
    text: 'Book a test drive',
    url: 'https://www.bmw.co.uk/en/topics/discover/forms/pdi_bmw_i3223_tda.html',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  },
  {
    text: 'Offers and Finance',
    url: 'https://offers.bmw.co.uk',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  },
];

function buildHeroActions() {
  const nav = document.createElement('ul');
  nav.className = 'brochure-hero-actions';
  HERO_LINKS.forEach(({ text, url, icon }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'brochure-hero-action-icon';
    iconSpan.innerHTML = icon;
    a.append(iconSpan);

    const label = document.createElement('span');
    label.textContent = text;
    a.append(label);

    li.append(a);
    nav.append(li);
  });
  return nav;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-hero-inner';

  // Row 0: Background image (as img or picture — preserved for AEM responsive optimizations)
  // Row 1 (optional): overlay content (heading, subtitle, CTA links)
  const bgRow = rows[0];
  const contentRow = rows[1];

  const picture = bgRow?.querySelector('picture') || bgRow?.querySelector('img')?.closest('picture');
  const img = bgRow?.querySelector('img');
  if (picture) {
    picture.classList.add('brochure-hero-bg');
    if (img) img.loading = 'eager';
    wrapper.append(picture);
    wrapper.classList.add('has-bg');
  } else if (img) {
    img.loading = 'eager';
    img.classList.add('brochure-hero-bg');
    wrapper.append(img);
    wrapper.classList.add('has-bg');
  }

  if (contentRow) {
    const overlay = document.createElement('div');
    overlay.className = 'brochure-hero-overlay';
    const content = contentRow.querySelector(':scope > div') || contentRow;
    overlay.append(...content.childNodes);
    overlay.append(buildHeroActions());
    wrapper.append(overlay);
  }

  block.textContent = '';
  block.append(wrapper);
}
