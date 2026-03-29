export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Build scroll track
  const track = document.createElement('div');
  track.className = 'carousel-offers-track';

  rows.forEach((row) => {
    const card = document.createElement('div');
    card.className = 'carousel-offers-card';

    const cols = [...row.children];
    const imgCol = cols.find((c) => c.querySelector('img'));
    const textCol = cols.find((c) => !c.querySelector('img')) || cols[cols.length - 1];

    if (imgCol) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'carousel-offers-card-image';
      const img = imgCol.querySelector('img');
      if (img) imgWrap.append(img);
      card.append(imgWrap);
    }

    if (textCol) {
      const textWrap = document.createElement('div');
      textWrap.className = 'carousel-offers-card-text';
      textWrap.innerHTML = textCol.innerHTML;

      // Style CTA links
      textWrap.querySelectorAll('a').forEach((a) => {
        a.classList.add('carousel-offers-link');
      });

      card.append(textWrap);
    }

    track.append(card);
    row.remove();
  });

  block.append(track);

  // Add prev/next buttons
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-offers-prev';
  prevBtn.textContent = '\u2039';
  prevBtn.disabled = true;

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-offers-next';
  nextBtn.textContent = '\u203A';

  block.append(prevBtn, nextBtn);

  // Scroll handling
  const scrollAmount = 300;
  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  track.addEventListener('scroll', () => {
    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
  });
}
