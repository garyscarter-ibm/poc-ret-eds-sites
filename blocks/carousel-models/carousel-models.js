// Model-specific showcase background colors (matched from original site)
const MODEL_COLORS = {
  'mini cooper electric': { bg: '#2D46DF', light: false },
  'mini countryman electric': { bg: '#1B6B4A', light: false },
  'mini aceman': { bg: '#F06A00', light: true },
  'mini john cooper works': { bg: '#B71C2A', light: false },
  'mini cooper convertible': { bg: '#7DD4E8', light: true },
  'mini cooper 5-door': { bg: '#3648DF', light: false },
  'mini cooper': { bg: '#2DD4A8', light: true },
  'mini countryman': { bg: '#1B6B4A', light: false },
};

function getModelColor(name) {
  const key = name.toLowerCase().trim();
  return MODEL_COLORS[key] || { bg: '#2D46DF', light: false };
}

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  // Parse model data from rows
  const models = rows.map((row) => {
    const cols = [...row.children];
    const nameCol = cols[0];
    const contentCol = cols[1];
    const name = nameCol?.textContent?.trim() || '';
    const img = contentCol?.querySelector('img');
    const tagline = contentCol?.querySelector('h3')?.textContent?.trim() || '';
    const links = [...(contentCol?.querySelectorAll('a') || [])].map((a) => ({
      text: a.textContent.trim(),
      href: a.getAttribute('href') || '#',
    }));
    return { name, img, tagline, links };
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
  thumbTrack.className = 'carousel-models-thumbs';

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
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-models-strip-prev';
  prevBtn.setAttribute('aria-label', 'Previous models');
  prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-models-strip-next';
  nextBtn.setAttribute('aria-label', 'Next models');
  nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>';

  strip.append(prevBtn, thumbTrack, nextBtn);
  block.append(strip);

  // Slide transition state
  let activeIndex = -1;
  let isAnimating = false;

  function setActive(idx) {
    if (idx === activeIndex || isAnimating) return;
    const model = models[idx];
    if (!model) return;

    const color = getModelColor(model.name);
    showcase.style.backgroundColor = color.bg;
    showcase.classList.toggle('light-bg', color.light);

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
    const direction = idx > prevIndex ? 1 : -1;

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

  // Strip scroll
  function getScrollAmount() {
    if (thumbs.length === 0) return 200;
    return thumbs[0].offsetWidth + 16;
  }

  prevBtn.addEventListener('click', () => {
    thumbTrack.scrollBy({ left: -getScrollAmount() * 2, behavior: 'smooth' });
  });

  nextBtn.addEventListener('click', () => {
    thumbTrack.scrollBy({ left: getScrollAmount() * 2, behavior: 'smooth' });
  });

  // Init first model
  setActive(0);
}
