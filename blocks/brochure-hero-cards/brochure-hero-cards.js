const CTA_ICON_MAP = {
  'build now': '/icons/cta-build.svg',
  'build your bmw': '/icons/cta-build.svg',
  'new car locator': '/icons/cta-locator.svg',
  'book a test drive': '/icons/cta-test-drive.svg',
  'offers and finance': '/icons/cta-offers.svg',
};

function resolveIcon(linkText) {
  const key = (linkText || '').toLowerCase().trim();
  return CTA_ICON_MAP[key] || null;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-hero-cards-inner';

  const ctaBar = document.createElement('div');
  ctaBar.className = 'brochure-hero-cards-ctas';

  let heading = null;
  let bgImage = null;

  rows.forEach((row) => {
    const hasHeading = row.querySelector('h2');
    const img = row.querySelector('img');
    const link = row.querySelector('a');

    if (hasHeading) {
      heading = hasHeading;
    } else if (img && link) {
      const cta = document.createElement('a');
      cta.href = link.href;
      cta.target = '_blank';
      cta.rel = 'noopener noreferrer';
      cta.className = 'brochure-hero-cards-cta';

      const icon = document.createElement('span');
      icon.className = 'brochure-hero-cards-icon';

      // Use local SVG icons instead of banner-style source images
      const iconSrc = resolveIcon(link.textContent);
      if (iconSrc) {
        const iconImg = document.createElement('img');
        iconImg.src = iconSrc;
        iconImg.alt = link.textContent.trim();
        iconImg.loading = 'lazy';
        icon.append(iconImg);
      } else {
        img.loading = 'lazy';
        icon.append(img);
      }

      const label = document.createElement('span');
      label.className = 'brochure-hero-cards-label';
      label.textContent = link.textContent.trim();

      cta.append(icon, label);
      ctaBar.append(cta);
    } else if (img && !link) {
      bgImage = img.src;
    }
  });

  if (bgImage) {
    wrapper.style.backgroundImage = `url('${bgImage}')`;
  }

  if (heading) {
    const headingWrap = document.createElement('div');
    headingWrap.className = 'brochure-hero-cards-heading';
    headingWrap.append(heading);
    wrapper.append(headingWrap);
  }

  wrapper.append(ctaBar);
  block.textContent = '';
  block.append(wrapper);
}
