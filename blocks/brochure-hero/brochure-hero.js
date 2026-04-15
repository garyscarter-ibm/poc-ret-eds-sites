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
    wrapper.append(overlay);
  }

  block.textContent = '';
  block.append(wrapper);
}
