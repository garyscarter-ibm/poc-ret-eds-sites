export default async function decorate(block) {
  const rows = [...block.children];
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-hero-inner';

  // Row 0: Background image (as img or picture)
  // Row 1 (optional): overlay content (heading, subtitle, CTA links)
  const bgRow = rows[0];
  const contentRow = rows[1];

  const img = bgRow?.querySelector('img');
  if (img) {
    img.loading = 'eager';
    wrapper.style.backgroundImage = `url('${img.src}')`;
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
