const ICON_MAP = {
  'test drive': '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="6"/><line x1="24" y1="6" x2="24" y2="12"/><line x1="24" y1="36" x2="24" y2="42"/><line x1="6" y1="24" x2="12" y2="24"/><line x1="36" y1="24" x2="42" y2="24"/></svg>',
  enquiry: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="24" cy="16" r="8"/><path d="M10 42c0-8 6-14 14-14s14 6 14 14"/></svg>',
  service: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M28 8l-4 8 8 4-8 4 4 8"/><path d="M14 38l8-8"/><circle cx="12" cy="40" r="4"/></svg>',
  'parts & repairs': '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="4"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4.2 4.2M32.8 32.8l4.2 4.2M37 11l-4.2 4.2M15.2 32.8l-4.2 4.2"/></svg>',
  contact: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="24" cy="24" r="10"/><circle cx="24" cy="24" r="4"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4.2 4.2M32.8 32.8l4.2 4.2M37 11l-4.2 4.2M15.2 32.8l-4.2 4.2"/></svg>',
};

function getIcon(text) {
  const lower = text.toLowerCase();
  const keys = Object.keys(ICON_MAP);
  const match = keys.find((k) => lower.includes(k));
  return match ? ICON_MAP[match] : null;
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('tiles-contact-item');
    const link = row.querySelector('a');
    if (link) {
      link.classList.add('tiles-contact-link');

      // Inject icon based on link text
      const svg = getIcon(link.textContent);
      if (svg) {
        const icon = document.createElement('span');
        icon.className = 'tiles-contact-icon';
        icon.innerHTML = svg;
        link.prepend(icon);
      }
    }
  });
}
