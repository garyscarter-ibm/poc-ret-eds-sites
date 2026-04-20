/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-dealer-locator.
 * Base: tabs. Source: cotswoldcheltenhambmw.co.uk/about-us/
 * DOM: .contact-us-module - tabbed dealer info with address, hours, phone per department
 * Block library: Tabs = row per tab: [tab label, tab content]
 */
export default function parse(element, { document }) {
  const heading = element.querySelector('.contact-us-module__heading, h2');
  const tabs = element.querySelectorAll('.contact-us-module__nav a');
  const tabSections = element.querySelectorAll('.contact-us-module__section');
  const cells = [];

  tabs.forEach((tab, index) => {
    const label = tab.textContent.trim();
    const section = tabSections[index];
    const contentCell = [];

    if (section) {
      // Extract address
      const addressList = section.querySelector('.contact-us-module__list');
      if (addressList) {
        const items = addressList.querySelectorAll('li');
        items.forEach((item) => {
          const p = document.createElement('p');
          p.textContent = item.textContent.trim();
          contentCell.push(p);
        });
      }

      // Extract subheadings and additional lists
      const columns = section.querySelectorAll('.contact-us-module__column');
      columns.forEach((col) => {
        const subheading = col.querySelector('.contact-us-module__subheading, h3');
        const list = col.querySelector('.contact-us-module__list');
        if (subheading) {
          const h = document.createElement('h3');
          h.textContent = subheading.textContent.trim();
          contentCell.push(h);
        }
        if (list) {
          const listItems = list.querySelectorAll('li');
          listItems.forEach((li) => {
            const p = document.createElement('p');
            p.textContent = li.textContent.trim();
            contentCell.push(p);
          });
        }
      });
    }

    cells.push([label, contentCell.length ? contentCell : label]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-dealer-locator', cells });

  // Prepend heading before block if exists
  if (heading) {
    const wrapper = document.createElement('div');
    wrapper.append(heading);
    wrapper.append(block);
    element.replaceWith(wrapper);
  } else {
    element.replaceWith(block);
  }
}
