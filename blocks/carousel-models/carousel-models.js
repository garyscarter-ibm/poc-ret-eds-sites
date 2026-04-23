import { createCarouselButton } from '../../scripts/block-utils.js';

const DEFAULT_BG = '#2D46DF';

/**
 * Parse a color column value into bg color and light/dark mode.
 * Accepts: "#2D46DF", "#2D46DF light", "light #7DD4E8", or just "light" (uses default).
 */
function parseColorValue(text) {
  const value = (text || '').trim().toLowerCase();
  if (!value) return { bg: DEFAULT_BG, light: false };

  const isLight = value.includes('light');
  const colorMatch = value.match(/#[0-9a-f]{3,8}/i);
  const bg = colorMatch ? colorMatch[0] : DEFAULT_BG;
  return { bg, light: isLight };
}

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Parse model data from rows
  // Row structure: [name | content (image, tagline, links) | optional: bg color]
  const models = rows.map((row) => {
    const cols = [...row.children];
    const nameCol = cols[0];
    const contentCol = cols[1];
    const colorCol = cols[2];
    const name = nameCol?.textContent?.trim() || '';
    const img = contentCol?.querySelector('img');
    const tagline = contentCol?.querySelector('h3')?.textContent?.trim() || '';
    const links = [...(contentCol?.querySelectorAll('a') || [])].map((a) => ({
      text: a.textContent.trim(),
      href: a.getAttribute('href') || '#',
    }));
    const color = parseColorValue(colorCol?.textContent);
    return {
      name, img, tagline, links, color,
    };
  });

  // Clear block
  rows.forEach((r) => r.remove());

  // Showcase panel with slide viewport
  const showcase = document.createElement('div');
  showcase.className = 'carousel-models-showcase';

  const viewport = document.createElement('div');
  viewport.className = 'carousel-models-viewport';

  // Pre-build all slides
  const slides = models.map((model, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-models-slide';
    slide.dataset.index = i;

    const taglineEl = document.createElement('p');
    taglineEl.className = 'carousel-models-tagline';
    taglineEl.textContent = model.tagline;

    const nameEl = document.createElement('h3');
    nameEl.className = 'carousel-models-name';
    nameEl.textContent = `${model.name}.`;

    const imgWrap = document.createElement('div');
    imgWrap.className = 'carousel-models-image';
    if (model.img) {
      const img = model.img.cloneNode(true);
      imgWrap.append(img);
    }

    const ctaWrap = document.createElement('div');
    ctaWrap.className = 'carousel-models-ctas';
    model.links.forEach((link) => {
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.text;
      a.className = 'carousel-models-cta';
      ctaWrap.append(a);
    });

    slide.append(taglineEl, nameEl, imgWrap, ctaWrap);
    viewport.append(slide);
    return slide;
  });

  showcase.append(viewport);
  block.append(showcase);

  // Thumbnail strip
  const strip = document.createElement('div');
  strip.className = 'carousel-models-strip';

  const thumbTrack = document.createElement('div');
  thumbTrack.className = 'carousel-models-thumbs scroll-hidden';

  const thumbs = models.map((model, i) => {
    const thumb = document.createElement('button');
    thumb.className = `carousel-models-thumb${i === 0 ? ' active' : ''}`;
    thumb.dataset.index = i;

    if (model.img) {
      const thumbImg = model.img.cloneNode(true);
      thumb.append(thumbImg);
    }

    const thumbName = document.createElement('span');
    thumbName.className = 'carousel-models-thumb-name';
    thumbName.textContent = model.name;
    thumb.append(thumbName);

    thumbTrack.append(thumb);
    return thumb;
  });

  // Prev/next for thumbnail strip
  const prevBtn = createCarouselButton('prev', { classPrefix: 'carousel-models-strip', ariaPrefix: 'models' });
  const nextBtn = createCarouselButton('next', { classPrefix: 'carousel-models-strip', ariaPrefix: 'models' });

  strip.append(prevBtn, thumbTrack, nextBtn);
  block.append(strip);

  // Slide transition state
  let activeIndex = -1;
  let isAnimating = false;
  let navDirection = 1; // 1 = forward/right, -1 = backward/left

  function setActive(idx, forceDir) {
    if (idx === activeIndex || isAnimating) return;
    const model = models[idx];
    if (!model) return;

    showcase.style.backgroundColor = model.color.bg;
    showcase.classList.toggle('light-bg', model.color.light);

    const prevIndex = activeIndex;
    activeIndex = idx;

    // Update thumbnail active state
    thumbs.forEach((t, i) => t.classList.toggle('active', i === idx));

    const incoming = slides[idx];

    if (prevIndex < 0) {
      // First load — no animation
      incoming.classList.add('active');
      return;
    }

    const outgoing = slides[prevIndex];
    // Use explicit direction if provided, otherwise infer
    const direction = forceDir || navDirection;

    isAnimating = true;

    // Lock viewport height to prevent layout jump during transition
    viewport.style.height = `${viewport.offsetHeight}px`;

    // Disable transitions on both slides during setup
    outgoing.style.transition = 'none';
    incoming.style.transition = 'none';

    // Make outgoing absolute so it no longer drives layout height
    outgoing.style.position = 'absolute';

    // Position incoming slide off-screen in the direction of travel
    incoming.style.transform = `translateX(${direction * 100}%)`;
    incoming.classList.add('active');

    // Force single reflow so all setup changes register
    // eslint-disable-next-line no-unused-expressions
    incoming.offsetWidth;

    // Update locked height to match the incoming slide
    viewport.style.height = `${incoming.offsetHeight}px`;

    // Re-enable transitions and animate both slides simultaneously
    outgoing.style.transition = '';
    incoming.style.transition = '';
    incoming.style.transform = 'translateX(0)';
    outgoing.style.transform = `translateX(${-direction * 100}%)`;

    // Clean up after transition
    outgoing.addEventListener('transitionend', function handler(e) {
      if (e.propertyName !== 'transform') return;
      outgoing.removeEventListener('transitionend', handler);
      // Disable transition before cleanup to prevent ghost animation
      // (CSS defaults include translateX(100%) which would animate back across)
      outgoing.style.transition = 'none';
      outgoing.classList.remove('active');
      outgoing.style.transform = '';
      outgoing.style.position = '';
      // Force reflow so the snap happens, then clear inline transition
      // eslint-disable-next-line no-unused-expressions
      outgoing.offsetWidth;
      outgoing.style.transition = '';
      viewport.style.height = '';
      isAnimating = false;
    }, { once: false });
  }

  // Thumb click
  thumbTrack.addEventListener('click', (e) => {
    const thumb = e.target.closest('.carousel-models-thumb');
    if (!thumb) return;
    setActive(parseInt(thumb.dataset.index, 10));
  });

  // === Infinite wheel thumbnail strip ===
  const count = models.length;

  // Disable native scroll — we'll position via CSS transforms
  thumbTrack.style.overflow = 'hidden';
  thumbTrack.style.position = 'relative';

  // Measure thumb dimensions after layout
  let thumbWidth = 0;
  let gap = 16;
  let offset = 0; // current pixel offset of the wheel

  function measure() {
    if (thumbs.length === 0) return;
    thumbWidth = thumbs[0].offsetWidth;
    gap = parseFloat(
      window.getComputedStyle(thumbTrack).gap,
    ) || 16;
  }

  // Position all thumbs in a ring based on current offset
  let animateLayout = false;
  const prevPositions = new Map();

  function layout() {
    const trackW = thumbTrack.offsetWidth;
    const step = thumbWidth + gap;
    const totalW = step * count;
    const centreX = trackW / 2;

    thumbs.forEach((t, i) => {
      let x = (i * step) - offset;
      x = ((x % totalW) + totalW) % totalW;
      if (x > totalW / 2) x -= totalW;
      const finalX = centreX + x - (thumbWidth / 2);

      // Detect wrapping: moved more than half the total ring width
      const prev = prevPositions.get(i);
      const wrapped = prev !== undefined
        && Math.abs(finalX - prev) > totalW * 0.4;

      /* eslint-disable no-param-reassign */
      t.style.position = 'absolute';
      t.style.left = '0';
      t.style.top = '0';

      if (animateLayout && wrapped) {
        // Hide, snap to new position, then fade back in
        t.style.transition = 'none';
        t.style.opacity = '0';
        t.style.transform = `translateX(${finalX}px)`;
        setTimeout(() => {
          t.style.transition = 'opacity 0.15s ease';
          t.style.opacity = '1';
        }, 350);
      } else {
        t.style.opacity = '1';
        t.style.transition = animateLayout
          ? 'transform 0.35s ease'
          : 'none';
        t.style.transform = `translateX(${finalX}px)`;
      }
      /* eslint-enable no-param-reassign */

      prevPositions.set(i, finalX);
    });
  }

  function goTo(idx, dir) {
    const step = thumbWidth + gap;
    offset = idx * step;
    navDirection = dir || 1;
    animateLayout = true;
    setActive(idx, dir);
    thumbs.forEach((t, i) => {
      t.classList.toggle('active', i === idx);
    });
    layout();
  }

  // Looping prev/next — always continues in same direction
  prevBtn.addEventListener('click', () => {
    const next = (activeIndex - 1 + count) % count;
    goTo(next, -1);
  });

  nextBtn.addEventListener('click', () => {
    const next = (activeIndex + 1) % count;
    goTo(next, 1);
  });

  // Thumb click
  thumbTrack.addEventListener('click', (e) => {
    const thumb = e.target.closest('.carousel-models-thumb');
    if (!thumb) return;
    const idx = parseInt(thumb.dataset.index, 10);
    goTo(idx);
  });

  // Set track height to tallest thumb so underline is never clipped
  function setTrackHeight() {
    if (thumbs.length === 0) return;
    let maxH = 0;
    thumbs.forEach((t) => {
      if (t.offsetHeight > maxH) maxH = t.offsetHeight;
    });
    // Make all thumbs the same height so borders align
    thumbs.forEach((t) => {
      /* eslint-disable no-param-reassign */
      t.style.height = `${maxH}px`;
      /* eslint-enable no-param-reassign */
    });
    // Add 4px for the active border-bottom to be visible
    thumbTrack.style.height = `${maxH + 4}px`;
  }

  // Resize — no animation
  window.addEventListener('resize', () => {
    animateLayout = false;
    measure();
    setTrackHeight();
    layout();
  });

  // Init
  setActive(0);

  function initLayout() {
    measure();
    if (thumbWidth === 0) return false;
    setTrackHeight();
    goTo(0);
    return true;
  }

  // Try immediately
  requestAnimationFrame(() => {
    if (!initLayout()) {
      // Retry when carousel scrolls into view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              initLayout();
              observer.disconnect();
            });
          }
        });
      });
      observer.observe(strip);
      // Also retry on timeouts as fallback
      setTimeout(initLayout, 500);
      setTimeout(initLayout, 1000);
    }
  });
}
