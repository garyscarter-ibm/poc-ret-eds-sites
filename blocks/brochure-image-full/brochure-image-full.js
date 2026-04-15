export default async function decorate(block) {
  const img = block.querySelector('img');
  if (img) {
    img.loading = 'lazy';
    const wrapper = document.createElement('div');
    wrapper.className = 'brochure-image-full-inner';
    wrapper.append(img);
    block.textContent = '';
    block.append(wrapper);
  }
}
