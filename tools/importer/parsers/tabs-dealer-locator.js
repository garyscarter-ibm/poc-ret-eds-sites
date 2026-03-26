/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-dealer-locator.
 * Base: tabs. Source: https://www.grassicksbmw.co.uk/
 * Selector: .contact-us-module
 * Generated: 2026-03-20
 */
export default function parse(element, { document }) {
  // Extract heading
  const heading = element.querySelector('.contact-us-module__heading, h2');

  // Extract tab labels from nav
  const tabLinks = Array.from(element.querySelectorAll('.contact-us-module__nav a'));
  // Extract tab content sections
  const tabSections = Array.from(element.querySelectorAll('.contact-us-module__section'));

  const cells = [];

  tabLinks.forEach((tabLink, index) => {
    const tabLabel = tabLink.textContent.trim();
    const section = tabSections[index];

    const contentCell = [];
    if (section) {
      // Extract address, opening hours, phone from the section
      const columns = Array.from(section.querySelectorAll('.contact-us-module__column'));
      columns.forEach((col) => {
        const subheading = col.querySelector('.contact-us-module__subheading, h3');
        const listItems = Array.from(col.querySelectorAll('.contact-us-module__list li'));
        if (subheading) {
          const h4 = document.createElement('h4');
          h4.textContent = subheading.textContent.trim();
          contentCell.push(h4);
        }
        listItems.forEach((li) => {
          const p = document.createElement('p');
          // Handle opening hours with day/time spans
          const day = li.querySelector('.day');
          const time = li.querySelector('.time');
          if (day && time) {
            p.textContent = day.textContent.trim() + ' ' + time.textContent.trim();
          } else {
            p.textContent = li.textContent.trim();
          }
          contentCell.push(p);
        });
      });
    }

    // Tabs block: 2 columns per row (tab label | tab content)
    cells.push([tabLabel, contentCell]);
  });

  // Add heading before the block
  const container = document.createElement('div');
  if (heading) container.appendChild(heading);

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-dealer-locator', cells });
  container.appendChild(block);
  element.replaceWith(container);
}
