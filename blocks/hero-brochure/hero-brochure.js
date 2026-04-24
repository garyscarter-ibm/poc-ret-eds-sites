const CTA_ITEMS = [
  { label: 'Build now', icon: '/icons/cta-build.svg', href: 'https://configure.bmw.co.uk/en_GB/configid/0c83sgb6' },
  { label: 'New Car Locator', icon: '/icons/cta-locator.svg', href: 'https://stock.bmw.co.uk/marketing_search?model=G07' },
  { label: 'Book a test drive', icon: '/icons/cta-test-drive.svg', href: 'https://www.bmw.co.uk/en/topics/discover/forms/pdi_bmw_i3223_tda.html' },
  { label: 'Offers and Finance', icon: '/icons/cta-offers.svg', href: 'https://offers.bmw.co.uk' },
];

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

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
      const picture = row.querySelector('picture');
      const desktopSource = picture?.querySelector('source[media*="min-width"]');
      bgImage = desktopSource?.srcset || img.src;
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

  // CTA bar overlaid at bottom of hero
  const ctaBar = document.createElement('div');
  ctaBar.className = 'hero-brochure-ctas';

  CTA_ITEMS.forEach((item) => {
    const cta = document.createElement('a');
    cta.href = item.href;
    cta.target = '_blank';
    cta.rel = 'noopener noreferrer';
    cta.className = 'hero-brochure-cta';

    const icon = document.createElement('span');
    icon.className = 'hero-brochure-cta-icon';
    const iconImg = document.createElement('img');
    iconImg.src = item.icon;
    iconImg.alt = item.label;
    iconImg.loading = 'lazy';
    icon.append(iconImg);

    const label = document.createElement('span');
    label.className = 'hero-brochure-cta-label';
    label.textContent = item.label;

    cta.append(icon, label);
    ctaBar.append(cta);
  });

  wrapper.append(ctaBar);
  block.textContent = '';
  block.append(wrapper);
}
