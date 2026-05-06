import { getActiveBrochure } from '../../scripts/brochure-config.js';

const CTA_CONFIGS = {
  x7: [
    { text: 'Build now', url: 'https://configure.bmw.co.uk/en_GB/configid/0c83sgb6', icon: '/icons/cta-build.svg' },
    { text: 'New Car Locator', url: 'https://stock.bmw.co.uk/marketing_search?model=G07', icon: '/icons/cta-locator.svg' },
    { text: 'Book a test drive', url: 'https://www.bmw.co.uk/en/topics/discover/forms/pdi_bmw_i3223_tda.html', icon: '/icons/cta-test-drive.svg' },
    { text: 'Offers and Finance', url: 'https://offers.bmw.co.uk', icon: '/icons/cta-offers.svg' },
  ],
  s1000rr: [
    { text: 'Explore the model', url: 'https://www.bmw-motorrad.co.uk/en/models/sport/s1000rr.html', icon: '/icons/cta-explore.svg' },
    { text: 'Book a test ride', url: 'https://www.bmw-motorrad.co.uk/en/test-ride.html', icon: '/icons/cta-test-drive.svg' },
    { text: 'Find a dealer', url: 'https://www.bmw-motorrad.co.uk/en/shopping-tools/find-a-dealer.html', icon: '/icons/cta-locator.svg' },
  ],
};

function getCtaLinks() {
  const brochure = getActiveBrochure();
  if (!brochure) return CTA_CONFIGS.x7;
  const key = Object.keys(CTA_CONFIGS).find(
    (k) => brochure.basePath.includes(k),
  );
  return CTA_CONFIGS[key] || CTA_CONFIGS.x7;
}

function buildHeroActions() {
  const links = getCtaLinks();
  const nav = document.createElement('ul');
  nav.className = 'brochure-hero-actions';
  links.forEach(({ text, url, icon }) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'brochure-hero-action-icon';
    const iconImg = document.createElement('img');
    iconImg.src = icon;
    iconImg.alt = text;
    iconImg.loading = 'lazy';
    iconSpan.append(iconImg);
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
