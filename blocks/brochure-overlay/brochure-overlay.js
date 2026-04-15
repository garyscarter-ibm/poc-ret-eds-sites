export default async function decorate(block) {
  const overlays = {};
  const rows = [...block.children];

  // Parse overlay content from authored rows
  // Row format: | overlay-id | content (heading, text, image) |
  rows.forEach((row) => {
    const cols = [...row.children];
    const id = cols[0]?.textContent?.trim();
    const content = cols[1];
    if (id && content) {
      overlays[id] = content.innerHTML;
    }
  });

  // Build overlay modal
  const modal = document.createElement('div');
  modal.className = 'brochure-overlay-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const backdrop = document.createElement('div');
  backdrop.className = 'brochure-overlay-backdrop';

  const container = document.createElement('div');
  container.className = 'brochure-overlay-container';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'brochure-overlay-close';
  closeBtn.setAttribute('aria-label', 'Close overlay');
  closeBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  const contentEl = document.createElement('div');
  contentEl.className = 'brochure-overlay-content';

  container.append(closeBtn, contentEl);
  modal.append(backdrop, container);

  const FOCUSABLE = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
  let previousFocus = null;

  function trapFocus(e) {
    if (modal.hidden) return;
    const focusable = [...container.querySelectorAll(FOCUSABLE)];
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

  function openOverlay(id) {
    const html = overlays[id];
    if (!html) return;
    previousFocus = document.activeElement;
    contentEl.innerHTML = html;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeOverlay() {
    modal.hidden = true;
    document.body.style.overflow = '';
    contentEl.innerHTML = '';
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    if (previousFocus) {
      previousFocus.focus();
      previousFocus = null;
    }
  }

  closeBtn.addEventListener('click', closeOverlay);
  backdrop.addEventListener('click', closeOverlay);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeOverlay();
    if (e.key === 'Tab' && !modal.hidden) trapFocus(e);
  });

  // Listen for hash changes to open overlays
  function checkHash() {
    const hash = window.location.hash.substring(1);
    if (hash && overlays[hash]) {
      openOverlay(hash);
    }
  }

  window.addEventListener('hashchange', checkHash);

  // Also intercept overlay link clicks on the page
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="#overlay-"]');
    if (link) {
      e.preventDefault();
      const id = link.href.split('#overlay-')[1] || link.getAttribute('href').split('#overlay-')[1];
      if (id) {
        window.location.hash = `overlay-${id}`;
      }
    }
  });

  block.textContent = '';
  block.append(modal);

  // Check initial hash
  checkHash();
}
