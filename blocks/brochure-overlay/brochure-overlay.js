export default async function decorate(block) {
  const overlayIds = [];
  const overlays = {};
  const rows = [...block.children];

  // Parse overlay content from authored rows
  // Row format: | overlay-id | content (heading, text, image) |
  rows.forEach((row) => {
    const cols = [...row.children];
    const id = cols[0]?.textContent?.trim();
    const content = cols[1];
    if (id && content) {
      overlayIds.push(id);
      overlays[id] = content.innerHTML;
    }
  });

  // Build overlay modal
  const modal = document.createElement("div");
  modal.className = "brochure-overlay-modal";
  modal.hidden = true;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  const backdrop = document.createElement("div");
  backdrop.className = "brochure-overlay-backdrop";

  const container = document.createElement("div");
  container.className = "brochure-overlay-container";

  const closeBtn = document.createElement("button");
  closeBtn.className = "brochure-overlay-close";
  closeBtn.setAttribute("aria-label", "Close overlay");
  closeBtn.innerHTML =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

  const contentEl = document.createElement("div");
  contentEl.className = "brochure-overlay-content";

  const imageEl = document.createElement("div");
  imageEl.className = "brochure-overlay-image";
  imageEl.hidden = true;

  container.append(contentEl, imageEl);

  // Navigation arrows
  const prevBtn = document.createElement("button");
  prevBtn.className = "brochure-overlay-prev";
  prevBtn.setAttribute("aria-label", "Previous");
  prevBtn.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 4l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  const nextBtn = document.createElement("button");
  nextBtn.className = "brochure-overlay-next";
  nextBtn.setAttribute("aria-label", "Next");
  nextBtn.innerHTML =
    '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  modal.append(backdrop, closeBtn, prevBtn, container, nextBtn);

  const FOCUSABLE =
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
  let previousFocus = null;
  let activeIndex = -1;

  function trapFocus(e) {
    if (modal.hidden) return;
    const focusable = [...modal.querySelectorAll(FOCUSABLE)];
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

  function populateContent(id) {
    const html = overlays[id];
    if (!html) return;

    // Parse content to separate text from images
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const img = temp.querySelector("picture, img");

    contentEl.innerHTML = "";
    imageEl.innerHTML = "";

    if (img) {
      const imgNode = img.closest("picture") || img;
      imgNode.remove();
      imageEl.append(imgNode);
      imageEl.hidden = false;
    } else {
      imageEl.hidden = true;
    }

    contentEl.innerHTML = temp.innerHTML;
  }

  function openOverlay(id) {
    if (!overlays[id]) return;
    previousFocus = document.activeElement;
    activeIndex = overlayIds.indexOf(id);
    populateContent(id);
    modal.hidden = false;
    document.body.style.overflow = "hidden";

    // Show/hide nav arrows
    prevBtn.hidden = overlayIds.length <= 1;
    nextBtn.hidden = overlayIds.length <= 1;

    closeBtn.focus();
  }

  function closeOverlay() {
    modal.hidden = true;
    document.body.style.overflow = "";
    contentEl.innerHTML = "";
    imageEl.innerHTML = "";
    imageEl.hidden = true;
    activeIndex = -1;
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    if (previousFocus) {
      previousFocus.focus();
      previousFocus = null;
    }
  }

  function navigate(direction) {
    if (overlayIds.length <= 1) return;
    activeIndex =
      (activeIndex + direction + overlayIds.length) % overlayIds.length;
    const id = overlayIds[activeIndex];
    populateContent(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  closeBtn.addEventListener("click", closeOverlay);
  backdrop.addEventListener("click", closeOverlay);
  prevBtn.addEventListener("click", () => navigate(-1));
  nextBtn.addEventListener("click", () => navigate(1));

  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeOverlay();
    if (e.key === "Tab") trapFocus(e);
    if (e.key === "ArrowLeft") navigate(-1);
    if (e.key === "ArrowRight") navigate(1);
  });

  // Listen for hash changes to open overlays
  function checkHash() {
    const hash = window.location.hash.substring(1);
    if (hash && overlays[hash]) {
      openOverlay(hash);
    }
  }

  window.addEventListener("hashchange", checkHash);

  // Also intercept overlay link clicks on the page
  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href*="#overlay-"]');
    if (link) {
      e.preventDefault();
      const id =
        link.href.split("#overlay-")[1] ||
        link.getAttribute("href").split("#overlay-")[1];
      if (id) {
        window.location.hash = `overlay-${id}`;
      }
    }
  });

  block.textContent = "";
  block.append(modal);

  // Check initial hash
  checkHash();
}
