/**
 * Renders the appointment date and time picker.
 * Fetches availability from the API and displays a calendar + time slots.
 * @param {object} fieldConfig - Field configuration
 * @param {object} formState - Current form state
 * @param {function} onChange - Callback (fieldId, value)
 * @param {object} api - API client instance
 * @returns {HTMLElement}
 */
export default function appointmentPicker(fieldConfig, formState, onChange, api) {
  const { id } = fieldConfig;
  const currentValue = formState.values[id];
  const retailer = formState.values.retailerId;
  const model = formState.values.moi;

  const wrapper = document.createElement('div');
  wrapper.className = 'fw-field fw-field--appointment-picker';
  wrapper.dataset.fieldId = id;

  if (!retailer?.id || !model?.treeRef) {
    wrapper.innerHTML = '<p class="fw-field-info">Please select a model and centre first.</p>';
    return wrapper;
  }

  // Loading state
  wrapper.innerHTML = '<div class="fw-loading-spinner" aria-label="Loading availability..."></div>';
  loadAvailability(wrapper, api, retailer, model, id, currentValue, onChange);

  return wrapper;
}

async function loadAvailability(wrapper, api, retailer, model, fieldId, currentValue, onChange) {
  const start = new Date();
  start.setHours(23, 0, 0, 0);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  try {
    const availability = await api.getAvailability(
      retailer.id,
      model.treeRef,
      start.toISOString(),
      end.toISOString(),
    );

    wrapper.textContent = '';

    // Filter to days with available times
    const availableDays = availability.filter((day) => day.times && day.times.length > 0);

    if (!availableDays.length) {
      wrapper.innerHTML = '<p class="fw-no-results">No appointments available this month. Please try a different centre or check back later.</p>';
      return;
    }

    // Calendar layout
    const container = document.createElement('div');
    container.className = 'fw-appointment-container';

    // Date list
    const dateList = document.createElement('div');
    dateList.className = 'fw-date-list';
    dateList.setAttribute('role', 'listbox');
    dateList.setAttribute('aria-label', 'Available dates');

    // Time slots container
    const timeSlots = document.createElement('div');
    timeSlots.className = 'fw-time-slots';
    timeSlots.setAttribute('aria-live', 'polite');

    let selectedDate = currentValue?.date || null;

    availableDays.forEach((day) => {
      const dateObj = new Date(day.availableDate);
      const dateBtn = document.createElement('button');
      dateBtn.type = 'button';
      dateBtn.className = 'fw-date-btn';
      if (selectedDate && day.availableDate.startsWith(selectedDate.slice(0, 10))) {
        dateBtn.classList.add('fw-date-btn--selected');
      }

      dateBtn.innerHTML = `
        <span class="fw-date-day">${dateObj.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
        <span class="fw-date-num">${dateObj.getDate()}</span>
        <span class="fw-date-month">${dateObj.toLocaleDateString('en-GB', { month: 'short' })}</span>
      `;

      dateBtn.addEventListener('click', () => {
        dateList.querySelectorAll('.fw-date-btn--selected').forEach((el) => {
          el.classList.remove('fw-date-btn--selected');
        });
        dateBtn.classList.add('fw-date-btn--selected');
        selectedDate = day.availableDate;
        renderTimeSlots(timeSlots, day, fieldId, currentValue, onChange);
      });

      dateList.appendChild(dateBtn);
    });

    container.appendChild(dateList);
    container.appendChild(timeSlots);
    wrapper.appendChild(container);

    // If a date was previously selected, show its time slots
    if (selectedDate) {
      const selectedDay = availableDays.find((d) => d.availableDate.startsWith(selectedDate.slice(0, 10)));
      if (selectedDay) {
        renderTimeSlots(timeSlots, selectedDay, fieldId, currentValue, onChange);
      }
    }
  } catch (err) {
    wrapper.textContent = '';
    wrapper.innerHTML = `
      <div class="fw-field-api-error">
        <p>Unable to load availability. Please try again.</p>
        <button type="button" class="fw-retry-btn">Try again</button>
      </div>
    `;
    wrapper.querySelector('.fw-retry-btn').addEventListener('click', () => {
      wrapper.textContent = '';
      wrapper.innerHTML = '<div class="fw-loading-spinner" aria-label="Loading availability..."></div>';
      loadAvailability(wrapper, api, retailer, model, fieldId, currentValue, onChange);
    });
  }
}

function renderTimeSlots(container, day, fieldId, currentValue, onChange) {
  container.textContent = '';

  const availableTimes = day.times.filter((t) => t.available);
  if (!availableTimes.length) {
    container.innerHTML = '<p class="fw-no-results">No times available on this date.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'fw-time-grid';
  grid.setAttribute('role', 'listbox');
  grid.setAttribute('aria-label', 'Available times');

  availableTimes.forEach((slot) => {
    const startTime = new Date(slot.startTime);
    const endTime = new Date(slot.endTime);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fw-time-btn';

    if (currentValue?.start === slot.startTime) {
      btn.classList.add('fw-time-btn--selected');
    }

    btn.textContent = `${formatTime(startTime)} – ${formatTime(endTime)}`;

    btn.addEventListener('click', () => {
      grid.querySelectorAll('.fw-time-btn--selected').forEach((el) => {
        el.classList.remove('fw-time-btn--selected');
      });
      btn.classList.add('fw-time-btn--selected');

      onChange(fieldId, {
        date: day.availableDate,
        start: slot.startTime,
        end: slot.endTime,
        bookableId: day.bookableId,
      });
    });

    grid.appendChild(btn);
  });

  container.appendChild(grid);
}

function formatTime(date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
