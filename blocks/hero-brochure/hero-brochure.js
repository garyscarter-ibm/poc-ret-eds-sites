export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'hero-brochure-inner';

  let bgImage = null;
  let heading = null;

  rows.forEach((row) => {
    const img = row.querySelector('img');
    const h1 = row.querySelector('h1');
    if (h1) {
      heading = h1;
    } else if (img) {
      bgImage = img.src;
    }
  });

  if (bgImage) {
    wrapper.style.backgroundImage = `url('${bgImage}')`;
  }

  if (heading) {
    const headingWrap = document.createElement('div');
    headingWrap.className = 'hero-brochure-heading';
    headingWrap.append(heading);
    wrapper.append(headingWrap);
  }

  block.textContent = '';
  block.append(wrapper);
}
