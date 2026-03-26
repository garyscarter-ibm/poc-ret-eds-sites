export default function decorate(block) {
  const contentRow = block.children[1];
  if (!contentRow) return;

  const children = [...contentRow.children];

  // Find headings by position — works with any heading level
  const headingDivs = children.filter((d) => d.querySelector('h1, h2, h3, h4, h5, h6'));
  const titleDiv = headingDivs[0];
  const subtitleDiv = headingDivs[1];

  // Add semantic classes so CSS targets role, not tag
  if (titleDiv) titleDiv.querySelector('h1, h2, h3, h4, h5, h6').classList.add('hero-title');
  if (subtitleDiv) subtitleDiv.querySelector('h1, h2, h3, h4, h5, h6').classList.add('hero-subtitle');

  // Find CTA links (divs with just a link, not ratings text)
  const ctaDivs = children.filter((d) => {
    const a = d.querySelector('a');
    const p = d.querySelector('p');
    if (!a || !p) return false;
    // Exclude ratings text and review link
    const text = p.textContent.trim();
    if (text.includes('SALES') || text.includes('SERVICE')) return false;
    if (text.includes('reviews')) return false;
    return true;
  });

  // Find rating paragraphs
  const ratingDivs = children.filter((d) => {
    const p = d.querySelector('p');
    return p && (p.textContent.includes('SALES') || p.textContent.includes('SERVICE'));
  });

  // Find review link
  const reviewDiv = children.find((d) => {
    const a = d.querySelector('a');
    return a && a.textContent.includes('reviews');
  });

  // Build CTA buttons container
  if (ctaDivs.length > 0) {
    const ctaContainer = document.createElement('div');
    ctaContainer.className = 'hero-ctas';
    ctaDivs.forEach((d, i) => {
      const a = d.querySelector('a');
      if (a) {
        a.className = i === 0 ? 'hero-btn hero-btn-primary' : 'hero-btn hero-btn-secondary';
        ctaContainer.append(a);
      }
      d.remove();
    });
    // Insert after subtitle
    if (subtitleDiv) subtitleDiv.after(ctaContainer);
  }

  // Build ratings container
  if (ratingDivs.length > 0) {
    const ratingsContainer = document.createElement('div');
    ratingsContainer.className = 'hero-ratings';

    const ratingsRow = document.createElement('div');
    ratingsRow.className = 'hero-ratings-row';

    ratingDivs.forEach((d) => {
      const p = d.querySelector('p');
      if (!p) return;
      const text = p.textContent.trim();
      const match = text.match(/(SALES|SERVICE):\s*([\d.]+)/);
      if (!match) return;

      const label = match[1];
      const score = match[2];

      // Each rating: block container with float:left (like original)
      const ratingEl = document.createElement('div');
      ratingEl.className = 'hero-rating';

      // Title on its own line (block h3)
      const labelEl = document.createElement('h3');
      labelEl.className = 'hero-rating-label';
      labelEl.textContent = label;

      // Stars row: floated star spans + inline score
      const starsRow = document.createElement('div');
      starsRow.className = 'hero-stars-row';
      const fullStars = Math.floor(parseFloat(score));
      for (let s = 0; s < 5; s++) {
        const star = document.createElement('span');
        star.className = s < fullStars ? 'star star-full' : 'star star-empty';
        starsRow.append(star);
      }

      const scoreEl = document.createElement('span');
      scoreEl.className = 'hero-rating-score';
      scoreEl.textContent = score;
      starsRow.append(scoreEl);

      ratingEl.append(labelEl, starsRow);
      ratingsRow.append(ratingEl);
      d.remove();
    });

    ratingsContainer.append(ratingsRow);

    // Add review link
    if (reviewDiv) {
      const a = reviewDiv.querySelector('a');
      if (a) {
        a.className = 'hero-reviews-link';
        ratingsContainer.append(a);
      }
      reviewDiv.remove();
    }

    contentRow.append(ratingsContainer);
  }
}
