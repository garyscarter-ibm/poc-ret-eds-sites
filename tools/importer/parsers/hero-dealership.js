/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-dealership (motorrad variant).
 * Source: bmw-motorrad.co.uk section.dealerheader
 * Extracts: dealer image, dealer name, welcome text, address, phone, email, hours, CTA links
 */
export default function parse(element, { document }) {
  // Extract dealer image from carousel
  const heroImg = element.querySelector('.splide__slide img, .mnn-carousel-item img, .carousel img');

  // Extract intro section
  const introHeadline = element.querySelector('.dealerheader__introduction-headline h1, .dealerheader__introduction h1');
  const introSubline = element.querySelector('.dealerheader__introduction-subline, .dealerheader__introduction > div:last-child');

  // Extract contact info
  const address = element.querySelector('.dealercontact__address, .mnm-contact-address');
  const phoneLink = element.querySelector('.mnm-contact-phone');
  const emailLink = element.querySelector('.mnm-contact-mail, .dealercontact__link--mail');

  // Extract opening hours from the SALES tab (first tab, not service)
  const salesHours = element.querySelector('.dealercontact__openingtimes.mnm-sale-tab .dealercontact__items, .dealercontact__openingtimes .dealercontact__items');
  const hourItems = salesHours ? salesHours.querySelectorAll('.dealercontact__time') : [];

  // Extract CTA links from the quickentries list
  const ctaList = element.querySelector('.dealercontact__quickentries, ul');
  const ctaLinks = ctaList ? ctaList.querySelectorAll('a') : [];

  // Build cells
  const cells = [];

  // Row 1: Hero image
  if (heroImg) {
    cells.push([heroImg.cloneNode(true)]);
  }

  // Row 2: Welcome text + dealer name
  const nameContent = [];
  if (introSubline) {
    const p = document.createElement('p');
    p.textContent = introSubline.textContent.trim();
    nameContent.push(p);
  }
  if (introHeadline) {
    const h1 = document.createElement('h1');
    h1.textContent = introHeadline.textContent.trim();
    nameContent.push(h1);
  }
  if (nameContent.length > 0) cells.push(nameContent);

  // Row 3: Address + contact
  const contactContent = [];
  if (address) {
    const p = document.createElement('p');
    p.textContent = address.textContent.trim();
    contactContent.push(p);
  }
  if (phoneLink) {
    const a = document.createElement('a');
    a.href = phoneLink.getAttribute('href') || '';
    const phoneText = phoneLink.querySelector('.dealercontact__contact-cta-label');
    a.textContent = phoneText ? phoneText.textContent.trim() : phoneLink.textContent.trim().replace(/\s+/g, ' ');
    contactContent.push(a);
  }
  if (emailLink) {
    const a = document.createElement('a');
    a.href = emailLink.getAttribute('href') || '';
    const emailText = emailLink.querySelector('.dealercontact__contact-cta-label');
    a.textContent = emailText ? emailText.textContent.trim() : 'Send Mail';
    contactContent.push(a);
  }
  if (contactContent.length > 0) cells.push(contactContent);

  // Row 4: Opening hours
  const hoursContent = [];
  hourItems.forEach((time) => {
    const dayEl = time.closest('.dealercontact__info-content, .dealercontact__items')?.querySelector('.mnm_dealeropening_day');
    const day = dayEl || time.parentElement?.querySelector('.mnm_dealeropening_day');
    const fromEl = time.querySelector('.dealercontact__from');
    if (fromEl) {
      const p = document.createElement('p');
      const dayText = day ? day.textContent.trim() : '';
      p.textContent = dayText ? `${dayText}: ${fromEl.textContent.trim()}` : fromEl.textContent.trim();
      hoursContent.push(p);
    }
  });
  if (hoursContent.length > 0) cells.push(hoursContent);

  // Row 5: CTA links
  const links = [];
  const seen = new Set();
  ctaLinks.forEach((a) => {
    const href = a.getAttribute('href');
    const textEl = a.querySelector('.mnm-button-label, span');
    const text = textEl ? textEl.textContent.trim() : a.textContent.trim();
    if (href && text && !seen.has(text)) {
      seen.add(text);
      const link = document.createElement('a');
      link.href = href;
      link.textContent = text;
      links.push(link);
    }
  });
  if (links.length > 0) cells.push(links);

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero-dealership',
    cells,
  });

  element.replaceWith(block);
}
