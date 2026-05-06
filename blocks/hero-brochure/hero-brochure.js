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

export default async function decorate(block) {
  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'hero-brochure-inner';

  let bgImage = null;
  let heading = null;

  rows.forEach((row) => {
    const img = row.querySelector('img');
    const h1 = row.querySelector('h1');
    if (h1) {
      heading = h1;
    } else if (img) {
      bgImage = img.src;
    }
  });

  if (bgImage) {
    wrapper.style.backgroundImage = `url('${bgImage}')`;
  }

  if (heading) {
    const headingWrap = document.createElement('div');
    headingWrap.className = 'hero-brochure-heading';
    headingWrap.append(heading);
    wrapper.append(headingWrap);
  }

  const ctaBar = document.createElement('div');
  ctaBar.className = 'hero-brochure-ctas';

  const links = getCtaLinks();
  links.forEach((item) => {
    const cta = document.createElement('a');
    cta.href = item.url;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    cta.className = 'hero-brochure-cta';

    const icon = document.createElement('span');
    icon.className = 'hero-brochure-cta-icon';
    const iconImg = document.createElement('img');
    iconImg.src = item.icon;
    iconImg.alt = item.text;
    iconImg.loading = 'lazy';
    icon.append(iconImg);

    const label = document.createElement('span');
    label.className = 'hero-brochure-cta-label';
    label.textContent = item.text;

    cta.append(icon, label);
    ctaBar.append(cta);
  });

  wrapper.append(ctaBar);
  block.textContent = '';
  block.append(wrapper);
}
