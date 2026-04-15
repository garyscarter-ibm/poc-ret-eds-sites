export default async function decorate(block) {
  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-dimensions-inner';

  const rows = [...block.children];
  rows.forEach((row) => {
    const content = row.querySelector(':scope > div') || row;
    wrapper.append(...content.childNodes);
  });

  block.textContent = '';
  block.append(wrapper);
}
