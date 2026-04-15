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
      // Hero heading row
      heading = hasHeading;
    } else if (img && link) {
      // CTA item: icon + link
      const cta = document.createElement('a');
      cta.href = link.href;
      cta.target = '_blank';
      cta.rel = 'noopener noreferrer';
      cta.className = 'brochure-hero-cards-cta';

      const icon = document.createElement('span');
      icon.className = 'brochure-hero-cards-icon';
      img.loading = 'lazy';
      icon.append(img);

      const label = document.createElement('span');
      label.className = 'brochure-hero-cards-label';
      label.textContent = link.textContent.trim();

      cta.append(icon, label);
      ctaBar.append(cta);
    } else if (img && !link) {
      // Background image
      bgImage = img.src;
    }
  });

  // If no explicit bg image found, use the first section bg from original
  if (!bgImage) {
    bgImage = 'https://assets.foleon.com/eu-central-1/de-uploads-7e3kk3/15958/di21_000047711.555f12e379fc.jpg?ext=webp&width=4000';
  }
  wrapper.style.backgroundImage = `url('${bgImage}')`;

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
