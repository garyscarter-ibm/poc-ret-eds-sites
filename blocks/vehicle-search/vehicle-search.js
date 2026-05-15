import queryAPI from '../../scripts/used-cars-api.js';
import {
  DEFAULT_PAGE_SIZE,
  DETAIL_PAGE_PATH,
  formatPrice,
  formatMileage,
  formatDate,
  formatFuelType,
  formatTransmission,
  getUserId,
} from '../../scripts/used-cars-config.js';

/* ---------- GraphQL Queries ---------- */

const SEARCH_QUERY = `query SearchVehicles($input: UsedVehicleSearchInput!) {
  searchUsedVehicles(input: $input) {
    totalCount
    totalPages
    page
    pageSize
    vehicles {
      id
      series
      model
      price
      estimatedMonthlyPayment
      financeAvailable
      mileage
      fuelType
      transmission
      power
      registrationDate
      bodyType
      images { url alt order }
      videoUrl
      badges
      dealer { id name }
    }
    facets {
      series { value count }
      bodyTypes { value count }
      fuelTypes { value count }
      transmissions { value count }
      priceRange { min max }
      mileageRange { min max }
      yearRange { min max }
    }
  }
}`;

const GARAGE_IDS_QUERY = `query GarageIds($userId: String!) {
  garageVehicleIds(userId: $userId)
}`;

const ADD_GARAGE_MUTATION = `mutation AddToGarage($userId: String!, $vehicleId: ID!) {
  addToGarage(userId: $userId, vehicleId: $vehicleId)
}`;

const REMOVE_GARAGE_MUTATION = `mutation RemoveFromGarage($userId: String!, $vehicleId: ID!) {
  removeFromGarage(userId: $userId, vehicleId: $vehicleId)
}`;

/* ---------- URL State Helpers ---------- */

function getSearchParams() {
  return new URLSearchParams(window.location.search);
}

function buildInputFromParams(params, pageSize) {
  const input = { pageSize };

  const page = parseInt(params.get('page'), 10);
  if (page > 1) input.page = page;

  const series = params.getAll('series');
  if (series.length) input.series = series;

  const bodyTypes = params.getAll('bodyType');
  if (bodyTypes.length) input.bodyTypes = bodyTypes;

  const fuelTypes = params.getAll('fuelType');
  if (fuelTypes.length) input.fuelTypes = fuelTypes;

  const transmissions = params.getAll('transmission');
  if (transmissions.length) input.transmissions = transmissions;

  const priceMin = params.get('priceMin');
  if (priceMin) input.priceMin = parseFloat(priceMin);

  const priceMax = params.get('priceMax');
  if (priceMax) input.priceMax = parseFloat(priceMax);

  const mileageMin = params.get('mileageMin');
  if (mileageMin) input.mileageMin = parseInt(mileageMin, 10);

  const mileageMax = params.get('mileageMax');
  if (mileageMax) input.mileageMax = parseInt(mileageMax, 10);

  const yearMin = params.get('yearMin');
  if (yearMin) input.yearMin = parseInt(yearMin, 10);

  const yearMax = params.get('yearMax');
  if (yearMax) input.yearMax = parseInt(yearMax, 10);

  const sort = params.get('sort');
  if (sort) input.sort = sort;

  return input;
}

function updateURL(params) {
  const url = new URL(window.location);
  url.search = params.toString();
  window.history.pushState({}, '', url);
}

/* ---------- Icon Helper ---------- */

function icon(name) {
  const span = document.createElement('span');
  span.className = `icon icon-${name}`;
  span.innerHTML = `<img src="/icons/${name}.svg" alt="" loading="lazy" width="24" height="24">`;
  return span;
}

/* ---------- Skeleton Rendering ---------- */

function renderSkeleton(count) {
  const container = document.createElement('div');
  container.className = 'vehicle-search-results';
  for (let i = 0; i < count; i += 1) {
    const card = document.createElement('div');
    card.className = 'vehicle-card vehicle-card--skeleton';
    card.innerHTML = `
      <div class="vehicle-card-image"><div class="skeleton-img"></div></div>
      <div class="vehicle-card-details">
        <div class="skeleton-line skeleton-line--wide"></div>
        <div class="skeleton-line skeleton-line--medium"></div>
        <div class="skeleton-line skeleton-line--narrow"></div>
      </div>`;
    container.append(card);
  }
  return container;
}

/* ---------- Filter Bar ---------- */

function createFilterDropdown(label, name, options, activeValues) {
  const wrapper = document.createElement('div');
  wrapper.className = 'filter-dropdown';

  const btn = document.createElement('button');
  btn.className = 'filter-dropdown-btn';
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');
  const activeCount = activeValues.length;
  btn.textContent = activeCount ? `${label} (${activeCount})` : label;
  wrapper.append(btn);

  const panel = document.createElement('div');
  panel.className = 'filter-dropdown-panel';
  panel.hidden = true;

  options.forEach(({ value, count }) => {
    const lbl = document.createElement('label');
    lbl.className = 'filter-option';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = name;
    cb.value = value;
    cb.checked = activeValues.includes(value);
    lbl.append(cb);
    const text = document.createElement('span');
    text.textContent = `${value} (${count})`;
    lbl.append(text);
    panel.append(lbl);
  });

  wrapper.append(panel);

  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    // Close all other dropdowns first
    wrapper
      .closest('.vehicle-search-filters')
      ?.querySelectorAll('.filter-dropdown-btn[aria-expanded="true"]')
      .forEach((other) => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          other.nextElementSibling.hidden = true;
        }
      });
    btn.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      btn.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
    }
  });

  return wrapper;
}

function createSortSelect(currentSort) {
  const wrapper = document.createElement('div');
  wrapper.className = 'filter-sort';

  const select = document.createElement('select');
  select.name = 'sort';
  select.setAttribute('aria-label', 'Sort results');

  const sortOptions = [
    { value: '', label: 'Relevance' },
    { value: 'PRICE_ASC', label: 'Price: Low to High' },
    { value: 'PRICE_DESC', label: 'Price: High to Low' },
    { value: 'MILEAGE_ASC', label: 'Mileage: Low to High' },
    { value: 'MILEAGE_DESC', label: 'Mileage: High to Low' },
    { value: 'AGE_NEWEST', label: 'Newest First' },
    { value: 'AGE_OLDEST', label: 'Oldest First' },
  ];

  sortOptions.forEach(({ value, label }) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if (value === (currentSort || '')) opt.selected = true;
    select.append(opt);
  });

  wrapper.append(select);
  return wrapper;
}

function renderFilterBar(facets, params, onFilterChange) {
  const bar = document.createElement('div');
  bar.className = 'vehicle-search-filters';

  const activeSeries = params.getAll('series');
  const activeBody = params.getAll('bodyType');
  const activeFuel = params.getAll('fuelType');
  const activeTrans = params.getAll('transmission');

  if (facets.series) {
    bar.append(
      createFilterDropdown('Series', 'series', facets.series, activeSeries),
    );
  }
  if (facets.bodyTypes) {
    bar.append(
      createFilterDropdown(
        'Body Type',
        'bodyType',
        facets.bodyTypes,
        activeBody,
      ),
    );
  }
  if (facets.fuelTypes) {
    bar.append(
      createFilterDropdown(
        'Fuel Type',
        'fuelType',
        facets.fuelTypes,
        activeFuel,
      ),
    );
  }
  if (facets.transmissions) {
    bar.append(
      createFilterDropdown(
        'Transmission',
        'transmission',
        facets.transmissions,
        activeTrans,
      ),
    );
  }

  bar.append(createSortSelect(params.get('sort')));

  // Listen for filter changes
  bar.addEventListener('change', () => {
    const newParams = new URLSearchParams();
    bar.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => {
      newParams.append(cb.name, cb.value);
    });
    const sortVal = bar.querySelector('select[name="sort"]')?.value;
    if (sortVal) newParams.set('sort', sortVal);
    // Reset to page 1 on filter change
    onFilterChange(newParams);
  });

  return bar;
}

/* ---------- Vehicle Card ---------- */

function renderImageCarousel(images, videoUrl) {
  const wrapper = document.createElement('div');
  wrapper.className = 'vehicle-card-carousel-wrapper';

  const imageContainer = document.createElement('div');
  imageContainer.className = 'vehicle-card-image';

  const track = document.createElement('div');
  track.className = 'vehicle-card-image-track';

  const sorted = [...images].sort((a, b) => a.order - b.order);
  sorted.forEach((img) => {
    const slide = document.createElement('div');
    slide.className = 'vehicle-card-slide';
    slide.innerHTML = `<img src="${img.url}" alt="${img.alt || ''}" loading="lazy" width="651" height="392">`;
    track.append(slide);
  });
  imageContainer.append(track);

  if (videoUrl) {
    const playBtn = document.createElement('a');
    playBtn.href = videoUrl;
    playBtn.target = '_blank';
    playBtn.rel = 'noopener';
    playBtn.className = 'vehicle-card-video-btn';
    playBtn.setAttribute('aria-label', 'Play video');
    playBtn.innerHTML = '<img src="/icons/play.svg" alt="" width="20" height="20">';
    imageContainer.append(playBtn);
  }

  wrapper.append(imageContainer);

  if (sorted.length > 1) {
    // Carousel nav bar below image
    const nav = document.createElement('div');
    nav.className = 'vehicle-card-carousel-nav';

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'vehicle-card-carousel-btn vehicle-card-carousel-prev';
    prev.setAttribute('aria-label', 'Previous image');
    prev.innerHTML = '<img src="/icons/chevron-left.svg" alt="" width="16" height="16">';
    nav.append(prev);

    const dots = document.createElement('div');
    dots.className = 'vehicle-card-dots';
    sorted.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = `vehicle-card-dot${i === 0 ? ' active' : ''}`;
      dots.append(dot);
    });
    nav.append(dots);

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'vehicle-card-carousel-btn vehicle-card-carousel-next';
    next.setAttribute('aria-label', 'Next image');
    next.innerHTML = '<img src="/icons/chevron-right.svg" alt="" width="16" height="16">';
    nav.append(next);

    wrapper.append(nav);

    // Carousel logic
    let currentSlide = 0;
    const updateSlide = () => {
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      dots.querySelectorAll('.vehicle-card-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentSlide);
      });
    };

    prev.addEventListener('click', (e) => {
      e.preventDefault();
      currentSlide = currentSlide > 0 ? currentSlide - 1 : sorted.length - 1;
      updateSlide();
    });

    next.addEventListener('click', (e) => {
      e.preventDefault();
      currentSlide = currentSlide < sorted.length - 1 ? currentSlide + 1 : 0;
      updateSlide();
    });
  }

  return wrapper;
}

function renderSpecsGrid(vehicle) {
  const grid = document.createElement('div');
  grid.className = 'vehicle-card-specs';

  const specs = [
    { iconName: 'road', text: formatMileage(vehicle.mileage) },
    {
      iconName: 'transmission',
      text: formatTransmission(vehicle.transmission),
    },
    { iconName: 'fuel', text: formatFuelType(vehicle.fuelType) },
    { iconName: 'power', text: vehicle.power ? `${vehicle.power} HP` : '' },
    { iconName: 'calendar', text: formatDate(vehicle.registrationDate) },
    { iconName: 'location', text: vehicle.dealer?.name || '—' },
  ];

  specs.forEach(({ iconName, text }) => {
    const item = document.createElement('div');
    item.className = 'vehicle-card-spec';
    item.append(icon(iconName));
    const span = document.createElement('span');
    span.textContent = text;
    item.append(span);
    grid.append(item);
  });

  return grid;
}

function renderVehicleCard(
  vehicle,
  isSaved,
  onToggleSave,
  detailPath,
  compareSet,
  onCompareToggle,
) {
  const card = document.createElement('article');
  card.className = 'vehicle-card';
  card.dataset.vehicleId = vehicle.id;

  // Image carousel
  card.append(renderImageCarousel(vehicle.images || [], vehicle.videoUrl));

  // Compare button (top-right overlay on image)
  const compareBtn = document.createElement('button');
  compareBtn.type = 'button';
  const isCompared = compareSet.has(vehicle.id);
  compareBtn.className = `vehicle-card-compare${isCompared ? ' vehicle-card-compare--active' : ''}`;
  compareBtn.innerHTML = isCompared
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Compare'
    : '+ Compare';
  compareBtn.setAttribute(
    'aria-label',
    isCompared ? 'Remove from comparison' : 'Add to comparison',
  );
  compareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onCompareToggle(vehicle.id, compareBtn);
  });
  card.querySelector('.vehicle-card-image').append(compareBtn);

  // Badge
  if (vehicle.badges && vehicle.badges.length) {
    const badge = document.createElement('span');
    badge.className = 'vehicle-card-badge';
    const [firstBadge] = vehicle.badges;
    badge.textContent = firstBadge;
    card.querySelector('.vehicle-card-image').prepend(badge);
  }

  // Details panel
  const details = document.createElement('div');
  details.className = 'vehicle-card-details';

  // Header row (title left + price right)
  const header = document.createElement('div');
  header.className = 'vehicle-card-header';

  const titleEl = document.createElement('h3');
  titleEl.className = 'vehicle-card-model';
  titleEl.textContent = vehicle.model;
  header.append(titleEl);

  const priceGroup = document.createElement('div');
  priceGroup.className = 'vehicle-card-pricing';
  let monthlyHtml = '';
  if (vehicle.estimatedMonthlyPayment) {
    monthlyHtml = `<span class="vehicle-card-monthly">${formatPrice(vehicle.estimatedMonthlyPayment)} / mo</span>`;
  } else if (vehicle.financeAvailable) {
    monthlyHtml = '<span class="vehicle-card-monthly">Pay in full</span>';
  }
  priceGroup.innerHTML = `
    <span class="vehicle-card-price">${formatPrice(vehicle.price)}</span>
    ${monthlyHtml}`;
  header.append(priceGroup);
  details.append(header);

  // Specs grid
  details.append(renderSpecsGrid(vehicle));

  // CTAs (View details + Enquire + Heart)
  const ctas = document.createElement('div');
  ctas.className = 'vehicle-card-ctas';

  const viewBtn = document.createElement('a');
  viewBtn.href = `${detailPath}?id=${vehicle.id}`;
  viewBtn.className = 'vehicle-card-cta vehicle-card-cta--primary';
  viewBtn.textContent = 'View details';
  ctas.append(viewBtn);

  const enquireBtn = document.createElement('a');
  enquireBtn.href = `${detailPath}?id=${vehicle.id}#enquire`;
  enquireBtn.className = 'vehicle-card-cta vehicle-card-cta--secondary';
  enquireBtn.textContent = 'Enquire';
  ctas.append(enquireBtn);

  const heartBtn = document.createElement('button');
  heartBtn.type = 'button';
  heartBtn.className = `vehicle-card-heart${isSaved ? ' saved' : ''}`;
  heartBtn.setAttribute(
    'aria-label',
    isSaved ? 'Remove from saved' : 'Save vehicle',
  );
  heartBtn.innerHTML = isSaved
    ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="#1b69d4" stroke="#1b69d4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
    : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
  heartBtn.addEventListener('click', () => onToggleSave(vehicle.id, heartBtn));
  ctas.append(heartBtn);

  details.append(ctas);

  card.append(details);
  return card;
}

/* ---------- Pagination ---------- */

function renderPagination(currentPage, totalPages, onPageChange) {
  if (totalPages <= 1) return document.createDocumentFragment();

  const nav = document.createElement('nav');
  nav.className = 'vehicle-search-pagination';
  nav.setAttribute('aria-label', 'Search results pages');

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'pagination-btn pagination-prev';
  prevBtn.disabled = currentPage <= 1;
  prevBtn.setAttribute('aria-label', 'Previous page');
  prevBtn.innerHTML = '<img src="/icons/chevron-left.svg" alt="" width="24" height="24">';
  nav.append(prevBtn);

  const pages = document.createElement('div');
  pages.className = 'pagination-pages';

  const addPage = (num) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `pagination-page${num === currentPage ? ' active' : ''}`;
    btn.textContent = num;
    btn.setAttribute('aria-label', `Page ${num}`);
    if (num === currentPage) btn.setAttribute('aria-current', 'page');
    btn.addEventListener('click', () => onPageChange(num));
    pages.append(btn);
  };

  const addEllipsis = () => {
    const span = document.createElement('span');
    span.className = 'pagination-ellipsis';
    span.textContent = '...';
    pages.append(span);
  };

  // Show: 1, 2, 3, ..., last
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i += 1) addPage(i);
  } else {
    addPage(1);
    if (currentPage > 3) addEllipsis();
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i += 1) addPage(i);
    if (currentPage < totalPages - 2) addEllipsis();
    addPage(totalPages);
  }
  nav.append(pages);

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'pagination-btn pagination-next';
  nextBtn.disabled = currentPage >= totalPages;
  nextBtn.setAttribute('aria-label', 'Next page');
  nextBtn.innerHTML = '<img src="/icons/chevron-right.svg" alt="" width="24" height="24">';
  nav.append(nextBtn);

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  });
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  });

  return nav;
}

/* ---------- Results Count ---------- */

function renderResultsCount(totalCount) {
  const div = document.createElement('div');
  div.className = 'vehicle-search-count';
  div.textContent = `${totalCount.toLocaleString('en-GB')}+ Cars Available`;
  return div;
}

/* ---------- Error State ---------- */

function renderError(message) {
  const div = document.createElement('div');
  div.className = 'vehicle-search-error';
  div.innerHTML = `<p>Unable to load vehicles. Please try again later.</p><p class="vehicle-search-error-detail">${message}</p>`;
  return div;
}

/* ---------- Main Block ---------- */

/**
 * Vehicle Search block — fetches and displays used car inventory with filters and pagination.
 * @param {Element} block
 */
export default async function decorate(block) {
  // Parse authored config
  let pageSize = DEFAULT_PAGE_SIZE;
  let detailPath = DETAIL_PAGE_PATH;
  [...block.children].forEach((row) => {
    const key = row.children[0]?.textContent?.trim().toLowerCase();
    const value = row.children[1]?.textContent?.trim();
    if (key === 'results-per-page' && value) pageSize = parseInt(value, 10);
    if (key === 'detail-page' && value) detailPath = value;
  });

  block.textContent = '';

  // Garage state (saved vehicle IDs)
  let savedIds = new Set();

  // Compare state
  const compareIds = new Set();
  const MAX_COMPARE = 4;

  // Compare bar (sticky bottom)
  const compareBar = document.createElement('div');
  compareBar.className = 'vehicle-search-compare-bar';
  compareBar.hidden = true;
  compareBar.innerHTML = `
    <span class="compare-bar-text"></span>
    <div class="compare-bar-actions">
      <button type="button" class="compare-bar-clear">Clear</button>
      <a class="compare-bar-btn" href="#">Compare (<span class="compare-bar-count">0</span>)</a>
    </div>`;
  document.body.append(compareBar);

  function updateCompareBar() {
    const count = compareIds.size;
    compareBar.hidden = count === 0;
    compareBar.querySelector('.compare-bar-text').textContent = `${count} vehicle${count !== 1 ? 's' : ''} selected for comparison`;
    compareBar.querySelector('.compare-bar-count').textContent = count;
    compareBar.querySelector('.compare-bar-btn').href = `/used-cars/compare?ids=${[...compareIds].join(',')}`;
    if (count >= 2) {
      compareBar
        .querySelector('.compare-bar-btn')
        .classList.remove('compare-bar-btn--disabled');
    } else {
      compareBar
        .querySelector('.compare-bar-btn')
        .classList.add('compare-bar-btn--disabled');
    }
  }

  compareBar
    .querySelector('.compare-bar-clear')
    .addEventListener('click', () => {
      compareIds.clear();
      block.querySelectorAll('.vehicle-card-compare--active').forEach((btn) => {
        btn.classList.remove('vehicle-card-compare--active');
        btn.innerHTML = '+ Compare';
      });
      updateCompareBar();
    });

  const handleCompareToggle = (vehicleId, btn) => {
    if (compareIds.has(vehicleId)) {
      compareIds.delete(vehicleId);
      btn.classList.remove('vehicle-card-compare--active');
      btn.innerHTML = '+ Compare';
      btn.setAttribute('aria-label', 'Add to comparison');
    } else {
      if (compareIds.size >= MAX_COMPARE) return;
      compareIds.add(vehicleId);
      btn.classList.add('vehicle-card-compare--active');
      btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Compare';
      btn.setAttribute('aria-label', 'Remove from comparison');
    }
    updateCompareBar();
  };

  // Toggle save/unsave
  const handleToggleSave = async (vehicleId, btn) => {
    const toggleUserId = getUserId();
    const wasSaved = savedIds.has(vehicleId);

    const heartOutline = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    const heartFilled = '<svg width="24" height="24" viewBox="0 0 24 24" fill="#1b69d4" stroke="#1b69d4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

    // Optimistic UI update
    if (wasSaved) {
      savedIds.delete(vehicleId);
      btn.classList.remove('saved');
      btn.setAttribute('aria-label', 'Save vehicle');
      btn.innerHTML = heartOutline;
    } else {
      savedIds.add(vehicleId);
      btn.classList.add('saved');
      btn.setAttribute('aria-label', 'Remove from saved');
      btn.innerHTML = heartFilled;
    }

    // Fire API call in background
    try {
      if (wasSaved) {
        await queryAPI(REMOVE_GARAGE_MUTATION, {
          userId: toggleUserId,
          vehicleId,
        });
      } else {
        await queryAPI(ADD_GARAGE_MUTATION, {
          userId: toggleUserId,
          vehicleId,
        });
      }
    } catch {
      // Revert on failure
      if (wasSaved) {
        savedIds.add(vehicleId);
        btn.classList.add('saved');
        btn.innerHTML = heartFilled;
      } else {
        savedIds.delete(vehicleId);
        btn.classList.remove('saved');
        btn.innerHTML = heartOutline;
      }
    }
  };

  // Page toolbar with garage link
  const toolbar = document.createElement('div');
  toolbar.className = 'vehicle-search-toolbar';
  toolbar.innerHTML = `
    <a href="/used-cars/garage" class="vehicle-search-garage-link">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      My Garage
    </a>`;
  block.append(toolbar);

  // Placeholder for filters (rendered after data arrives)
  const filtersContainer = document.createElement('div');
  filtersContainer.className = 'vehicle-search-filters-container';
  block.append(filtersContainer);

  // Results count placeholder
  const countContainer = document.createElement('div');
  countContainer.className = 'vehicle-search-count-container';
  block.append(countContainer);

  // Skeleton while loading
  let resultsEl = renderSkeleton(pageSize);
  block.append(resultsEl);

  // Pagination placeholder
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'vehicle-search-pagination-container';
  block.append(paginationContainer);

  // Fetch + render function
  const fetchAndRender = async (params) => {
    const input = buildInputFromParams(params, pageSize);

    // Show skeleton
    const skeleton = renderSkeleton(pageSize);
    resultsEl.replaceWith(skeleton);
    resultsEl = skeleton;

    try {
      const data = await queryAPI(SEARCH_QUERY, { input });
      const {
        vehicles, facets, totalCount, totalPages, page,
      } = data.searchUsedVehicles;

      // Render filters
      filtersContainer.innerHTML = '';
      filtersContainer.append(
        renderFilterBar(facets, params, (newParams) => {
          updateURL(newParams);
          fetchAndRender(newParams);
        }),
      );

      // Render count
      countContainer.innerHTML = '';
      countContainer.append(renderResultsCount(totalCount));

      // Render cards
      const results = document.createElement('div');
      results.className = 'vehicle-search-results';
      vehicles.forEach((vehicle) => {
        const isSaved = savedIds.has(vehicle.id);
        const card = renderVehicleCard(
          vehicle,
          isSaved,
          handleToggleSave,
          detailPath,
          compareIds,
          handleCompareToggle,
        );
        results.append(card);
      });
      resultsEl.replaceWith(results);
      resultsEl = results;

      // Render pagination
      paginationContainer.innerHTML = '';
      paginationContainer.append(
        renderPagination(page, totalPages, (newPage) => {
          const p = getSearchParams();
          p.set('page', String(newPage));
          updateURL(p);
          fetchAndRender(p);
          block.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }),
      );
    } catch (err) {
      const errorEl = renderError(err.message);
      resultsEl.replaceWith(errorEl);
      resultsEl = errorEl;
    }
  };

  // Load garage IDs then fetch results (non-blocking so section is revealed immediately)
  const params = getSearchParams();
  const userId = getUserId();

  const initialLoad = async () => {
    try {
      const garageData = await queryAPI(GARAGE_IDS_QUERY, { userId });
      savedIds = new Set(garageData.garageVehicleIds || []);
    } catch {
      // Non-critical — continue without saved state
    }
    await fetchAndRender(params);
  };
  initialLoad();

  // Handle browser back/forward
  window.addEventListener('popstate', () => {
    fetchAndRender(getSearchParams());
  });
}
