export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'text-media-layout';

  // Detect which row/col has the image vs text content
  let imageEl = null;
  let textEl = null;

  rows.forEach((row) => {
    const cols = [...row.children];
    cols.forEach((col) => {
      if (!imageEl && col.querySelector('img')) {
        imageEl = col;
      } else if (!textEl && (col.querySelector('h3') || col.querySelector('p'))) {
        textEl = col;
      }
    });
  });

  // If only text (no image), render as centered text block
  if (!imageEl && textEl) {
    const textCol = document.createElement('div');
    textCol.className = 'text-media-text-only animate-child';
    textCol.append(...textEl.childNodes);
    wrapper.append(textCol);
    wrapper.className = 'text-media-text-center';
    block.textContent = '';
    block.append(wrapper);
    return;
  }

  // Image column
  if (imageEl) {
    const imageCol = document.createElement('div');
    imageCol.className = 'text-media-image animate-child';
    const img = imageEl.querySelector('img');
    if (img) {
      img.loading = 'lazy';
      imageCol.append(img);
    }
    wrapper.append(imageCol);
  }

  // Text column
  if (textEl) {
    const textCol = document.createElement('div');
    textCol.className = 'text-media-content animate-child';

    // Add separator before heading
    const h3 = textEl.querySelector('h3');
    if (h3) {
      const hr = document.createElement('hr');
      textCol.append(hr);
    }

    [...textEl.childNodes].forEach((node) => {
      if (node.nodeType === 1 || node.nodeType === 3) {
        textCol.append(node.cloneNode ? node.cloneNode(true) : node);
      }
    });

    // Remove any stale link wrappers
    textCol.querySelectorAll('a[href="/"]').forEach((a) => {
      const parent = a.closest('div');
      if (parent && !parent.querySelector('h3, p, img')) parent.remove();
    });

    wrapper.append(textCol);
  }

  // Determine layout order — alternate sides across sibling text-media blocks
  const blockWrapper = block.closest('.text-media-wrapper');
  const section = blockWrapper?.parentElement;
  if (section) {
    const siblingBlocks = [...section.querySelectorAll('.text-media')];
    const blockIndex = siblingBlocks.indexOf(block);
    // Even-indexed blocks get reversed (text left, image right) matching original site
    if (blockIndex % 2 === 0) {
      wrapper.classList.add('reversed');
    }
  } else {
    // Fallback: check source order
    const firstRow = rows[0];
    const firstCol = firstRow?.children[0];
    const isReversed = firstCol && (firstCol.querySelector('h3') || firstCol.querySelector('p')) && !firstCol.querySelector('img');
    if (isReversed) {
      wrapper.classList.add('reversed');
    }
  }

  block.textContent = '';
  block.append(wrapper);
}
