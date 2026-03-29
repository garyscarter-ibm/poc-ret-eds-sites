export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('overlay-card');
  });

  block.querySelectorAll('a').forEach((a) => {
    a.classList.add('cta-chevron', 'cta-chevron--white');
  });
}
