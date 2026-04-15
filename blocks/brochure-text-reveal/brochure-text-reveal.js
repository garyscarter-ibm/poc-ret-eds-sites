export default async function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-text-reveal-inner';

  // Content goes into a single child div for the two-column CSS layout
  const textCol = document.createElement('div');
  textCol.className = 'brochure-text-reveal-content';

  [...block.children].forEach((row) => {
    const content = row.querySelector(':scope > div') || row;
    [...content.children].forEach((el) => {
      el.classList.add('animate-child');
      textCol.append(el);
    });
  });

  wrapper.append(textCol);
  block.textContent = '';
  block.append(wrapper);
}
