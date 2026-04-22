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
  const isMotorrad = block.classList.contains('motorrad');

  // Motorrad content has image and text as separate rows (1 col each)
  // instead of 2 columns in a single row. Merge them into proper
  // 2-column rows: [image-col, text-col].
  if (isMotorrad) {
    const rows = [...block.children];
    for (let i = 0; i < rows.length - 1; i += 1) {
      const row = rows[i];
      const nextRow = rows[i + 1];
      const rowHasImg = row.querySelector('img') && !row.querySelector('h3, h5');
      const nextHasText = nextRow.querySelector('h3, h5') && !nextRow.querySelector('img');
      if (rowHasImg && nextHasText) {
        // Wrap all text children in a single column div
        const textCol = document.createElement('div');
        while (nextRow.firstChild) textCol.appendChild(nextRow.firstChild);
        row.appendChild(textCol);
        nextRow.remove();
        rows.splice(i + 1, 1);
      }
    }
  }

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
      // BMW / Motorrad: standard side-by-side layout
      if (imgCol) imgCol.classList.add('columns-feature-image');
      if (textCol) textCol.classList.add('columns-feature-text');

      // Detect quote panel: small circular image + name/title in text col (BMW only)
      const img = imgCol?.querySelector('img');
      if (!isMotorrad && !isWelcome && img && textCol?.querySelector('h3') && textCol?.querySelector('p')) {
        row.classList.add('quote-panel');
        // Move name + title from text col to image col (next to photo)
        const h3 = textCol.querySelector('h3');
        const h4 = textCol.querySelector('h4');
        if (h3) imgCol.append(h3);
        if (h4) imgCol.append(h4);
      }

      // For motorrad, each block is a separate element so i is always 0.
      // Determine alternation from sibling block index within the section.
      // Welcome variants always keep image on the left (no alternation).
      let altIndex = i;
      if (isMotorrad && !isWelcome && rows.length === 1) {
        const wrapper = block.closest('.columns-feature-wrapper');
        const section = wrapper?.parentElement;
        if (section) {
          const siblingBlocks = [...section.querySelectorAll('.columns-feature.motorrad:not(.welcome)')];
          altIndex = siblingBlocks.indexOf(block);
        }
      }
      if (!isWelcome && altIndex % 2 !== 0) row.classList.add('columns-feature-alt');
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
