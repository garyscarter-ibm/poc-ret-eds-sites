function createStarRating(rating = 5.0) {
  const container = document.createElement('div');
  container.className = 'columns-feature-star-rating';
  const fullStars = Math.floor(rating);
  for (let i = 0; i < 5; i += 1) {
    const star = document.createElement('span');
    star.className = `columns-feature-star${i < fullStars ? ' active' : ''}`;
    star.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z"/></svg>';
    container.append(star);
  }
  const num = document.createElement('span');
  num.className = 'columns-feature-rating-number';
  num.textContent = rating.toFixed(1);
  container.append(num);
  return container;
}

/**
 * Build the MINI teaser-overlap layout:
 * - Black backdrop div (50% width, full height)
 * - Image positioned absolutely, overlapping past the backdrop
 * - Text on the opposite side with z-index above
 *
 * @param {Element} row - The row element containing image and text columns
 * @param {boolean} imageRight - If true, image goes on right (mirrored layout)
 */
function buildOverlapLayout(row, imageRight = false) {
  const cols = [...row.children];
  const imgCol = cols.find((c) => c.querySelector('img'));
  const textCol = cols.find((c) => !c.querySelector('img'));
  if (!imgCol || !textCol) return;

  // Clear row and rebuild
  row.innerHTML = '';
  row.classList.add('teaser-overlap');
  if (imageRight) row.classList.add('teaser-overlap-alt');

  // Black backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'teaser-overlap-backdrop';
  row.append(backdrop);

  // Image container — holds the picture/img
  const imageWrap = document.createElement('div');
  imageWrap.className = 'teaser-overlap-image';
  const picture = imgCol.querySelector('picture');
  if (picture) imageWrap.append(picture);
  row.append(imageWrap);

  // Text container
  textCol.classList.add('teaser-overlap-text');
  textCol.classList.remove('columns-feature-text');
  row.append(textCol);
}

export default function decorate(block) {
  const isMini = block.classList.contains('mini');
  const isWelcome = block.classList.contains('welcome');

  const rows = [...block.children];
  rows.forEach((row, i) => {
    const cols = [...row.children];
    const imgCol = cols.find((c) => c.querySelector('img'));
    const textCol = cols.find((c) => !c.querySelector('img'));

    // MINI variants: use overlap layout
    if (isMini) {
      // Welcome variant: text left, image right (mirrored)
      // Non-welcome: image left, text right (default)
      // Odd rows alternate
      const imageRight = isWelcome ? !!(i % 2 === 0) : !!(i % 2 !== 0);
      buildOverlapLayout(row, imageRight);
    } else {
      // BMW: standard side-by-side layout
      if (imgCol) imgCol.classList.add('columns-feature-image');
      if (textCol) textCol.classList.add('columns-feature-text');
      if (i % 2 !== 0) row.classList.add('columns-feature-alt');
    }
  });

  const chevronVariant = isMini ? 'cta-chevron--black' : 'cta-chevron--blue';
  block.querySelectorAll('a').forEach((a) => {
    a.classList.add('cta-chevron', chevronVariant);
  });

  // Inject star rating for SERVICE RATING / SALES RATING sections
  const heading = block.querySelector('h3, h5');
  if (heading) {
    const text = heading.textContent.trim().toUpperCase();
    if (text.includes('SERVICE RATING') || text.includes('SALES RATING')) {
      const desc = heading.nextElementSibling;
      const insertBefore = desc?.tagName === 'P' && !desc.querySelector('a') ? desc.nextElementSibling : desc;
      if (insertBefore) {
        insertBefore.parentNode.insertBefore(createStarRating(5.0), insertBefore);
      }
    }
  }
}
