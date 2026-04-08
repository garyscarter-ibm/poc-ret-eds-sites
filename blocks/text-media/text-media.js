/**
 * Text-Media block
 * Image paired with heading + descriptive text (no CTA required)
 * Used for feature descriptions in brochure pages
 *
 * Content model:
 *   Row 1: image | heading + description text
 */
export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const cols = [...row.children];
    cols.forEach((col) => {
      const img = col.querySelector('picture, img');
      const heading = col.querySelector('h1, h2, h3, h4, h5, h6');

      if (img && !heading) {
        col.classList.add('text-media-image');
      } else if (heading) {
        col.classList.add('text-media-content');
      }
    });
  });

  // Scroll-triggered animation: observe when block enters viewport
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
