/** Default number of results per page */
export const DEFAULT_PAGE_SIZE = 12;

/** Path to the vehicle detail page */
export const DETAIL_PAGE_PATH = '/vehicle';

/** Path to the enquiry page */
export const ENQUIRY_PAGE_PATH = '/enquire';

/** localStorage key for anonymous user ID */
const USER_ID_KEY = 'bmw-used-cars-user-id';

/**
 * Format a price as GBP with comma separators, no decimals.
 * @param {number} price
 * @returns {string} e.g. "£36,700"
 */
export function formatPrice(price) {
  return `£${Math.round(price).toLocaleString('en-GB')}`;
}

/**
 * Format mileage with comma separators.
 * @param {number} miles
 * @returns {string} e.g. "4,794 miles"
 */
export function formatMileage(miles) {
  if (miles == null) return '—';
  return `${miles.toLocaleString('en-GB')} miles`;
}

/**
 * Format an ISO date string to short month + year.
 * @param {string} isoDate e.g. "2024-01-15"
 * @returns {string} e.g. "Jan 2024"
 */
export function formatDate(isoDate) {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

/**
 * Humanise a fuel type enum value.
 * @param {string} fuelType e.g. "PETROL_PLUG_IN_HYBRID"
 * @returns {string} e.g. "Plug-in Hybrid"
 */
export function formatFuelType(fuelType) {
  const map = {
    PETROL: 'Petrol',
    DIESEL: 'Diesel',
    ELECTRIC: 'Electric',
    PETROL_PLUG_IN_HYBRID: 'Plug-in Hybrid',
    DIESEL_PLUG_IN_HYBRID: 'Plug-in Hybrid (Diesel)',
  };
  return map[fuelType] || fuelType;
}

/**
 * Humanise a transmission enum value.
 * @param {string} transmission
 * @returns {string}
 */
export function formatTransmission(transmission) {
  const map = {
    AUTOMATIC: 'Automatic',
    MANUAL: 'Manual',
  };
  return map[transmission] || transmission;
}

/**
 * Get or create a persistent anonymous user ID for garage/favourites.
 * @returns {string} UUID
 */
export function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

/**
 * Format power in bhp.
 * @param {number} hp
 * @returns {string} e.g. "347 bhp"
 */
export function formatPower(hp) {
  if (hp == null) return '—';
  return `${hp} bhp`;
}

/**
 * Format torque in Nm.
 * @param {number} nm
 * @returns {string} e.g. "700 Nm"
 */
export function formatTorque(nm) {
  if (nm == null) return '—';
  return `${nm} Nm`;
}

/**
 * Format acceleration 0-62 in seconds.
 * @param {number} secs
 * @returns {string} e.g. "5.9s"
 */
export function formatAcceleration(secs) {
  if (secs == null) return '—';
  return `${secs}s`;
}

/**
 * Format top speed in mph.
 * @param {number} mph
 * @returns {string} e.g. "152 mph"
 */
export function formatTopSpeed(mph) {
  if (mph == null) return '—';
  return `${mph} mph`;
}

/**
 * Format a dimension in mm.
 * @param {number} mm
 * @returns {string} e.g. "5,181 mm"
 */
export function formatDimension(mm) {
  if (mm == null) return '—';
  return `${mm.toLocaleString('en-GB')} mm`;
}

/**
 * Format weight in kg.
 * @param {number} kg
 * @returns {string} e.g. "2,510 kg"
 */
export function formatWeight(kg) {
  if (kg == null) return '—';
  return `${kg.toLocaleString('en-GB')} kg`;
}

/**
 * Format volume in litres.
 * @param {number} litres
 * @returns {string} e.g. "750 litres"
 */
export function formatVolume(litres) {
  if (litres == null) return '—';
  return `${litres} litres`;
}

/**
 * Format drivetrain enum.
 * @param {string} drivetrain
 * @returns {string}
 */
export function formatDrivetrain(drivetrain) {
  const map = {
    RWD: 'Rear-wheel drive',
    FWD: 'Front-wheel drive',
    AWD: 'All-wheel drive',
    XDRIVE: 'xDrive (AWD)',
  };
  return map[drivetrain] || drivetrain || '—';
}

/**
 * Format monthly payment.
 * @param {number} amount
 * @returns {string} e.g. "£289/mo"
 */
export function formatMonthly(amount) {
  if (amount == null) return '';
  return `£${Math.round(amount).toLocaleString('en-GB')}/mo`;
}
