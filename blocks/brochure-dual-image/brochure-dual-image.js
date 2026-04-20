export default async function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-dual-image-grid';

  const imgs = block.querySelectorAll('img');
  imgs.forEach((img) => {
    img.loading = 'lazy';
    const container = document.createElement('div');
    container.className = 'brochure-dual-image-item animate-child';
    container.append(img);
    wrapper.append(container);
  });

  block.textContent = '';
  block.append(wrapper);
}
