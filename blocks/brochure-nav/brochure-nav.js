import {
  getBrochurePages,
  getCurrentPage,
  getPreviousPage,
  getNextPage,
} from '../../scripts/brochure-config.js';

function createPageNav() {
  const prev = getPreviousPage();
  const next = getNextPage();

  const nav = document.createElement('div');
  nav.className = 'brochure-page-nav';

  const prevLink = document.createElement('a');
  prevLink.className = 'brochure-page-nav-prev';
  if (prev) {
    prevLink.href = prev.url;
    prevLink.setAttribute('aria-label', `Previous page, ${prev.id < 10 ? `0${prev.id}` : prev.id}: ${prev.title}`);
    prevLink.innerHTML = `<span class="brochure-page-nav-label">${prev.id < 10 ? `0${prev.id}` : prev.id}: ${prev.title}</span><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  } else {
    prevLink.classList.add('disabled');
    prevLink.setAttribute('aria-disabled', 'true');
    prevLink.innerHTML = '<span class="brochure-page-nav-label"></span><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  const nextLink = document.createElement('a');
  nextLink.className = 'brochure-page-nav-next';
  if (next) {
    nextLink.href = next.url;
    nextLink.setAttribute('aria-label', `Next page, ${next.id < 10 ? `0${next.id}` : next.id}: ${next.title}`);
    nextLink.innerHTML = `<span class="brochure-page-nav-label">${next.id < 10 ? `0${next.id}` : next.id}: ${next.title}</span><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  } else {
    nextLink.classList.add('disabled');
    nextLink.setAttribute('aria-disabled', 'true');
    nextLink.innerHTML = '<span class="brochure-page-nav-label"></span><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  nav.append(prevLink, nextLink);
  return nav;
}

export default async function decorate(block) {
  const pages = getBrochurePages();
  const current = getCurrentPage();

  // Build top navigation bar
  const navbar = document.createElement('nav');
  navbar.className = 'brochure-navbar';
  navbar.setAttribute('aria-label', 'Brochure navigation');

  // BMW Logo
  const logo = document.createElement('a');
  logo.href = pages[0].url;
  logo.className = 'brochure-nav-logo';
  logo.setAttribute('aria-label', 'BMW');
  logo.innerHTML = '<img src="/icons/bmw-logo.svg" alt="BMW" width="40" height="40">';

  // Page index / dropdown toggle
  const indexBtn = document.createElement('button');
  indexBtn.className = 'brochure-nav-index-btn';
  indexBtn.setAttribute('aria-expanded', 'false');
  indexBtn.setAttribute('aria-haspopup', 'true');
  indexBtn.textContent = 'Index';

  // Dropdown menu
  const dropdown = document.createElement('div');
  dropdown.className = 'brochure-nav-dropdown';
  dropdown.setAttribute('role', 'menu');
  dropdown.hidden = true;

  const menuList = document.createElement('ul');
  menuList.setAttribute('role', 'menubar');
  pages.forEach((page) => {
    const li = document.createElement('li');
    li.setAttribute('role', 'menuitem');
    const link = document.createElement('a');
    link.href = page.url;
    link.textContent = page.title;
    if (current && current.id === page.id) {
      li.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
    li.append(link);
    menuList.append(li);
  });
  dropdown.append(menuList);

  // Toggle dropdown
  indexBtn.addEventListener('click', () => {
    const expanded = indexBtn.getAttribute('aria-expanded') === 'true';
    indexBtn.setAttribute('aria-expanded', String(!expanded));
    dropdown.hidden = expanded;
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      indexBtn.setAttribute('aria-expanded', 'false');
      dropdown.hidden = true;
    }
  });

  navbar.append(logo, indexBtn, dropdown);

  // Page navigation (prev/next arrows)
  const pageNav = createPageNav();

  // Clear block and append
  block.textContent = '';
  block.append(navbar, pageNav);

  // Apply brochure theme to body
  document.body.classList.add('brochure');
}
