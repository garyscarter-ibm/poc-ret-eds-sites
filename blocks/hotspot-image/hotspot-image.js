import { createCarouselButton } from '../../scripts/block-utils.js';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function parseHotspots(rows) {
  const hotspots = [];
  for (let i = 1; i < rows.length; i += 1) {
    const cols = [...rows[i].children];
    if (cols.length >= 3) {
      const x = parseFloat(cols[0]?.textContent?.trim()) || 0;
      const y = parseFloat(cols[1]?.textContent?.trim()) || 0;
      const title = cols[2]?.textContent?.trim() || '';
      const description = cols[3]?.textContent?.trim() || '';
      const detailImg = cols[4]?.querySelector('img') || null;
      hotspots.push({
        x, y, title, description, detailImg,
      });
    }
  }
  return hotspots;
}

function buildModal() {
  const modal = document.createElement('div');
  modal.className = 'hotspot-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const backdrop = document.createElement('div');
  backdrop.className = 'hotspot-modal-backdrop';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'hotspot-modal-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  const card = document.createElement('div');
  card.className = 'hotspot-modal-card';

  const textCol = document.createElement('div');
  textCol.className = 'hotspot-modal-text';

  const titleEl = document.createElement('h3');
  titleEl.className = 'hotspot-modal-title';

  const descEl = document.createElement('p');
  descEl.className = 'hotspot-modal-description';

  textCol.append(titleEl, descEl);

  const imageCol = document.createElement('div');
  imageCol.className = 'hotspot-modal-image';

  card.append(textCol, imageCol);

  const prevBtn = createCarouselButton('prev', { classPrefix: 'hotspot-modal', ariaPrefix: 'hotspot' });
  const nextBtn = createCarouselButton('next', { classPrefix: 'hotspot-modal', ariaPrefix: 'hotspot' });

  modal.append(backdrop, closeBtn, prevBtn, card, nextBtn);

  return {
    modal, backdrop, closeBtn, card, titleEl, descEl, imageCol, prevBtn, nextBtn,
  };
}

function populateModal(parts, hotspot) {
  const { titleEl, descEl, imageCol } = parts;
  titleEl.textContent = hotspot.title;
  descEl.textContent = hotspot.description;
  imageCol.innerHTML = '';

  if (hotspot.detailImg) {
    const img = hotspot.detailImg.cloneNode(true);
    img.loading = 'lazy';
    imageCol.append(img);
    imageCol.hidden = false;
  } else {
    imageCol.hidden = true;
  }
}

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // First row = main image
  const mainImg = rows[0]?.querySelector('img');
  const hotspots = parseHotspots(rows);
  if (!hotspots.length) return;

  // Build image container
  const imageContainer = document.createElement('div');
  imageContainer.className = 'hotspot-image-container';

  if (mainImg) {
    mainImg.loading = 'lazy';
    imageContainer.append(mainImg);
  }

  // Build modal
  const parts = buildModal();
  let activeIndex = -1;
  let previousFocus = null;

  function trapFocus(e) {
    if (parts.modal.hidden) return;
    const focusable = [...parts.modal.querySelectorAll(FOCUSABLE)];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openModal(index) {
    activeIndex = index;
    previousFocus = document.activeElement;
    populateModal(parts, hotspots[index]);
    parts.modal.setAttribute('aria-label', hotspots[index].title);
    parts.modal.hidden = false;
    document.body.style.overflow = 'hidden';

    // Update dot active states
    imageContainer.querySelectorAll('.hotspot-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });

    parts.closeBtn.focus();
  }

  function closeModal() {
    parts.modal.hidden = true;
    activeIndex = -1;
    document.body.style.overflow = '';
    imageContainer.querySelectorAll('.hotspot-dot.active').forEach((d) => d.classList.remove('active'));
    if (previousFocus) {
      previousFocus.focus();
      previousFocus = null;
    }
  }

  function navigate(direction) {
    if (activeIndex < 0) return;
    const next = (activeIndex + direction + hotspots.length) % hotspots.length;
    openModal(next);
  }

  // Wire modal events
  parts.closeBtn.addEventListener('click', closeModal);
  parts.backdrop.addEventListener('click', closeModal);
  parts.prevBtn.addEventListener('click', () => navigate(-1));
  parts.nextBtn.addEventListener('click', () => navigate(1));

  document.addEventListener('keydown', (e) => {
    if (parts.modal.hidden) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') trapFocus(e);
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Create hotspot dots
  hotspots.forEach((hs, i) => {
    const dot = document.createElement('button');
    dot.className = 'hotspot-dot';
    dot.setAttribute('aria-label', hs.title);
    dot.style.left = `${hs.x}%`;
    dot.style.top = `${hs.y}%`;
    dot.innerHTML = '<span class="hotspot-dot-ring"></span>';

    dot.addEventListener('click', () => openModal(i));
    imageContainer.append(dot);
  });

  // Assemble
  block.textContent = '';
  block.append(imageContainer, parts.modal);
}
