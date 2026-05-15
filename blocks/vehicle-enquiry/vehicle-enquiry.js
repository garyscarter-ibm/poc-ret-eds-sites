import queryAPI from "../../scripts/used-cars-api.js";

/* ---------- GraphQL ---------- */

const VEHICLE_MODEL_QUERY = `query GetVehicleModel($id: ID!) {
  usedVehicle(id: $id) { id model }
}`;

const ENQUIRY_MUTATION = `mutation SubmitEnquiry($input: VehicleEnquiryInput!) {
  submitVehicleEnquiry(input: $input) { id success message }
}`;

/* ---------- Helpers ---------- */

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

/* ---------- Main Decorate ---------- */

export default async function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const vehicleId = params.get("id");

  if (!vehicleId) {
    block.innerHTML = '<p class="ve-empty">No vehicle selected.</p>';
    return;
  }

  // Fetch vehicle model name for display
  let vehicleModel = "this vehicle";
  try {
    const data = await queryAPI(VEHICLE_MODEL_QUERY, { id: vehicleId });
    if (data.usedVehicle?.model) vehicleModel = data.usedVehicle.model;
  } catch {
    /* fallback to generic text */
  }

  block.textContent = "";

  const section = el("div", "ve-inner");
  section.id = "enquire";
  section.innerHTML = `
    <h2 class="ve-title">Enquire About This Vehicle</h2>
    <p class="ve-subtitle">Interested in the ${vehicleModel}? Fill in your details and a dealer will be in touch.</p>
    <form class="ve-form" novalidate>
      <div class="ve-form-row">
        <label class="ve-form-field">
          <span class="ve-form-label">Full Name *</span>
          <input type="text" name="customerName" required autocomplete="name">
        </label>
        <label class="ve-form-field">
          <span class="ve-form-label">Email *</span>
          <input type="email" name="customerEmail" required autocomplete="email">
        </label>
      </div>
      <div class="ve-form-row">
        <label class="ve-form-field">
          <span class="ve-form-label">Phone *</span>
          <input type="tel" name="customerPhone" required autocomplete="tel">
        </label>
        <label class="ve-form-field">
          <span class="ve-form-label">Preferred Contact</span>
          <select name="preferredContactMethod">
            <option value="EMAIL">Email</option>
            <option value="PHONE">Phone</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </label>
      </div>
      <label class="ve-form-field ve-form-field--full">
        <span class="ve-form-label">Message</span>
        <textarea name="message" rows="3" placeholder="Any questions about this vehicle?"></textarea>
      </label>
      <div class="ve-form-checkboxes">
        <label class="ve-checkbox"><input type="checkbox" name="interestedInFinance"> I'm interested in finance options</label>
        <label class="ve-checkbox"><input type="checkbox" name="interestedInPartExchange"> I have a vehicle to part-exchange</label>
      </div>
      <button type="submit" class="ve-btn ve-btn--primary ve-submit">Send Enquiry</button>
      <div class="ve-status" aria-live="polite"></div>
    </form>`;

  const form = section.querySelector("form");
  const status = section.querySelector(".ve-status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    status.className = "ve-status";

    const fd = new FormData(form);
    const name = fd.get("customerName")?.trim();
    const email = fd.get("customerEmail")?.trim();
    const phone = fd.get("customerPhone")?.trim();

    if (!name || !email || !phone) {
      status.textContent = "Please fill in all required fields.";
      status.classList.add("ve-status--error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      status.textContent = "Please enter a valid email address.";
      status.classList.add("ve-status--error");
      return;
    }

    const submitBtn = form.querySelector(".ve-submit");
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
        status.classList.add("ve-status--success");
        form.reset();
      } else {
        throw new Error(
          data.submitVehicleEnquiry?.message || "Submission failed",
        );
      }
    } catch (err) {
      status.textContent = `Something went wrong. Please try again. (${err.message})`;
      status.classList.add("ve-status--error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Enquiry";
    }
  });

  block.append(section);
}
