export default async function decorate(block) {
  const img = block.querySelector('img');
  if (!img) return;

  img.loading = 'lazy';
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-image-full-inner';

  // Determine alignment by counting preceding brochure-image-full blocks
  const allImageBlocks = [...document.querySelectorAll('.brochure-image-full')];
  const index = allImageBlocks.indexOf(block);
  // Alternate: first=right, second=left, etc.
  wrapper.classList.add(index % 2 === 0 ? 'align-right' : 'align-left');

  wrapper.append(img);
  block.textContent = '';
  block.append(wrapper);

  // Animate in when scrolled into view
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
