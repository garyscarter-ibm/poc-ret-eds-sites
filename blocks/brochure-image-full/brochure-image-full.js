export default async function decorate(block) {
  const img = block.querySelector('img');
  if (!img) return;

  img.loading = 'lazy';
  const picture = img.closest('picture') || img;
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-image-full-inner';

  // Count preceding brochure-image-full blocks to determine position
  const allImageBlocks = [...document.querySelectorAll('.brochure-image-full')];
  const index = allImageBlocks.indexOf(block);

  // Full-width variant: no animation, 100% width (first, last, or explicit variant)
  const isLast = index === allImageBlocks.length - 1 && index > 0;
  const isFullWidth = block.classList.contains('full-width') || index === 0 || isLast;
  if (isFullWidth) {
    wrapper.classList.add('full-width');
    if (isLast) wrapper.classList.add('full-width-slim');
  } else {
    // Animated images alternate: odd index = slides from right, even = slides from left
    wrapper.classList.add(index % 2 !== 0 ? 'align-right' : 'align-left');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            wrapper.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    observer.observe(wrapper);
  }

  wrapper.append(picture);
  block.textContent = '';
  block.append(wrapper);
}
