export default async function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-text-reveal-inner';

  [...block.children].forEach((row) => {
    const content = row.querySelector(':scope > div') || row;
    [...content.children].forEach((el) => {
      el.classList.add('animate-child');
      wrapper.append(el);
    });
  });

  block.textContent = '';
  block.append(wrapper);
}
