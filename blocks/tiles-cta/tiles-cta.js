export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cols = [...row.children];
    const linkCol = cols.find((c) => c.querySelector('a'));
    if (linkCol) {
      const links = linkCol.querySelectorAll('a');
      links.forEach((a) => {
        a.classList.add('tiles-cta-link');
      });
    }
  });
}
