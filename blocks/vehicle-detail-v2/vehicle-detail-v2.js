import queryAPI from '../../scripts/used-cars-api.js';
import {
  formatPrice,
  formatMileage,
  formatDate,
  formatFuelType,
  formatTransmission,
  formatPower,
  formatMonthly,
  getUserId,
} from '../../scripts/used-cars-config.js';

/* ---------- GraphQL Queries ---------- */

const VEHICLE_QUERY = `query GetVehicle($id: ID!) {
  usedVehicle(id: $id) {
    id vin series model price bodyType fuelType transmission drivetrain
    colour upholstery mileage registrationDate registrationNumber
    power torque acceleration topSpeed
    co2Emissions mpgCombined mpgUrban mpgExtraUrban
    electricRange electricRangeCity energyConsumption
    insuranceGroup financeAvailable estimatedMonthlyPayment
    length width height weight bootVolume
    images { url alt order }
    standardFeatures optionalPacks
    dealer { id name address postcode phone latitude longitude }
  }
}`;

const SIMILAR_QUERY = `query SimilarVehicles($series: String!, $excludeId: ID!, $limit: Int) {
  usedVehicles(filter: { series: $series }, pagination: { limit: $limit }) {
    vehicles {
      id model price images { url alt order }
    }
  }
}`;

const GARAGE_ADD = `mutation AddToGarage($userId: String!, $vehicleId: ID!) {
  addToGarage(userId: $userId, vehicleId: $vehicleId)
}`;

const GARAGE_REMOVE = `mutation RemoveFromGarage($userId: String!, $vehicleId: ID!) {
  removeFromGarage(userId: $userId, vehicleId: $vehicleId)
}`;

const GARAGE_IDS = `query GarageIds($userId: String!) {
  garageVehicleIds(userId: $userId)
}`;

/* ---------- Colour Map ---------- */

const COLOUR_MAP = {
  'alpine white': '#f2f2f2',
  'mineral white': '#e8e8e4',
  'black sapphire': '#1c1f2a',
  'carbon black': '#222222',
  'jet black': '#0a0a0a',
  'sophisto grey': '#6b6e72',
  'mineral grey': '#5a5d61',
  'thunder grey': '#4a4d51',
  'brooklyn grey': '#7a7d81',
  'skyscraper grey': '#8e9196',
  'tanzanite blue': '#1d2951',
  'phytonic blue': '#2a4a6b',
  'portimao blue': '#2c5a8a',
  'san remo green': '#2d5c3f',
  'isle of man green': '#1e4d2b',
  'aventurine red': '#6b1d2a',
  'melbourne red': '#8b1a2a',
  'fire red': '#cc2222',
  'toronto red': '#a01020',
  'sunset orange': '#d4601a',
  'Individual frozen': '#c8ccd0',
};

function getAccentColour(colourName) {
  if (!colourName) return '#1b69d4';
  const key = colourName.toLowerCase();
  const match = Object.entries(COLOUR_MAP).find(([k]) => key.includes(k));
  return match ? match[1] : '#1b69d4';
}

function getAccentTextColour(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#262626' : '#ffffff';
}

/* ---------- Helpers ---------- */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

/* ---------- Icons ---------- */

const ICONS = {
  calendar:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  fuel: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 22V6a2 2 0 012-2h8a2 2 0 012 2v16"/><path d="M15 10h2a2 2 0 012 2v3a2 2 0 004 0V8l-4-4"/><rect x="5" y="10" width="6" height="4"/></svg>',
  mileage:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>',
  gearbox:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><path d="M6 8v10M18 8v4a2 2 0 01-2 2H8"/></svg>',
  engine:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 4v4m10-4v4M3 8h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/><path d="M7 12h4m2 0h4"/></svg>',
  registration:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h.01M10 12h8"/></svg>',
  exterior:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>',
  upholstery:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 18V8a4 4 0 014-4h8a4 4 0 014 4v10"/><path d="M4 14h16v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4z"/></svg>',
  location:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  phone:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
  chevronLeft:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18L9 12L15 6"/></svg>',
  chevronRight:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18L15 12L9 6"/></svg>',
  fullscreen:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>',
  heart:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  heartFilled:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="#1b69d4" stroke="#1b69d4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  share:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
};

/* ---------- Skeleton ---------- */

function renderSkeleton(block) {
  block.innerHTML = `
    <div class="vd2-skeleton">
      <div class="vd2-skeleton-gallery"><div class="vd2-skeleton-shimmer"></div></div>
      <div class="vd2-skeleton-body">
        <div class="vd2-skeleton-line vd2-skeleton-line--wide"></div>
        <div class="vd2-skeleton-line vd2-skeleton-line--medium"></div>
        <div class="vd2-skeleton-line vd2-skeleton-line--narrow"></div>
      </div>
    </div>`;
}

/* ---------- Error State ---------- */

function renderError(block, message) {
  block.innerHTML = `
    <div class="vd2-error">
      <h2>Vehicle not found</h2>
      <p>${message}</p>
      <a href="/used-cars/inventory" class="vd2-error-link">Back to search results</a>
    </div>`;
}

/* ---------- Gallery (Horizontal Accordion) ---------- */

function renderGallery(images, accentColour) {
  const sorted = [...images].sort((a, b) => a.order - b.order);
  const gallery = el('div', 'vd2-gallery');
  let current = 0;

  // All images in a single expanding/contracting row
  const track = el('div', 'vd2-gallery-track');
  track.setAttribute('tabindex', '0');

  sorted.forEach((img, i) => {
    const panel = el(
      'div',
      `vd2-gallery-panel${i === 0 ? ' vd2-panel--active' : ''}`,
    );
    panel.dataset.index = i;
    const imgEl = document.createElement('img');
    imgEl.src = i < 3 ? img.url : '';
    imgEl.dataset.src = img.url;
    imgEl.alt = img.alt
      || `${sorted[0].alt?.split(' - ')[0] || 'Vehicle'} - image ${i + 1}`;
    imgEl.loading = i === 0 ? 'eager' : 'lazy';
    imgEl.className = 'vd2-gallery-panel-img';

    panel.append(imgEl);

    // Overlay for collapsed panels
    const overlay = el('div', 'vd2-gallery-panel-overlay');
    panel.append(overlay);

    track.append(panel);
  });

  // Navigation arrows (on the track)
  const prevBtn = el('button', 'vd2-gallery-nav vd2-gallery-prev');
  prevBtn.innerHTML = ICONS.chevronLeft;
  prevBtn.setAttribute('aria-label', 'Previous image');
  const nextBtn = el('button', 'vd2-gallery-nav vd2-gallery-next');
  nextBtn.innerHTML = ICONS.chevronRight;
  nextBtn.setAttribute('aria-label', 'Next image');
  track.append(prevBtn, nextBtn);

  // Fullscreen button
  const fsBtn = el('button', 'vd2-gallery-fs');
  fsBtn.innerHTML = ICONS.fullscreen;
  fsBtn.setAttribute('aria-label', 'View fullscreen');
  track.append(fsBtn);

  gallery.append(track);

  // Fade edge on right
  gallery.append(el('div', 'vd2-gallery-fade'));

  // Dot pagination
  const dots = el('div', 'vd2-gallery-dots');
  sorted.forEach((_, i) => {
    const dot = el('button', i === 0 ? 'vd2-dot vd2-dot--active' : 'vd2-dot');
    dot.setAttribute('aria-label', `Image ${i + 1}`);
    dot.dataset.index = i;
    dots.append(dot);
  });
  gallery.append(dots);

  // Preload adjacent images
  function preloadNear(idx) {
    for (let offset = -1; offset <= 2; offset += 1) {
      const target = (idx + offset + sorted.length) % sorted.length;
      const panel = track.querySelectorAll('.vd2-gallery-panel')[target];
      const img = panel?.querySelector('img');
      if (img && !img.src && img.dataset.src) {
        img.src = img.dataset.src;
      }
    }
  }

  // Navigate — expand target panel, contract current
  function goTo(idx) {
    const next = (idx + sorted.length) % sorted.length;
    if (next === current) return;

    const panels = track.querySelectorAll('.vd2-gallery-panel');
    panels.forEach((p, i) => {
      p.classList.toggle('vd2-panel--active', i === next);
    });

    // Ensure target image is loaded
    const targetImg = panels[next].querySelector('img');
    if (!targetImg.src && targetImg.dataset.src) {
      targetImg.src = targetImg.dataset.src;
    }

    // Update dots
    dots.querySelectorAll('.vd2-dot').forEach((d, i) => {
      d.classList.toggle('vd2-dot--active', i === next);
    });

    current = next;
    preloadNear(next);
  }

  preloadNear(0);

  // Click panel to expand it
  track.addEventListener('click', (e) => {
    const panel = e.target.closest('.vd2-gallery-panel');
    if (panel && !e.target.closest('button')) {
      goTo(Number(panel.dataset.index));
    }
  });

  // Nav button events
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    goTo(current - 1);
  });
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    goTo(current + 1);
  });

  // Dot events
  dots.addEventListener('click', (e) => {
    const dot = e.target.closest('.vd2-dot');
    if (dot) goTo(Number(dot.dataset.index));
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchStartY = 0;
  let touchDeltaX = 0;
  let isSwiping = false;

  track.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDeltaX = 0;
      isSwiping = false;
    },
    { passive: true },
  );

  track.addEventListener(
    'touchmove',
    (e) => {
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;
      if (!isSwiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        isSwiping = true;
      }
      if (isSwiping) touchDeltaX = dx;
    },
    { passive: true },
  );

  track.addEventListener('touchend', () => {
    if (!isSwiping) return;
    const threshold = 50;
    if (touchDeltaX < -threshold) goTo(current + 1);
    else if (touchDeltaX > threshold) goTo(current - 1);
    isSwiping = false;
  });

  // Keyboard navigation
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      goTo(current - 1);
      e.preventDefault();
    }
    if (e.key === 'ArrowRight') {
      goTo(current + 1);
      e.preventDefault();
    }
  });

  // Fullscreen lightbox
  fsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const lightbox = el('div', 'vd2-lightbox');
    lightbox.innerHTML = `
      <button class="vd2-lightbox-close" aria-label="Close">✕</button>
      <div class="vd2-lightbox-counter"><span class="vd2-lb-current">${current + 1}</span> / ${sorted.length}</div>
      <img src="${sorted[current].url}" alt="${sorted[current].alt || ''}" />
      <button class="vd2-lightbox-prev" aria-label="Previous">${ICONS.chevronLeft}</button>
      <button class="vd2-lightbox-next" aria-label="Next">${ICONS.chevronRight}</button>`;
    document.body.append(lightbox);
    document.body.style.overflow = 'hidden';

    let lbIdx = current;
    const lbImg = lightbox.querySelector('img');
    const lbCounter = lightbox.querySelector('.vd2-lb-current');

    function lbGoTo(idx) {
      const n = (idx + sorted.length) % sorted.length;
      lbImg.style.opacity = '0';
      lbImg.style.transform = 'scale(0.95)';
      setTimeout(() => {
        lbImg.src = sorted[n].url;
        lbImg.alt = sorted[n].alt || '';
        lbImg.style.opacity = '1';
        lbImg.style.transform = 'scale(1)';
      }, 200);
      lbIdx = n;
      lbCounter.textContent = n + 1;
    }

    lightbox
      .querySelector('.vd2-lightbox-close')
      .addEventListener('click', () => {
        lightbox.remove();
        document.body.style.overflow = '';
      });
    lightbox
      .querySelector('.vd2-lightbox-prev')
      .addEventListener('click', () => lbGoTo(lbIdx - 1));
    lightbox
      .querySelector('.vd2-lightbox-next')
      .addEventListener('click', () => lbGoTo(lbIdx + 1));
    lightbox.addEventListener('click', (ev) => {
      if (ev.target === lightbox) {
        lightbox.remove();
        document.body.style.overflow = '';
      }
    });
    lightbox.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        lightbox.remove();
        document.body.style.overflow = '';
      }
      if (ev.key === 'ArrowLeft') lbGoTo(lbIdx - 1);
      if (ev.key === 'ArrowRight') lbGoTo(lbIdx + 1);
    });
    lightbox.setAttribute('tabindex', '0');
    lightbox.focus();
  });

  // Set accent colour on dots
  dots.style.setProperty('--vd2-accent', accentColour);

  // Size images after gallery is in DOM to avoid race condition
  requestAnimationFrame(() => {
    function sizeImage(imgEl) {
      if (!imgEl.naturalWidth || !track.offsetHeight) return;
      const trackH = track.offsetHeight;
      const trackW = track.offsetWidth;
      const ratio = imgEl.naturalWidth / imgEl.naturalHeight;
      const widthFromHeight = Math.round(trackH * ratio);
      const minNeeded = Math.round(trackW * 0.7);
      const fixedWidth = Math.max(widthFromHeight, minNeeded);
      imgEl.style.width = `${fixedWidth}px`;
      imgEl.style.height = `${Math.round(fixedWidth / ratio)}px`;
    }

    track.querySelectorAll('.vd2-gallery-panel-img').forEach((imgEl) => {
      if (imgEl.complete && imgEl.naturalWidth) {
        sizeImage(imgEl);
      } else {
        imgEl.addEventListener('load', () => sizeImage(imgEl), { once: true });
      }
    });
  });

  return gallery;
}

/* ---------- Key Facts (primary grid + secondary tags) ---------- */

function renderKeyFacts(vehicle) {
  const section = el('div', 'vd2-key-facts');

  const primaryItems = [
    {
      icon: ICONS.calendar,
      label: 'Registered',
      value: formatDate(vehicle.registrationDate),
    },
    {
      icon: ICONS.fuel,
      label: 'Fuel',
      value: formatFuelType(vehicle.fuelType),
    },
    {
      icon: ICONS.mileage,
      label: 'Mileage',
      value: formatMileage(vehicle.mileage),
    },
    {
      icon: ICONS.gearbox,
      label: 'Gearbox',
      value: formatTransmission(vehicle.transmission),
    },
  ];

  const secondaryItems = [
    { label: 'Engine Power', value: formatPower(vehicle.power) },
    { label: 'Registration', value: vehicle.registrationNumber || null },
    { label: 'Exterior', value: vehicle.colour || null },
    { label: 'Upholstery', value: vehicle.upholstery || null },
  ];

  const grid = el('div', 'vd2-facts-grid');
  primaryItems.forEach(({ icon, label, value }) => {
    if (!value || value === '—') return;
    grid.append(
      el(
        'div',
        'vd2-fact',
        `
        <div class="vd2-fact-icon">${icon}<span class="vd2-fact-label">${label}</span></div>
        <span class="vd2-fact-value">${value}</span>
      `,
      ),
    );
  });

  const validSecondary = secondaryItems.filter(
    ({ value }) => value && value !== '—',
  );
  const secondary = el('div', 'vd2-facts-secondary');
  validSecondary.forEach(({ label, value }) => {
    secondary.append(
      el('span', 'vd2-fact-tag', `${label}: <strong>${value}</strong>`),
    );
  });

  section.append(el('hr', 'vd2-divider'));
  section.append(grid);
  if (validSecondary.length) section.append(secondary);

  return section;
}

/* ---------- Efficiency Stats ---------- */

function renderEfficiencyStats(vehicle) {
  const stats = [];

  if (vehicle.co2Emissions) {
    stats.push({ label: 'CO₂', value: vehicle.co2Emissions, unit: 'g/km' });
  }
  if (vehicle.mpgCombined) {
    stats.push({
      label: 'MPG Combined',
      value: vehicle.mpgCombined,
      unit: 'mpg',
    });
  }
  if (vehicle.electricRange) {
    stats.push({
      label: 'Electric Range',
      value: vehicle.electricRange,
      unit: 'mi',
    });
  }
  if (vehicle.energyConsumption) {
    stats.push({ label: 'Energy', value: vehicle.energyConsumption, unit: '' });
  }
  if (vehicle.mpgUrban) {
    stats.push({ label: 'MPG Urban', value: vehicle.mpgUrban, unit: 'mpg' });
  }
  if (vehicle.mpgExtraUrban) {
    stats.push({
      label: 'MPG Extra Urban',
      value: vehicle.mpgExtraUrban,
      unit: 'mpg',
    });
  }

  if (!stats.length) return null;

  const section = el('div', 'vd2-efficiency');
  stats.forEach(({ label, value, unit }) => {
    section.append(
      el(
        'div',
        'vd2-efficiency-stat',
        `<span class="vd2-efficiency-label">${label}</span>
         <span class="vd2-efficiency-value">${value}<span class="vd2-efficiency-unit"> ${unit}</span></span>`,
      ),
    );
  });
  return section;
}

/* ---------- HIGH_VALUE_OPTIONS config ----------
 * Map option pack substrings (lowercase) → highlight text shown to the buyer.
 * Extend this list to "train" the description on new high-value packs.
 * -------------------------------------------------- */

const HIGH_VALUE_OPTIONS = {
  'm sport pro':
    'M Sport Pro pack — enhanced body styling, M specific suspension and 19" alloys',
  'm sport':
    'M Sport specification — sport bumpers, M steering wheel and upgraded alloy wheels',
  'technology pack':
    'Technology Pack — includes heads-up display, Harman Kardon audio and gesture control',
  'innovation pack':
    'Innovation Pack — wireless charging, BMW live services and parking assistant',
  'driving assistant pro':
    'Driving Assistant Professional — lane-keep assist, active cruise control and emergency city braking',
  'driving assistant':
    'Driving Assistant — collision alert, lane departure warning and speed limit info',
  'comfort access':
    'Comfort Access — hands-free boot and keyless entry for effortless access',
  'harman kardon': 'Harman Kardon premium surround-sound audio system',
  'bowers wilkins':
    'Bowers & Wilkins Diamond surround-sound audio — audiophile-grade in-car acoustics',
  panoramic: 'Panoramic glass roof — floods the cabin with natural light',
  'heads up':
    'Head-up display — projects speed and navigation onto the windscreen',
  'head-up':
    'Head-up display — projects speed and navigation onto the windscreen',
  'laser light':
    'BMW Laserlight headlights — exceptional visibility up to 600 m',
  'adaptive led': 'Adaptive LED headlights with cornering function',
  'heated seats': 'Heated front and rear seats',
  massage: 'Seat massage function — multi-zone lumbar and shoulder massage',
  'active seats': 'Active ventilated and heated sports seats',
  'night vision': 'Night Vision pedestrian detection with alert display',
  360: '360° camera system — surround-view parking assistance',
  'reversing camera': 'High-resolution reversing camera',
  'connected package':
    'BMW Connected Package Professional — real-time traffic, online entertainment and remote services',
  'executive pack':
    'Executive Pack — soft-close doors, sun protection glass and gesture control',
  'luxury pack':
    'Luxury interior pack — Merino leather and wood trim highlights',
  individual: 'BMW Individual bespoke colour and upholstery specification',
  'plug-in':
    'Plug-in hybrid powertrain — EV range for urban commuting, petrol for longer journeys',
};

/* ---------- Vehicle Description (AI-style, config-driven) ---------- */

function renderVehicleDescription(vehicle) {
  const wrapper = el('div', 'vd2-description');
  const inner = el('div', 'vd2-description-inner vd2-description--loading');

  // Shimmer skeleton while composing
  inner.innerHTML = `
    <div class="vd2-description-skel"></div>
    <div class="vd2-description-skel"></div>
    <div class="vd2-description-skel"></div>`;
  wrapper.append(inner);

  // Compose description asynchronously so skeleton renders first
  requestAnimationFrame(() => {
    const packs = [
      ...(vehicle.optionalPacks || []),
      ...(vehicle.standardFeatures || []),
    ];
    const packsLower = packs.map((p) => p.toLowerCase());

    const matched = Object.entries(HIGH_VALUE_OPTIONS)
      .filter(([key]) => packsLower.some((p) => p.includes(key)));

    // Build natural language description
    const fuelLabel = {
      ELECTRIC: 'fully electric',
      PETROL_PLUG_IN_HYBRID: 'plug-in hybrid',
      DIESEL_PLUG_IN_HYBRID: 'diesel plug-in hybrid',
      DIESEL: 'diesel',
      PETROL: 'petrol',
    }[vehicle.fuelType] || 'petrol';

    const transLabel = vehicle.transmission === 'AUTOMATIC' ? 'automatic' : 'manual';
    const regYear = vehicle.registrationDate
      ? new Date(vehicle.registrationDate).getFullYear()
      : null;
    const yearStr = regYear ? `${regYear} ` : '';

    let intro = `This ${yearStr}${vehicle.model} is a ${fuelLabel} ${transLabel}`;
    if (vehicle.mileage) {
      const miles = vehicle.mileage.toLocaleString('en-GB');
      intro += ` with ${miles} miles on the clock`;
    }
    intro += '.';

    let body = '';
    if (matched.length >= 3) {
      body = ` It comes generously equipped with ${matched.length} notable option packs, making it an exceptionally well-specified example.`;
    } else if (matched.length > 0) {
      body = ` Key highlights include ${matched.map(([, v]) => v.split(' — ')[0]).join(', ')}.`;
    } else if (packs.length > 0) {
      body = ' This example has been specified with a range of standard and optional equipment.';
    }

    const closing = vehicle.dealer?.name
      ? ` Available from ${vehicle.dealer.name}.`
      : '';

    inner.classList.remove('vd2-description--loading');
    inner.innerHTML = `<p>${intro}${body}${closing}</p>`;

    // Highlight tags for matched high-value packs (max 4)
    if (matched.length) {
      const strip = el('div', 'vd2-description-highlight-strip');
      matched.slice(0, 4).forEach(([, text]) => {
        const label = text.split(' — ')[0];
        strip.append(el('span', 'vd2-highlight-tag', `★ ${label}`));
      });
      inner.append(strip);
    }
  });

  return wrapper;
}

/* ---------- Price Card ---------- */

function renderPriceCard(vehicle, isSaved, onToggleSave, accentColour) {
  const card = el('div', 'vd2-price-card');
  card.style.setProperty('--vd2-accent', accentColour);

  const price = el('div', 'vd2-price', formatPrice(vehicle.price));
  card.append(price);

  if (vehicle.estimatedMonthlyPayment) {
    card.append(
      el(
        'div',
        'vd2-monthly',
        `${formatMonthly(vehicle.estimatedMonthlyPayment)}  / mo`,
      ),
    );
  }

  // Enquire now CTA
  const enquireBtn = el('a', 'vd2-btn vd2-btn--primary', 'Enquire now');
  enquireBtn.href = `/used-cars/enquire?id=${vehicle.id}`;
  card.append(enquireBtn);

  // Reserve CTA
  const reserveBtn = el('a', 'vd2-btn vd2-btn--secondary', 'Reserve for £100');
  reserveBtn.href = '#reserve';
  card.append(reserveBtn);

  // Save + Share row
  const actionRow = el('div', 'vd2-action-row');

  const saveBtn = el('button', `vd2-action-btn${isSaved ? ' saved' : ''}`);
  saveBtn.innerHTML = `${isSaved ? ICONS.heartFilled : ICONS.heart}<span>Save</span>`;
  saveBtn.setAttribute(
    'aria-label',
    isSaved ? 'Remove from saved' : 'Save vehicle',
  );
  saveBtn.addEventListener('click', () => onToggleSave(saveBtn));
  actionRow.append(saveBtn);

  const shareBtn = el('button', 'vd2-action-btn');
  shareBtn.innerHTML = `${ICONS.share}<span>Share</span>`;
  shareBtn.setAttribute('aria-label', 'Share vehicle');
  shareBtn.addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: vehicle.model, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  });
  actionRow.append(shareBtn);

  card.append(actionRow);

  // Dealer info
  if (vehicle.dealer) {
    const dealer = el('div', 'vd2-dealer-info');
    dealer.innerHTML = `
      <div class="vd2-dealer-row">${ICONS.location}<span>${vehicle.dealer.name}</span></div>
      ${vehicle.dealer.phone ? `<div class="vd2-dealer-row">${ICONS.phone}<a href="tel:${vehicle.dealer.phone}">${vehicle.dealer.phone}</a></div>` : ''}`;
    card.append(dealer);
  }

  return card;
}

/* ---------- Similar Offers ---------- */

function renderSimilarOffers(vehicles, currentId) {
  const filtered = vehicles.filter((v) => v.id !== currentId);
  if (!filtered.length) return null;

  const section = el('div', 'vd2-similar');
  section.innerHTML = '<div class="vd2-similar-header"><span class="vd2-similar-line"></span><h2>Similar Offers</h2><span class="vd2-similar-line"></span></div>';

  const track = el('div', 'vd2-similar-track');
  filtered.forEach((v) => {
    const card = el('a', 'vd2-similar-card');
    card.href = `/vehicle?id=${v.id}`;
    const img = v.images?.sort((a, b) => a.order - b.order)[0];
    if (img) {
      const imgEl = document.createElement('img');
      imgEl.src = img.url;
      imgEl.alt = v.model || 'Vehicle';
      imgEl.loading = 'lazy';
      card.append(imgEl);
    }
    track.append(card);
  });

  section.append(track);
  return section;
}

/* ---------- Back Navigation ---------- */

function renderBackLink() {
  const nav = el('div', 'vd2-back');
  const link = el('a', 'vd2-back-link');
  link.innerHTML = `${ICONS.chevronLeft}<span>Back to results</span>`;
  link.href = document.referrer && document.referrer.includes('/used-cars/')
    ? document.referrer
    : '/used-cars/inventory';
  nav.append(link);
  return nav;
}

/* ---------- Main Decorate ---------- */

export default async function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const vehicleId = params.get('id');

  if (!vehicleId) {
    renderError(
      block,
      'No vehicle ID provided. Please select a vehicle from the search results.',
    );
    return;
  }

  renderSkeleton(block);

  let vehicle;
  let garageIds = [];

  try {
    const userId = getUserId();
    const [vehicleData, garageData] = await Promise.allSettled([
      queryAPI(VEHICLE_QUERY, { id: vehicleId }),
      queryAPI(GARAGE_IDS, { userId }),
    ]);

    if (vehicleData.status === 'rejected' || !vehicleData.value?.usedVehicle) {
      renderError(
        block,
        'This vehicle could not be found. It may have been sold or removed.',
      );
      return;
    }

    vehicle = vehicleData.value.usedVehicle;
    if (garageData.status === 'fulfilled') garageIds = garageData.value?.garageVehicleIds || [];
  } catch (err) {
    renderError(block, `Failed to load vehicle details. ${err.message}`);
    return;
  }

  document.title = `${vehicle.model} | BMW Used Cars`;

  // Determine accent colour from vehicle colour
  const accentColour = getAccentColour(vehicle.colour);
  const accentText = getAccentTextColour(accentColour);

  // Set CSS custom properties on the block
  block.style.setProperty('--vd2-accent', accentColour);
  block.style.setProperty('--vd2-accent-text', accentText);

  // Clear skeleton
  block.textContent = '';
  const isSaved = garageIds.includes(vehicleId);

  // Toggle save handler
  async function onToggleSave(btn) {
    const userId = getUserId();
    const currentlySaved = btn.classList.contains('saved');
    btn.classList.toggle('saved');
    btn.innerHTML = currentlySaved
      ? `${ICONS.heart}<span>Save</span>`
      : `${ICONS.heartFilled}<span>Save</span>`;
    btn.setAttribute(
      'aria-label',
      currentlySaved ? 'Save vehicle' : 'Remove from saved',
    );
    try {
      if (currentlySaved) {
        await queryAPI(GARAGE_REMOVE, { userId, vehicleId });
      } else {
        await queryAPI(GARAGE_ADD, { userId, vehicleId });
      }
    } catch {
      /* optimistic UI */
    }
  }

  // Build page
  block.append(renderBackLink());

  if (vehicle.images?.length) {
    block.append(renderGallery(vehicle.images, accentColour));
  } else {
    // No-image placeholder
    const placeholder = el('div', 'vd2-gallery');
    const heroWrap = el('div', 'vd2-gallery-hero vd2-gallery-hero--empty');
    heroWrap.innerHTML = '<div class="vd2-gallery-placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><span>No images available</span></div>';
    placeholder.append(heroWrap);
    block.append(placeholder);
  }

  // Content area (2-column: info left, price card right)
  const content = el('div', 'vd2-content');

  // Left column
  const left = el('div', 'vd2-content-left');

  // Badge
  if (vehicle.optionalPacks?.length > 2) {
    left.append(el('div', 'vd2-badge', 'High specification'));
  }

  // Title
  left.append(el('h1', 'vd2-title', vehicle.model));

  // Key facts
  left.append(renderKeyFacts(vehicle));

  // Efficiency stats (CO₂, MPG, electric range)
  const efficiency = renderEfficiencyStats(vehicle);
  if (efficiency) left.append(efficiency);

  // AI-style vehicle description
  left.append(renderVehicleDescription(vehicle));

  content.append(left);

  // Right column: price card
  content.append(renderPriceCard(vehicle, isSaved, onToggleSave, accentColour));

  block.append(content);

  // Similar offers (fetch in background)
  if (vehicle.series) {
    try {
      const data = await queryAPI(SIMILAR_QUERY, {
        series: vehicle.series,
        excludeId: vehicleId,
        limit: 8,
      });
      const similar = data?.usedVehicles?.vehicles;
      if (similar?.length) {
        const section = renderSimilarOffers(similar, vehicleId);
        if (section) block.append(section);
      }
    } catch {
      /* non-critical */
    }
  }
}
