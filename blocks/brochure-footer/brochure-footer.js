import { getActiveBrochure } from '../../scripts/brochure-config.js';

const FOOTER_CONFIGS = {
  x7: {
    social: [
      { label: 'Facebook', url: 'https://www.facebook.com/bmwuk/' },
      { label: 'Instagram', url: 'https://www.instagram.com/bmwuk/' },
      { label: 'YouTube', url: 'https://www.youtube.com/user/bmwuk' },
    ],
    columns: [
      {
        title: 'Useful Tools',
        links: [
          { text: 'New Car Locator', url: 'https://stock.bmw.co.uk/marketing_search?model=G07' },
          { text: 'Build your BMW', url: 'https://www.bmw.co.uk/en/all-models.html' },
          { text: 'Compare Dimensions', url: 'https://range-comparator.bmwlaunchpad.co.uk' },
          { text: 'My BMW App', url: 'https://its-juice-2.foleon.com/explore-bmw/discover-the-my-bmw-app/your-world-my-bmw/' },
        ],
      },
      {
        title: 'Contact',
        links: [
          { text: 'Find a BMW Centre', url: 'https://www.bmw.co.uk/en/footer/contact/find-a-bmw-centre.html' },
          { text: 'Contact BMW', url: 'https://www.bmw.co.uk/en/footer/contact/contact-us.html' },
          { text: 'Contact BMW Financial Services', url: 'https://www.bmw.co.uk/en/footer/contact/contact-bmw-financial-services.html' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { text: 'Cookie Policy', url: 'https://www.bmw.co.uk/en/footer/legal/cookie-policy.html' },
          { text: 'Privacy Policy', url: 'https://www.bmw.co.uk/en/footer/legal/privacy-policy.html' },
        ],
      },
    ],
    legal: '&copy; BMW UK 2026',
  },
  s1000rr: {
    social: [
      { label: 'Facebook', url: 'https://www.facebook.com/BMW.Motorrad.UK/' },
      { label: 'Instagram', url: 'https://www.instagram.com/bmwmotorraduk/' },
      { label: 'YouTube', url: 'https://www.youtube.com/channel/UCRPWxml1oIFQlnZrxw93Vdg' },
    ],
    columns: [
      {
        title: 'Useful Tools',
        links: [
          { text: 'Configure your S 1000 RR', url: 'https://www.bmw-motorrad.co.uk/en/models/sport/s1000rr.html' },
          { text: 'Find a BMW Motorrad Dealer', url: 'https://www.bmw-motorrad.co.uk/en/shopping-tools/find-a-dealer.html' },
          { text: 'Book a Test Ride', url: 'https://www.bmw-motorrad.co.uk/en/test-ride.html' },
        ],
      },
      {
        title: 'Contact',
        links: [
          { text: 'Contact BMW Motorrad', url: 'https://www.bmw-motorrad.co.uk/en/footer/contact.html' },
          { text: 'FAQs', url: 'https://faq.bmw-motorrad.co.uk/s/?language=en_GB' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { text: 'Cookie Policy', url: 'https://www.bmw-motorrad.co.uk/en/public-pool/content-pool/cookie-disclaimer.html' },
          { text: 'Privacy Policy', url: 'https://www.bmw.co.uk/global/privacy-policy' },
        ],
      },
    ],
    legal: '&copy; BMW Motorrad UK 2026',
  },
};

const SOCIAL_ICONS = {
  Facebook: '<svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  Instagram: '<svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
  YouTube: '<svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
};

function getConfig() {
  const brochure = getActiveBrochure();
  if (!brochure) return FOOTER_CONFIGS.x7;
  const key = Object.keys(FOOTER_CONFIGS).find(
    (k) => brochure.basePath.includes(k),
  );
  return FOOTER_CONFIGS[key] || FOOTER_CONFIGS.x7;
}

export default async function decorate(block) {
  const config = getConfig();
  const footer = document.createElement('div');
  footer.className = 'brochure-footer-inner';

  const socialSection = document.createElement('div');
  socialSection.className = 'brochure-footer-social';
  socialSection.innerHTML = `<h3>Social Media</h3>
    <ul class="brochure-footer-social-links">
      ${config.social.map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}">${SOCIAL_ICONS[s.label] || ''}</a></li>`).join('')}
    </ul>`;

  const separator = document.createElement('hr');
  separator.className = 'brochure-footer-separator';

  const linksSection = document.createElement('div');
  linksSection.className = 'brochure-footer-links';
  linksSection.innerHTML = config.columns.map((col) => `
    <div class="brochure-footer-column">
      <h3>${col.title}</h3>
      <ul>
        ${col.links.map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.text}</a></li>`).join('')}
      </ul>
    </div>`).join('');

  const legal = document.createElement('div');
  legal.className = 'brochure-footer-legal';
  legal.innerHTML = `<p>Every effort has been made to ensure the accuracy of information contained in this digital brochure. All content, including pricing is current at the time of publication and subject to change without notice.</p>
    <p>${config.legal}</p>`;

  footer.append(socialSection, separator, linksSection, legal);
  block.textContent = '';
  block.append(footer);
}
