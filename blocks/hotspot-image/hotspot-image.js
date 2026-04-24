/**
 * Hotspot Image Block
 *
 * CMS content structure (each row after the first is a hotspot):
 *   Row 0: | image |
 *   Row N: | x% | y% | title | description (may have <a> placeholders) | detail-image (opt) |
 *
 * Zero external dependencies — fully self-contained.
 */

export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  /* ── 1. Parse content ─────────────────────────────────── */

  // Row 0 = hero image
  const picture = rows[0]?.querySelector('picture');
  const heroImg = rows[0]?.querySelector('img');

  // Remaining rows = hotspot data
  const hotspots = [];
  for (let i = 1; i < rows.length; i += 1) {
    const cols = [...rows[i].children];
    if (cols.length < 3) continue; // eslint-disable-line no-continue
    hotspots.push({
      x: parseFloat(cols[0]?.textContent?.trim()) || 0,
      y: parseFloat(cols[1]?.textContent?.trim()) || 0,
      title: cols[2]?.textContent?.trim() || '',
      desc: cols[3]?.textContent?.trim() || '',
      img:
        cols[4]?.querySelector('picture')?.cloneNode(true)
        || cols[4]?.querySelector('img')?.cloneNode(true)
        || null,
    });
  }

  if (!hotspots.length) return;

  /* ── 2. Build DOM ──────────────────────────────────────── */

  // Wipe the authored markup (removes any <a href="/"> placeholders)
  block.textContent = '';

  // Image wrapper
  const wrap = document.createElement('div');
  wrap.className = 'hotspot-image-stage';
  if (picture) {
    wrap.append(picture);
  } else if (heroImg) {
    wrap.append(heroImg);
  }

  // Dots
  hotspots.forEach((hs, idx) => {
    const dot = document.createElement('span');
    dot.className = 'hotspot-dot';
    dot.dataset.index = idx;
    dot.setAttribute('role', 'button');
    dot.setAttribute('tabindex', '0');
    dot.setAttribute('aria-label', hs.title);
    dot.style.left = `${hs.x}%`;
    dot.style.top = `${hs.y}%`;
    dot.innerHTML = '<span class="hotspot-pulse"></span>';
    wrap.append(dot);
  });

  block.append(wrap);

  // Modal must be on document.body (not inside the block) because
  // brochure-theme.css applies transform to .section ancestors,
  // which breaks position:fixed inside them.
  const modal = document.createElement('div');
  modal.className = 'hotspot-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.hidden = true;
  modal.innerHTML = `
    <div class="hotspot-modal-backdrop"></div>
    <div class="hotspot-modal-chrome">
      <button class="hotspot-modal-close" aria-label="Close" type="button">
        <svg width="20" height="20" viewBox="0 0 20 20"><path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
      <button class="hotspot-modal-prev" aria-label="Previous" type="button">
        <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>
      </button>
      <div class="hotspot-modal-card">
        <div class="hotspot-modal-text">
          <h3 class="hotspot-modal-title"></h3>
          <p class="hotspot-modal-desc"></p>
        </div>
        <div class="hotspot-modal-image"></div>
      </div>
      <button class="hotspot-modal-next" aria-label="Next" type="button">
        <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg>
      </button>
    </div>`;
  block.append(modal);

  // Refs
  const backdrop = modal.querySelector('.hotspot-modal-backdrop');
  const closeBtn = modal.querySelector('.hotspot-modal-close');
  const prevBtn = modal.querySelector('.hotspot-modal-prev');
  const nextBtn = modal.querySelector('.hotspot-modal-next');
  const titleEl = modal.querySelector('.hotspot-modal-title');
  const descEl = modal.querySelector('.hotspot-modal-desc');
  const imgBox = modal.querySelector('.hotspot-modal-image');

  /* ── 3. Modal logic ────────────────────────────────────── */

  let current = -1;
  let returnFocus = null;

  function show(idx) {
    const hs = hotspots[idx];
    if (!hs) return;
    current = idx;
    titleEl.textContent = hs.title;
    descEl.textContent = hs.desc;
    imgBox.innerHTML = '';
    if (hs.img) imgBox.append(hs.img.cloneNode(true));
    imgBox.hidden = !hs.img;
    modal.setAttribute('aria-label', hs.title);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function hide() {
    modal.hidden = true;
    current = -1;
    document.body.style.overflow = '';
    if (returnFocus) {
      returnFocus.focus();
      returnFocus = null;
    }
  }

  function step(dir) {
    if (current < 0) return;
    show((current + dir + hotspots.length) % hotspots.length);
  }

  /* ── 4. Event listeners ────────────────────────────────── */

  // Dot clicks (delegated on the stage wrapper)
  wrap.addEventListener('click', (e) => {
    const dot = e.target.closest('.hotspot-dot');
    if (!dot) return;
    e.preventDefault();
    e.stopPropagation();
    returnFocus = dot;
    show(Number(dot.dataset.index));
  });

  // Dot keyboard
  wrap.addEventListener('keydown', (e) => {
    const dot = e.target.closest('.hotspot-dot');
    if (!dot) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      returnFocus = dot;
      show(Number(dot.dataset.index));
    }
  });

  // Modal controls
  closeBtn.addEventListener('click', hide);
  backdrop.addEventListener('click', hide);
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  // Keyboard nav inside modal
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hide();
      return;
    }
    if (e.key === 'ArrowLeft') {
      step(-1);
      return;
    }
    if (e.key === 'ArrowRight') {
      step(1);
      return;
    }
    // Trap focus
    if (e.key === 'Tab') {
      const focusable = [...modal.querySelectorAll('button:not([hidden])')];
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
  });
  document.body.append(modal);
}
