import { createCarouselButton, wireCarouselScroll } from '../../scripts/block-utils.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Build scroll track
  const track = document.createElement('div');
  track.className = 'carousel-offers-track scroll-hidden';

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

      // Style CTA links — use shared chevron component
      textWrap.querySelectorAll('a').forEach((a) => {
        a.classList.add('carousel-offers-link', 'cta-chevron', 'cta-chevron--black');
      });

      card.append(textWrap);
    }

    track.append(card);
    row.remove();
  });

  block.append(track);

  // Add prev/next buttons
  const prevBtn = createCarouselButton('prev', { classPrefix: 'carousel-offers', ariaPrefix: 'offers', style: 'char' });
  prevBtn.disabled = true;

  const nextBtn = createCarouselButton('next', { classPrefix: 'carousel-offers', ariaPrefix: 'offers', style: 'char' });

  block.append(prevBtn, nextBtn);

  wireCarouselScroll(track, prevBtn, nextBtn, { scrollAmount: 300, disableAtEdges: true });
}
