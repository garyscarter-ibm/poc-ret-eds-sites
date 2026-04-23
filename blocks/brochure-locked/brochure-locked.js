export default function decorate(block) {
  block.textContent = '';

  const section = block.closest('.section');
  if (section) {
    section.style.overflow = 'visible';
  }
}
