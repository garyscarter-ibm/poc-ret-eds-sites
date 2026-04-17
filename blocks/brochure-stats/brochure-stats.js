const LOCK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
</svg>`;

export default async function decorate(block) {
  const rows = [...block.children];
  const grid = document.createElement("div");
  grid.className = "brochure-stats-grid";

  rows.forEach((row) => {
    const cols = [...row.children];
    const stat = document.createElement("div");
    stat.className = "brochure-stat animate-child";

    // Col 0: value | Col 1: label | Col 2 (optional): locked / unlocked
    const valueEl = cols[0];
    const labelEl = cols[1];
    const toggleEl = cols[2];
    const toggleText = toggleEl
      ? toggleEl.textContent.trim().toLowerCase()
      : "";
    const isLocked = toggleText === "locked";

    if (valueEl) {
      const value = document.createElement("div");
      value.className = "brochure-stat-value";
      value.textContent = valueEl.textContent.trim();
      stat.append(value);
    }

    if (labelEl) {
      const label = document.createElement("div");
      label.className = "brochure-stat-label";
      label.textContent = labelEl.textContent.trim();
      stat.append(label);
    }

    // Per-stat lock badge
    if (isLocked) {
      stat.classList.add("locked");

      const badge = document.createElement("div");
      badge.className = "brochure-stats-badge";

      const icon = document.createElement("div");
      icon.className = "brochure-stats-icon";
      icon.innerHTML = LOCK_ICON;

      const badgeLabel = document.createElement("span");
      badgeLabel.className = "brochure-stats-badge-label";
      badgeLabel.textContent = "Coming Soon";

      badge.append(icon, badgeLabel);
      stat.append(badge);
    }

    grid.append(stat);
  });

  block.textContent = "";

  // Full-block lock: block option "locked" or every stat individually locked
  const blockOptionLocked = block.classList.contains("locked");
  const stats = [...grid.children];
  const allLocked =
    blockOptionLocked ||
    (stats.length > 0 && stats.every((s) => s.classList.contains("locked")));

  if (allLocked) {
    // Remove per-stat badges and locked class
    stats.forEach((s) => {
      s.classList.remove("locked");
      s.querySelector(".brochure-stats-badge")?.remove();
    });

    block.classList.add("all-locked");

    const inner = document.createElement("div");
    inner.className = "brochure-stats-locked-inner";

    const frost = document.createElement("div");
    frost.className = "brochure-stats-frost";

    const badge = document.createElement("div");
    badge.className = "brochure-stats-badge";

    const icon = document.createElement("div");
    icon.className = "brochure-stats-icon";
    icon.innerHTML = LOCK_ICON;

    const badgeLabel = document.createElement("span");
    badgeLabel.className = "brochure-stats-badge-label";
    badgeLabel.textContent = "Coming Soon";

    badge.append(icon, badgeLabel);
    inner.append(grid, frost, badge);
    block.append(inner);
  } else {
    block.append(grid);
  }
}
