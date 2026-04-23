export default async function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const wrapper = document.createElement("div");
  wrapper.className = "brochure-hotspot-inner";

  // Detect rows by content: the image row contains an <img>, title row has headings/text,
  // hotspot rows have 3-4 columns with coordinate data.
  let titleRow = null;
  let imageRow = null;
  const hotspotRows = [];

  rows.forEach((row) => {
    const cols = [...row.children];
    const hasImg = row.querySelector("img");
    const colCount = cols.length;

    if (!imageRow && hasImg && colCount <= 2) {
      imageRow = row;
    } else if (
      !titleRow &&
      !hasImg &&
      colCount <= 2 &&
      row.querySelector("h2, h3, h4, h5, h6, p")
    ) {
      titleRow = row;
    } else if (colCount >= 3) {
      hotspotRows.push(row);
    }
  });

  // Title
  if (titleRow) {
    const titleEl = document.createElement("div");
    titleEl.className = "brochure-hotspot-title animate-child";
    const content = titleRow.querySelector(":scope > div") || titleRow;
    titleEl.append(...content.childNodes);
    wrapper.append(titleEl);
  }

  // Image container with hotspots
  const imageContainer = document.createElement("div");
  imageContainer.className = "brochure-hotspot-image-container animate-child";

  const img = imageRow?.querySelector("img");
  if (img) {
    img.loading = "lazy";
    const picture = img.closest("picture") || img;
    imageContainer.append(picture);
  }

  // Create hotspot buttons
  hotspotRows.forEach((row) => {
    const cols = [...row.children];
    // Strip <a> wrappers — CMS may wrap text in placeholder links
    cols.forEach((col) =>
      col.querySelectorAll("a").forEach((a) => a.replaceWith(a.textContent)),
    );
    const label = cols[0]?.textContent?.trim() || "";
    const xPos = cols[1]?.textContent?.trim() || "50";
    const yPos = cols[2]?.textContent?.trim() || "50";
    // Col 3 may be empty; overlay slug is in col 4 (or col 3 as fallback)
    const overlayId =
      cols[4]?.textContent?.trim() || cols[3]?.textContent?.trim() || "";

    const btn = document.createElement("button");
    btn.className = "brochure-hotspot-btn";
    btn.style.left = `${xPos}%`;
    btn.style.top = `${yPos}%`;
    btn.setAttribute("aria-label", label);
    btn.title = label;

    // Pulsing dot indicator
    btn.innerHTML = `<span class="brochure-hotspot-dot"></span><span class="brochure-hotspot-label">${label}</span>`;

    if (overlayId) {
      btn.addEventListener("click", () => {
        window.location.hash = `overlay-${overlayId}`;
      });
    }

    imageContainer.append(btn);
  });

  wrapper.append(imageContainer);
  block.textContent = "";
  block.append(wrapper);
}
