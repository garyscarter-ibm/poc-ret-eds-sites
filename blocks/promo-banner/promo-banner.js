/**
 * Promo Banner block
 * Full-width background image with text overlay on left side
 * Used for promotional CTAs like "BMW for Business"
 *
 * Content model:
 *   Row 1: Background image
 *   Row 2: Heading text
 *   Row 3: Body paragraph
 *   Row 4: CTA link
 */
export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  // Row 1: background image
  const imgRow = rows[0];
  const img = imgRow?.querySelector('picture img, img');

  // Create background container
  const container = document.createElement('div');
  container.className = 'promo-banner-container';

  if (img) {
    container.style.backgroundImage = `url('${img.src}')`;
  }

  // Gradient overlay for text readability
  const overlay = document.createElement('div');
  overlay.className = 'promo-banner-overlay';

  // Content area
  const content = document.createElement('div');
  content.className = 'promo-banner-content';

  // Row 2: heading
  const headingRow = rows[1];
  if (headingRow) {
    const h4 = document.createElement('h4');
    h4.className = 'promo-banner-heading';
    h4.textContent = headingRow.textContent.trim();
    content.append(h4);
  }

  // Row 3: body
  const bodyRow = rows[2];
  if (bodyRow) {
    const p = document.createElement('p');
    p.className = 'promo-banner-body';
    p.innerHTML = bodyRow.innerHTML;
    content.append(p);
  }

  // Row 4: CTA
  const ctaRow = rows[3];
  if (ctaRow) {
    const link = ctaRow.querySelector('a');
    if (link) {
      const ctaDiv = document.createElement('div');
      ctaDiv.className = 'promo-banner-cta';
      const a = document.createElement('a');
      a.href = link.href;
      a.className = 'promo-banner-link';
      a.textContent = link.textContent.trim();
      ctaDiv.append(a);
      content.append(ctaDiv);
    }
  }

  container.append(overlay, content);
  block.append(container);

  // Scroll animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        block.classList.add('in-viewport');
        observer.unobserve(block);
      }
    });
  }, { threshold: 0.2 });
  observer.observe(block);
}
