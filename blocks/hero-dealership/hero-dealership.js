import {
  buildStarRating,
  classifyHeadings,
  findRatingDivs,
} from '../../scripts/block-utils.js';

export default function decorate(block) {
  const isMini = block.classList.contains('mini');
  if (window.location.pathname.startsWith('/about-us')) {
    block.classList.add('short');
  }

  const contentRow = block.children[1];
  if (!contentRow) return;

  const children = [...contentRow.children];

  const firstChild = children[0];
  if (firstChild) {
    const p = firstChild.querySelector('p');
    const h = firstChild.querySelector('h1, h2, h3, h4, h5, h6');
    if (p && !h && p.textContent.trim().length < 30) {
      p.classList.add('hero-dealership-welcome');
    }
  }

  const { subtitleDiv } = classifyHeadings(children, {
    titleClass: 'hero-dealership-title',
    subtitleClass: 'hero-dealership-subtitle',
  });

  const ratingDivs = findRatingDivs(children);
  const headingDivs = children.filter((d) => d.querySelector('h1, h2, h3, h4, h5, h6'));

  const linkDivs = children.filter((d) => {
    if (headingDivs.includes(d)) return false;
    if (ratingDivs.includes(d)) return false;
    return d.querySelector('a');
  });

  // Last link div goes with the ratings; earlier ones are CTAs
  const trailingLinkDiv = ratingDivs.length > 0 ? linkDivs.pop() : null;
  const ctaDivs = linkDivs;

  if (ctaDivs.length > 0) {
    const ctaContainer = document.createElement('div');
    ctaContainer.className = 'hero-dealership-ctas';
    ctaDivs.forEach((d, i) => {
      const a = d.querySelector('a');
      if (a) {
        let variant = 'hero-dealership-btn-secondary';
        if (!isMini && i === 0) variant = 'hero-dealership-btn-primary';
        a.className = `hero-dealership-btn ${variant}`;
        ctaContainer.append(a);
      }
      d.remove();
    });
    if (subtitleDiv) subtitleDiv.after(ctaContainer);
  }

  if (ratingDivs.length > 0) {
    const ratingsContainer = document.createElement('div');
    ratingsContainer.className = 'hero-dealership-ratings';
    const ratingsRow = document.createElement('div');
    ratingsRow.className = 'hero-dealership-ratings-row';

    ratingDivs.forEach((d) => {
      const text = d.textContent.trim();
      const rating = buildStarRating(text, {
        labelClass: 'hero-dealership-rating-label',
        starsRowClass: 'hero-dealership-stars-row star-rating',
        scoreClass: 'hero-dealership-rating-score',
        containerClass: 'hero-dealership-rating',
      });
      if (rating) {
        ratingsRow.append(rating.container);
        d.remove();
      }
    });

    ratingsContainer.append(ratingsRow);

    if (trailingLinkDiv) {
      const a = trailingLinkDiv.querySelector('a');
      if (a) {
        a.className = 'hero-dealership-reviews-link cta-chevron cta-chevron--white';
        ratingsContainer.append(a);
      }
      trailingLinkDiv.remove();
    }

    contentRow.append(ratingsContainer);
  }

  if (isMini) {
    const frame = document.createElement('div');
    frame.className = 'hero-dealership-frame';
    frame.innerHTML = '<span class="frame-top"></span><span class="frame-right"></span><span class="frame-bottom"></span><span class="frame-left"></span>';
    block.append(frame);
  }
}
