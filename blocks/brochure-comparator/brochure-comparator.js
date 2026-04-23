const MODELS = {
  x7: {
    name: "X7",
    image:
      "https://range-comparator.s3.amazonaws.com/uploads/scaled_image/20231109155036440489/G07%20-%20Side.png",
    length: 5181,
    height: 1835,
    doors: 5,
  },
  xm: {
    name: "XM",
    image:
      "https://range-comparator.s3.amazonaws.com/uploads/scaled_image/20221114072836171917/G09_XM%20Cape%20York%20Green%20Metallic%20sideview.png",
    length: 5110,
    height: 1755,
    doors: 5,
  },
};

const CAR_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="10" viewBox="0 0 61 25" fill="none"><path d="M60.8 13.1c-.2-.2-.4-.4-.5-.6-.6-.6-1-.2-1.2-.7s-.2-.9-.2-1.5V6.5l-4.4-.4-.3-.2c-3.2-1.8-5.6-3.3-8.2-4.3C43.2.5 40.5 0 36.9 0h-.2c-2.4 0-4.4 0-6.2.3-.8.1-1.5.3-2.3.6-2.3.8-4.7 2.3-8.5 5.5h-.4c-6.5.6-10 .9-12.4 1.4-2.5.6-3.9 1.4-6.5 2.9L0 11v8.5l.5.1c2.1.5 3.1.8 3.8.9.3.1.6.1.8.1l.4 0 .1.1.1.3c.9 2.4 3.1 3.9 5.6 3.9s4.7-1.5 5.6-3.8l.1-.3.1-.1h24.6l0 .1.1.3c.9 2.4 3.1 3.9 5.6 3.9s4.7-1.5 5.6-3.8l.1-.3.1-.1h.5c1.1 0 1.9-.1 2.8-.3 1.1-.3 2.3-.9 4.1-1.9l.4-.2v-5l-.2-.2z" fill="#999"/></svg>';

function buildSelector(m1, m2) {
  const el = document.createElement("div");
  el.className = "comparator-selector";
  el.innerHTML = `
    <h3 class="comparator-heading">MODEL SELECTION.</h3>
    <div class="comparator-models">
      <label class="comparator-model-btn active" data-model="x7">
        <span class="comparator-model-icon">${CAR_ICON}</span>
        <span class="comparator-model-name">${m1.name}</span>
        <span class="comparator-model-check">&#x2713;</span>
      </label>
      <label class="comparator-model-btn active" data-model="xm">
        <span class="comparator-model-icon">${CAR_ICON}</span>
        <span class="comparator-model-name">${m2.name}</span>
        <span class="comparator-model-check">&#x2713;</span>
      </label>
    </div>
    <div class="comparator-dim-toggle">
      <h3 class="comparator-heading">CHANGE DIMENSIONS.</h3>
      <div class="comparator-dim-btns">
        <button class="comparator-dim-btn active" data-dim="length">${CAR_ICON} Length</button>
        <button class="comparator-dim-btn" data-dim="height">${CAR_ICON} Height</button>
      </div>
    </div>
  `;
  return el;
}

function buildViewer(m1, m2) {
  const el = document.createElement("div");
  el.className = "comparator-viewer";
  el.innerHTML = `
    <div class="comparator-cars">
      <div class="comparator-car comparator-car-bottom">
        <img src="${m2.image}" alt="${m2.name} side view" loading="lazy">
      </div>
      <div class="comparator-car comparator-car-top">
        <img src="${m1.image}" alt="${m1.name} side view" loading="lazy">
      </div>
      <div class="comparator-divider">
        <div class="comparator-divider-line"></div>
        <button class="comparator-arrow-btn" aria-label="Adjust comparison">
          <span class="comparator-arrows">&#x25B2;<br>&#x25BC;</span>
        </button>
      </div>
    </div>
  `;

  // Make the divider draggable to reveal/hide the top car
  requestAnimationFrame(() => {
    const cars = el.querySelector(".comparator-cars");
    const topCar = el.querySelector(".comparator-car-top");
    const divider = el.querySelector(".comparator-divider");
    let clipPercent = 50;

    function updateClip(pct) {
      clipPercent = Math.max(5, Math.min(95, pct));
      topCar.style.clipPath = `inset(${clipPercent}% 0 0 0)`;
      divider.style.top = `${clipPercent}%`;
    }

    updateClip(50);

    let dragging = false;

    function onMove(clientY) {
      if (!dragging) return;
      const rect = cars.getBoundingClientRect();
      const pct = ((clientY - rect.top) / rect.height) * 100;
      updateClip(pct);
    }

    divider.addEventListener("mousedown", (e) => {
      e.preventDefault();
      dragging = true;
    });
    divider.addEventListener(
      "touchstart",
      () => {
        dragging = true;
      },
      { passive: true },
    );

    window.addEventListener("mousemove", (e) => onMove(e.clientY));
    window.addEventListener("touchmove", (e) => onMove(e.touches[0].clientY), {
      passive: true,
    });

    window.addEventListener("mouseup", () => {
      dragging = false;
    });
    window.addEventListener("touchend", () => {
      dragging = false;
    });

    // Prevent click from firing after drag
    const arrowBtn = el.querySelector(".comparator-arrow-btn");
    arrowBtn.addEventListener("click", (e) => {
      e.preventDefault();
    });
  });

  return el;
}

function buildTable(m1, m2, dim) {
  const diff = (a, b) => Math.abs(a - b);
  const dims =
    dim === "height"
      ? [{ label: "Height", v1: m1.height, v2: m2.height }]
      : [{ label: "Length", v1: m1.length, v2: m2.length }];

  dims.push({ label: "Number of doors", v1: m1.doors, v2: m2.doors });

  const el = document.createElement("div");
  el.className = "comparator-table";
  el.innerHTML = `
    <div class="comparator-table-header">
      <div class="comparator-table-cell comparator-table-label"><strong>Model dimensions.</strong></div>
      <div class="comparator-table-cell">${m1.name}</div>
      <div class="comparator-table-cell">${m2.name}</div>
      <div class="comparator-table-cell"><strong>Difference</strong></div>
    </div>
    ${dims
      .map(
        (d) => `
      <div class="comparator-table-row">
        <div class="comparator-table-cell comparator-table-label"><strong>${d.label}</strong></div>
        <div class="comparator-table-cell">${d.v1}${d.label !== "Number of doors" ? " mm" : ""}</div>
        <div class="comparator-table-cell">${d.v2}${d.label !== "Number of doors" ? " mm" : ""}</div>
        <div class="comparator-table-cell"><strong>${diff(d.v1, d.v2)}${d.label !== "Number of doors" ? " mm" : ""}</strong></div>
      </div>
    `,
      )
      .join("")}
  `;
  return el;
}

export default async function decorate(block) {
  const m1 = MODELS.x7;
  const m2 = MODELS.xm;

  const wrapper = document.createElement("div");
  wrapper.className = "comparator-inner";

  const selector = buildSelector(m1, m2);
  const viewer = buildViewer(m1, m2);
  const tableContainer = document.createElement("div");
  tableContainer.className = "comparator-table-wrap";
  tableContainer.append(buildTable(m1, m2, "length"));

  wrapper.append(selector, viewer, tableContainer);
  block.textContent = "";
  block.append(wrapper);

  // Dimension toggle
  selector.querySelectorAll(".comparator-dim-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selector
        .querySelectorAll(".comparator-dim-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      tableContainer.textContent = "";
      tableContainer.append(buildTable(m1, m2, btn.dataset.dim));
    });
  });
}
