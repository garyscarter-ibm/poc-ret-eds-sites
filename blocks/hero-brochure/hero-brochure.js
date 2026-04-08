/**
 * Hero Brochure block
 * Full-viewport background image hero for BMW brochure pages.
 * The "THE X7" branding is baked into the photograph — no text overlay needed.
 *
 * Content model:
 *   Row 1: Background image
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  // Row 1: background image
  const imgRow = rows[0];
  const picture = imgRow?.querySelector('picture');
  const img = imgRow?.querySelector('img');

  if (img) {
    const container = document.createElement('div');
    container.className = 'hero-brochure-bg';

    if (picture) {
      container.append(picture);
    } else {
      const pic = document.createElement('picture');
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || '';
      newImg.loading = 'eager';
      pic.append(newImg);
      container.append(pic);
    }

    block.append(container);
  }

  // Scroll-triggered fade-in
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        block.classList.add('is-loaded');
        observer.unobserve(block);
      }
    });
  }, { threshold: 0.1 });
  observer.observe(block);
}
