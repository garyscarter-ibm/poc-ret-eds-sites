export default function decorate(block) {
  const isMini = block.classList.contains('mini');

  const contentRow = block.children[1];
  if (!contentRow) return;

  const children = [...contentRow.children];

  // Find optional "Welcome To" paragraph (a div containing only a short <p>, before any heading)
  let welcomeDiv = null;
  const firstChild = children[0];
  if (firstChild) {
    const p = firstChild.querySelector('p');
    const h = firstChild.querySelector('h1, h2, h3, h4, h5, h6');
    if (p && !h && p.textContent.trim().length < 30) {
      welcomeDiv = firstChild;
      p.classList.add('hero-dealership-welcome');
    }
  }

  // Find headings
  const headingDivs = children.filter((d) => d.querySelector('h1, h2, h3, h4, h5, h6'));
  const titleDiv = headingDivs[0];
  const subtitleDiv = headingDivs[1];

  if (titleDiv) titleDiv.querySelector('h1, h2, h3, h4, h5, h6').classList.add('hero-dealership-title');
  if (subtitleDiv) subtitleDiv.querySelector('h1, h2, h3, h4, h5, h6').classList.add('hero-dealership-subtitle');

  // Find CTA links (exclude ratings and review text)
  const ctaDivs = children.filter((d) => {
    const a = d.querySelector('a');
    const p = d.querySelector('p');
    if (!a || !p) return false;
    const text = p.textContent.trim();
    if (text.includes('SALES') || text.includes('SERVICE')) return false;
    if (text.includes('reviews')) return false;
    return true;
  });

  // Find rating paragraphs
  const ratingDivs = children.filter((d) => {
    const p = d.querySelector('p');
    if (p) return p.textContent.includes('SALES') || p.textContent.includes('SERVICE');
    return d.textContent.includes('SALES:') || d.textContent.includes('SERVICE:');
  });

  // Find review link
  const reviewDiv = children.find((d) => {
    const a = d.querySelector('a');
    return a && a.textContent.includes('reviews');
  });

  // Build CTA buttons container
  if (ctaDivs.length > 0) {
    const ctaContainer = document.createElement('div');
    ctaContainer.className = 'hero-dealership-ctas';
    ctaDivs.forEach((d, i) => {
      const a = d.querySelector('a');
      if (a) {
        if (isMini) {
          // MINI: both buttons are secondary style
          a.className = 'hero-dealership-btn hero-dealership-btn-secondary';
        } else {
          a.className = i === 0
            ? 'hero-dealership-btn hero-dealership-btn-primary'
            : 'hero-dealership-btn hero-dealership-btn-secondary';
        }
        ctaContainer.append(a);
      }
      d.remove();
    });
    if (subtitleDiv) subtitleDiv.after(ctaContainer);
  }

  // Build ratings container
  if (ratingDivs.length > 0) {
    const ratingsContainer = document.createElement('div');
    ratingsContainer.className = 'hero-dealership-ratings';

    const ratingsRow = document.createElement('div');
    ratingsRow.className = 'hero-dealership-ratings-row';

    ratingDivs.forEach((d) => {
      const text = d.textContent.trim();
      const match = text.match(/(SALES|SERVICE):\s*([\d.]+)/);
      if (!match) return;

      const label = match[1];
      const score = match[2];

      const ratingEl = document.createElement('div');
      ratingEl.className = 'hero-dealership-rating';

      const labelEl = document.createElement('h3');
      labelEl.className = 'hero-dealership-rating-label';
      labelEl.textContent = label;

      const starsRow = document.createElement('div');
      starsRow.className = 'hero-dealership-stars-row';
      const fullStars = Math.floor(parseFloat(score));
      for (let s = 0; s < 5; s += 1) {
        const star = document.createElement('span');
        star.className = s < fullStars ? 'star star-full' : 'star star-empty';
        starsRow.append(star);
      }

      const scoreEl = document.createElement('span');
      scoreEl.className = 'hero-dealership-rating-score';
      scoreEl.textContent = score;
      starsRow.append(scoreEl);

      ratingEl.append(labelEl, starsRow);
      ratingsRow.append(ratingEl);
      d.remove();
    });

    ratingsContainer.append(ratingsRow);

    if (reviewDiv) {
      const a = reviewDiv.querySelector('a');
      if (a) {
        a.className = 'hero-dealership-reviews-link';
        ratingsContainer.append(a);
      }
      reviewDiv.remove();
    }

    contentRow.append(ratingsContainer);
  }

  // MINI: add decorative frame elements
  if (isMini) {
    const frame = document.createElement('div');
    frame.className = 'hero-dealership-frame';
    frame.innerHTML = '<span class="frame-top"></span><span class="frame-right"></span><span class="frame-bottom"></span><span class="frame-left"></span>';
    block.append(frame);
  }
}
