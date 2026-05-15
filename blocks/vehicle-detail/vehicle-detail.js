import queryAPI from "../../scripts/used-cars-api.js";
import {
  formatPrice,
  formatMileage,
  formatDate,
  formatFuelType,
  formatTransmission,
  formatPower,
  formatTorque,
  formatAcceleration,
  formatTopSpeed,
  formatDimension,
  formatWeight,
  formatVolume,
  formatDrivetrain,
  formatMonthly,
  getUserId,
} from "../../scripts/used-cars-config.js";

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

const ENQUIRY_MUTATION = `mutation SubmitEnquiry($input: VehicleEnquiryInput!) {
  submitVehicleEnquiry(input: $input) { id success message }
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

/* ---------- Helpers ---------- */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

function specRow(label, value) {
  if (!value || value === "—") return "";
  return `<div class="vd-spec-row"><span class="vd-spec-label">${label}</span><span class="vd-spec-value">${value}</span></div>`;
}

/* ---------- Skeleton ---------- */

function renderSkeleton(block) {
  block.innerHTML = `
    <div class="vd-skeleton">
      <div class="vd-skeleton-gallery"><div class="vd-skeleton-shimmer"></div></div>
      <div class="vd-skeleton-body">
        <div class="vd-skeleton-line vd-skeleton-line--wide"></div>
        <div class="vd-skeleton-line vd-skeleton-line--medium"></div>
        <div class="vd-skeleton-line vd-skeleton-line--narrow"></div>
        <div class="vd-skeleton-line vd-skeleton-line--wide"></div>
        <div class="vd-skeleton-line vd-skeleton-line--medium"></div>
      </div>
    </div>`;
}

/* ---------- Error State ---------- */

function renderError(block, message) {
  block.innerHTML = `
    <div class="vd-error">
      <h2>Vehicle not found</h2>
      <p>${message}</p>
      <a href="/used-cars/inventory" class="vd-error-link">Back to search results</a>
    </div>`;
}

/* ---------- Image Gallery ---------- */

function renderGallery(images) {
  const sorted = [...images].sort((a, b) => a.order - b.order);
  const gallery = el("div", "vd-gallery");

  const chevronLeft =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18L9 12L15 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const chevronRight =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Main image area with crossfade layers
  const main = el("div", "vd-gallery-main");
  const imgCurrent = document.createElement("img");
  imgCurrent.className = "vd-gallery-img vd-gallery-img--active";
  imgCurrent.src = sorted[0]?.url || "";
  imgCurrent.alt = sorted[0]?.alt || "Vehicle image";
  imgCurrent.loading = "eager";
  const imgNext = document.createElement("img");
  imgNext.className = "vd-gallery-img";
  imgNext.loading = "eager";
  main.append(imgCurrent, imgNext);

  // Navigation arrows (inline SVG, no circles)
  const prevBtn = el("button", "vd-gallery-nav vd-gallery-prev");
  prevBtn.innerHTML = chevronLeft;
  prevBtn.setAttribute("aria-label", "Previous image");
  const nextBtn = el("button", "vd-gallery-nav vd-gallery-next");
  nextBtn.innerHTML = chevronRight;
  nextBtn.setAttribute("aria-label", "Next image");
  main.append(prevBtn, nextBtn);

  // Counter
  const counter = el("div", "vd-gallery-counter", `1 / ${sorted.length}`);
  main.append(counter);

  gallery.append(main);

  // Thumbnails
  const thumbStrip = el("div", "vd-gallery-thumbs");
  sorted.forEach((img, i) => {
    const thumb = document.createElement("img");
    thumb.src = img.url;
    thumb.alt = img.alt || `Image ${i + 1}`;
    thumb.loading = "lazy";
    thumb.className = i === 0 ? "vd-thumb active" : "vd-thumb";
    thumb.dataset.index = i;
    thumbStrip.append(thumb);
  });
  gallery.append(thumbStrip);

  // Gallery logic with crossfade
  let current = 0;
  let transitioning = false;

  function goTo(idx) {
    const next = (idx + sorted.length) % sorted.length;
    if (next === current || transitioning) return;
    transitioning = true;

    // Prepare next image behind
    imgNext.src = sorted[next].url;
    imgNext.alt = sorted[next].alt || `Image ${next + 1}`;
    imgNext.classList.add("vd-gallery-img--active");

    // Fade out current
    imgCurrent.classList.add("vd-gallery-img--fading");

    setTimeout(() => {
      // Swap: put new image in the current layer
      imgCurrent.src = sorted[next].url;
      imgCurrent.alt = sorted[next].alt || `Image ${next + 1}`;
      imgCurrent.classList.remove("vd-gallery-img--fading");
      imgNext.classList.remove("vd-gallery-img--active");
      current = next;
      transitioning = false;
    }, 350);

    // Update counter and thumbs immediately
    counter.textContent = `${next + 1} / ${sorted.length}`;
    thumbStrip.querySelectorAll(".vd-thumb").forEach((t, i) => {
      t.classList.toggle("active", i === next);
    });
    const activeThumb = thumbStrip.querySelector(".vd-thumb.active");
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));
  thumbStrip.addEventListener("click", (e) => {
    if (e.target.dataset.index != null) goTo(Number(e.target.dataset.index));
  });

  return gallery;
}

/* ---------- Key Facts Bar ---------- */

function renderKeyFacts(vehicle) {
  const facts = el("div", "vd-key-facts");
  const items = [
    { label: "Mileage", value: formatMileage(vehicle.mileage) },
    { label: "Registered", value: formatDate(vehicle.registrationDate) },
    { label: "Fuel", value: formatFuelType(vehicle.fuelType) },
    { label: "Transmission", value: formatTransmission(vehicle.transmission) },
    { label: "Drivetrain", value: formatDrivetrain(vehicle.drivetrain) },
    {
      label: "Body",
      value: vehicle.bodyType
        ? vehicle.bodyType.charAt(0) + vehicle.bodyType.slice(1).toLowerCase()
        : "—",
    },
  ];
  items.forEach(({ label, value }) => {
    if (value && value !== "—") {
      facts.append(
        el(
          "div",
          "vd-fact",
          `<span class="vd-fact-label">${label}</span><span class="vd-fact-value">${value}</span>`,
        ),
      );
    }
  });
  return facts;
}

/* ---------- Overview / Header ---------- */

function renderOverview(vehicle, isSaved, onToggleSave) {
  const overview = el("div", "vd-overview");

  // Left column: title + details
  const left = el("div", "vd-overview-left");
  const h1 = el("h1", "vd-title", vehicle.model);
  left.append(h1);

  const details = el("div", "vd-overview-details");
  if (vehicle.colour)
    details.append(el("span", "vd-detail-tag", vehicle.colour));
  if (vehicle.upholstery)
    details.append(el("span", "vd-detail-tag", vehicle.upholstery));
  if (vehicle.registrationNumber)
    details.append(el("span", "vd-detail-tag", vehicle.registrationNumber));
  left.append(details);
  overview.append(left);

  // Right column: price card
  const right = el("div", "vd-price-card");
  right.innerHTML = `
    <div class="vd-price">${formatPrice(vehicle.price)}</div>
    ${vehicle.estimatedMonthlyPayment ? `<div class="vd-monthly">From ${formatMonthly(vehicle.estimatedMonthlyPayment)} PCP</div>` : ""}
    <div class="vd-price-ctas">
      <a href="#enquire" class="vd-btn vd-btn--primary">Enquire Now</a>
      <a href="#enquire" class="vd-btn vd-btn--secondary">Book a Test Drive</a>
    </div>`;

  // Heart/save button
  const heartBtn = el("button", `vd-heart-btn${isSaved ? " saved" : ""}`);
  heartBtn.innerHTML = `<img src="/icons/${isSaved ? "heart-filled" : "heart"}.svg" alt="Save" width="24" height="24">`;
  heartBtn.setAttribute(
    "aria-label",
    isSaved ? "Remove from saved" : "Save vehicle",
  );
  heartBtn.addEventListener("click", () => onToggleSave(heartBtn));
  right.append(heartBtn);

  overview.append(right);
  return overview;
}

/* ---------- Specifications ---------- */

function renderSpecs(vehicle) {
  const section = el("div", "vd-specs");
  section.innerHTML = '<h2 class="vd-section-title">Specifications</h2>';

  const tabs = el("div", "vd-tabs");
  const tabNav = el("div", "vd-tab-nav");
  const tabPanels = el("div", "vd-tab-panels");

  const tabData = [
    {
      id: "performance",
      label: "Performance",
      content: [
        specRow("Power", formatPower(vehicle.power)),
        specRow("Torque", formatTorque(vehicle.torque)),
        specRow("0-62 mph", formatAcceleration(vehicle.acceleration)),
        specRow("Top Speed", formatTopSpeed(vehicle.topSpeed)),
        specRow("Insurance Group", vehicle.insuranceGroup),
      ].join(""),
    },
    {
      id: "efficiency",
      label: "Efficiency",
      content: [
        specRow(
          "CO₂ Emissions",
          vehicle.co2Emissions ? `${vehicle.co2Emissions} g/km` : null,
        ),
        specRow(
          "MPG (Combined)",
          vehicle.mpgCombined ? `${vehicle.mpgCombined} mpg` : null,
        ),
        specRow(
          "MPG (Urban)",
          vehicle.mpgUrban ? `${vehicle.mpgUrban} mpg` : null,
        ),
        specRow(
          "MPG (Extra Urban)",
          vehicle.mpgExtraUrban ? `${vehicle.mpgExtraUrban} mpg` : null,
        ),
        specRow(
          "Electric Range",
          vehicle.electricRange ? `${vehicle.electricRange} miles` : null,
        ),
        specRow(
          "Electric Range (City)",
          vehicle.electricRangeCity
            ? `${vehicle.electricRangeCity} miles`
            : null,
        ),
        specRow(
          "Energy Consumption",
          vehicle.energyConsumption
            ? `${vehicle.energyConsumption} kWh/100km`
            : null,
        ),
      ].join(""),
    },
    {
      id: "dimensions",
      label: "Dimensions",
      content: [
        specRow("Length", formatDimension(vehicle.length)),
        specRow("Width", formatDimension(vehicle.width)),
        specRow("Height", formatDimension(vehicle.height)),
        specRow("Weight", formatWeight(vehicle.weight)),
        specRow("Boot Volume", formatVolume(vehicle.bootVolume)),
      ].join(""),
    },
  ];

  // Filter out tabs with no content
  const activeTabs = tabData.filter((t) => t.content.trim().length > 0);

  activeTabs.forEach((tab, i) => {
    const btn = el(
      "button",
      `vd-tab-btn${i === 0 ? " active" : ""}`,
      tab.label,
    );
    btn.dataset.tab = tab.id;
    btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
    tabNav.append(btn);

    const panel = el("div", `vd-tab-panel${i === 0 ? " active" : ""}`);
    panel.dataset.tab = tab.id;
    panel.innerHTML = tab.content;
    tabPanels.append(panel);
  });

  tabNav.addEventListener("click", (e) => {
    const btn = e.target.closest(".vd-tab-btn");
    if (!btn) return;
    tabNav.querySelectorAll(".vd-tab-btn").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    tabPanels
      .querySelectorAll(".vd-tab-panel")
      .forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    tabPanels
      .querySelector(`[data-tab="${btn.dataset.tab}"]`)
      .classList.add("active");
  });

  tabs.append(tabNav, tabPanels);
  section.append(tabs);
  return section;
}

/* ---------- Features ---------- */

function renderFeatures(vehicle) {
  const { standardFeatures, optionalPacks } = vehicle;
  if (
    (!standardFeatures || !standardFeatures.length) &&
    (!optionalPacks || !optionalPacks.length)
  )
    return null;

  const section = el("div", "vd-features");
  section.innerHTML =
    '<h2 class="vd-section-title">Features &amp; Equipment</h2>';

  if (standardFeatures && standardFeatures.length) {
    const list = el("div", "vd-features-list");
    standardFeatures.forEach((f) =>
      list.append(el("span", "vd-feature-pill", f)),
    );
    section.append(el("h3", "vd-features-subtitle", "Standard Features"), list);
  }

  if (optionalPacks && optionalPacks.length) {
    const list = el("div", "vd-features-list");
    optionalPacks.forEach((p) =>
      list.append(el("span", "vd-feature-pill vd-feature-pill--highlight", p)),
    );
    section.append(el("h3", "vd-features-subtitle", "Optional Packs"), list);
  }

  return section;
}

/* ---------- Dealer Info ---------- */

function renderDealer(dealer) {
  if (!dealer) return null;
  const section = el("div", "vd-dealer");
  section.innerHTML = `
    <h2 class="vd-section-title">Dealer</h2>
    <div class="vd-dealer-card">
      <h3 class="vd-dealer-name">${dealer.name}</h3>
      ${dealer.address ? `<p class="vd-dealer-address">${dealer.address}${dealer.postcode ? `, ${dealer.postcode}` : ""}</p>` : ""}
      ${dealer.phone ? `<a href="tel:${dealer.phone}" class="vd-dealer-phone">${dealer.phone}</a>` : ""}
      ${dealer.latitude && dealer.longitude ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${dealer.latitude},${dealer.longitude}" target="_blank" rel="noopener" class="vd-btn vd-btn--secondary vd-dealer-directions">Get Directions</a>` : ""}
    </div>`;
  return section;
}

/* ---------- Enquiry Form ---------- */

function renderEnquiryForm(vehicleId, vehicleModel) {
  const section = el("div", "vd-enquiry");
  section.id = "enquire";
  section.innerHTML = `
    <h2 class="vd-section-title">Enquire About This Vehicle</h2>
    <p class="vd-enquiry-subtitle">Interested in the ${vehicleModel}? Fill in your details and a dealer will be in touch.</p>
    <form class="vd-enquiry-form" novalidate>
      <div class="vd-form-row">
        <label class="vd-form-field">
          <span class="vd-form-label">Full Name *</span>
          <input type="text" name="customerName" required autocomplete="name">
        </label>
        <label class="vd-form-field">
          <span class="vd-form-label">Email *</span>
          <input type="email" name="customerEmail" required autocomplete="email">
        </label>
      </div>
      <div class="vd-form-row">
        <label class="vd-form-field">
          <span class="vd-form-label">Phone *</span>
          <input type="tel" name="customerPhone" required autocomplete="tel">
        </label>
        <label class="vd-form-field">
          <span class="vd-form-label">Preferred Contact</span>
          <select name="preferredContactMethod">
            <option value="EMAIL">Email</option>
            <option value="PHONE">Phone</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </label>
      </div>
      <label class="vd-form-field vd-form-field--full">
        <span class="vd-form-label">Message</span>
        <textarea name="message" rows="3" placeholder="Any questions about this vehicle?"></textarea>
      </label>
      <div class="vd-form-checkboxes">
        <label class="vd-checkbox"><input type="checkbox" name="interestedInFinance"> I'm interested in finance options</label>
        <label class="vd-checkbox"><input type="checkbox" name="interestedInPartExchange"> I have a vehicle to part-exchange</label>
      </div>
      <button type="submit" class="vd-btn vd-btn--primary vd-enquiry-submit">Send Enquiry</button>
      <div class="vd-enquiry-status" aria-live="polite"></div>
    </form>`;

  const form = section.querySelector("form");
  const status = section.querySelector(".vd-enquiry-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    status.className = "vd-enquiry-status";

    const fd = new FormData(form);
    const name = fd.get("customerName")?.trim();
    const email = fd.get("customerEmail")?.trim();
    const phone = fd.get("customerPhone")?.trim();

    if (!name || !email || !phone) {
      status.textContent = "Please fill in all required fields.";
      status.classList.add("vd-enquiry-status--error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = "Please enter a valid email address.";
      status.classList.add("vd-enquiry-status--error");
      return;
    }

    const submitBtn = form.querySelector(".vd-enquiry-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      const input = {
        vehicleId,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        message: fd.get("message")?.trim() || undefined,
        preferredContactMethod: fd.get("preferredContactMethod"),
        interestedInFinance: fd.get("interestedInFinance") === "on",
        interestedInPartExchange: fd.get("interestedInPartExchange") === "on",
      };
      const data = await queryAPI(ENQUIRY_MUTATION, { input });
      if (data.submitVehicleEnquiry?.success) {
        status.textContent =
          "Enquiry sent successfully! A dealer will be in touch shortly.";
        status.classList.add("vd-enquiry-status--success");
        form.reset();
      } else {
        throw new Error(
          data.submitVehicleEnquiry?.message || "Submission failed",
        );
      }
    } catch (err) {
      status.textContent = `Something went wrong. Please try again. (${err.message})`;
      status.classList.add("vd-enquiry-status--error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Enquiry";
    }
  });

  return section;
}

/* ---------- Back Navigation ---------- */

function renderBackLink() {
  const nav = el("div", "vd-back");
  const link = el("a", "vd-back-link", "← Back to search results");
  link.href =
    document.referrer && document.referrer.includes("/used-cars/")
      ? document.referrer
      : "/used-cars/inventory";
  nav.append(link);
  return nav;
}

/* ---------- Main Decorate ---------- */

export default async function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const vehicleId = params.get("id");

  if (!vehicleId) {
    renderError(
      block,
      "No vehicle ID provided. Please select a vehicle from the search results.",
    );
    return;
  }

  renderSkeleton(block);

  // Fetch vehicle + garage status in parallel
  let vehicle;
  let garageIds = [];

  try {
    const userId = getUserId();
    const [vehicleData, garageData] = await Promise.allSettled([
      queryAPI(VEHICLE_QUERY, { id: vehicleId }),
      queryAPI(GARAGE_IDS, { userId }),
    ]);

    if (vehicleData.status === "rejected" || !vehicleData.value?.usedVehicle) {
      renderError(
        block,
        "This vehicle could not be found. It may have been sold or removed.",
      );
      return;
    }

    vehicle = vehicleData.value.usedVehicle;
    if (garageData.status === "fulfilled")
      garageIds = garageData.value?.garageVehicleIds || [];
  } catch (err) {
    renderError(block, `Failed to load vehicle details. ${err.message}`);
    return;
  }

  // Update page title
  document.title = `${vehicle.model} | BMW Used Cars`;

  // Clear skeleton and render
  block.textContent = "";
  const isSaved = garageIds.includes(vehicleId);

  // Toggle save handler
  async function onToggleSave(btn) {
    const userId = getUserId();
    const currentlySaved = btn.classList.contains("saved");
    btn.classList.toggle("saved");
    btn.querySelector("img").src =
      `/icons/${currentlySaved ? "heart" : "heart-filled"}.svg`;
    btn.setAttribute(
      "aria-label",
      currentlySaved ? "Save vehicle" : "Remove from saved",
    );
    try {
      if (currentlySaved) {
        await queryAPI(GARAGE_REMOVE, { userId, vehicleId });
      } else {
        await queryAPI(GARAGE_ADD, { userId, vehicleId });
      }
    } catch {
      /* optimistic - ignore failures */
    }
  }

  // Build page sections
  block.append(renderBackLink());
  if (vehicle.images?.length) block.append(renderGallery(vehicle.images));
  block.append(renderOverview(vehicle, isSaved, onToggleSave));
  block.append(renderKeyFacts(vehicle));
  block.append(renderSpecs(vehicle));

  const features = renderFeatures(vehicle);
  if (features) block.append(features);

  const dealer = renderDealer(vehicle.dealer);
  if (dealer) block.append(dealer);

  // Dynamically load finance calculator block (before enquiry form)
  if (vehicle.financeAvailable) {
    const fcWrapper = el("div", "finance-calculator block");
    fcWrapper.dataset.blockName = "finance-calculator";
    block.append(fcWrapper);
    const fcCss = document.createElement("link");
    fcCss.rel = "stylesheet";
    fcCss.href = "/blocks/finance-calculator/finance-calculator.css";
    document.head.append(fcCss);
    const fcModule =
      await import("../finance-calculator/finance-calculator.js"); // eslint-disable-line import/no-unresolved
    await fcModule.default(fcWrapper);
  }

  block.append(renderEnquiryForm(vehicleId, vehicle.model));

  // Auto-scroll to enquiry form if hash is #enquire
  if (window.location.hash === "#enquire") {
    setTimeout(() => {
      document
        .getElementById("enquire")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }
}
