export default async function decorate(block) {
  // Add front grille hero image above the body block
  const heroImg = document.createElement('div');
  heroImg.className = 'brochure-body-hero';
  const img = document.createElement('img');
  img.src = '/media_front-grille.jpg';
  img.alt = 'BMW X7 front grille close-up';
  img.loading = 'lazy';
  heroImg.append(img);
  block.before(heroImg);

  // Animate the hero image in on scroll
  const heroObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          heroImg.classList.add('in-view');
          heroObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  heroObserver.observe(heroImg);

  const wrapper = document.createElement('div');
  wrapper.className = 'brochure-body-inner';

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
