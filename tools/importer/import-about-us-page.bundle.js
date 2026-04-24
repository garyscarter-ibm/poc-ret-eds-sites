const CustomImportScript = (() => {
  const __defProp = Object.defineProperty;
  const __defProps = Object.defineProperties;
  const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  const __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  const __getOwnPropNames = Object.getOwnPropertyNames;
  const __getOwnPropSymbols = Object.getOwnPropertySymbols;
  const __hasOwnProp = Object.prototype.hasOwnProperty;
  const __propIsEnum = Object.prototype.propertyIsEnumerable;
  const __defNormalProp = (obj, key, value) => (key in obj ? __defProp(obj, key, {
    enumerable: true, configurable: true, writable: true, value,
  }) : obj[key] = value);
  const __spreadValues = (a, b) => {
    for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols) {
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
      }
    }
    return a;
  };
  const __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  const __export = (target, all) => {
    for (const name in all) __defProp(target, name, { get: all[name], enumerable: true });
  };
  const __copyProps = (to, from, except, desc) => {
    if (from && typeof from === 'object' || typeof from === 'function') {
      for (const key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  const __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

  // tools/importer/import-about-us-page.js
  const import_about_us_page_exports = {};
  __export(import_about_us_page_exports, {
    default: () => import_about_us_page_default,
  });

  // tools/importer/parsers/hero-dealership.js
  function parse(element, { document: document2 }) {
    const style = element.getAttribute('style') || '';
    const bgMatch = style.match(/url\(['"]?(.*?)['"]?\)/);
    const cells = [];
    if (bgMatch) {
      const img = document2.createElement('img');
      let src = bgMatch[1];
      if (src.startsWith('//')) src = `https:${src}`;
      img.src = src;
      img.alt = '';
      cells.push([img]);
    }
    const contentCell = [];
    const heading = element.querySelector('h1');
    if (heading) contentCell.push(heading);
    const ratingSection = element.querySelector('.ratingSection');
    if (ratingSection) {
      const ratingText = document2.createElement('p');
      const ratings = ratingSection.querySelectorAll('.starRating');
      const parts = [];
      ratings.forEach((r) => {
        const label = r.querySelector('h3');
        const score = r.querySelector('.ratingResult');
        if (label && score) parts.push(`${label.textContent.trim()}: ${score.textContent.trim()}`);
      });
      if (parts.length) {
        ratingText.textContent = parts.join(' | ');
        contentCell.push(ratingText);
      }
    }
    const cta = element.querySelector('a[href*="review"]');
    if (cta) contentCell.push(cta);
    if (contentCell.length) cells.push(contentCell);
    const block = WebImporter.Blocks.createBlock(document2, { name: 'hero-dealership', cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-about.js
  function parse2(element, { document: document2 }) {
    const cards = element.querySelectorAll('.linkBox');
    const cells = [];
    cards.forEach((card) => {
      const heading = card.querySelector('h3');
      const link = card.querySelector('a');
      const socialList = card.querySelector('.socialIconsGlobal');
      const contentCell = [];
      if (heading) contentCell.push(heading);
      if (socialList) {
        const links = socialList.querySelectorAll('a');
        links.forEach((a) => contentCell.push(a));
      } else if (link) {
        contentCell.push(link);
      }
      if (contentCell.length) cells.push(contentCell);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: 'cards-about', cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse3(element, { document: document2 }) {
    const cells = [];
    if (element.classList.contains('fullQuotePanel')) {
      const img = element.querySelector('.quotePersonDetails img');
      const name = element.querySelector('.quotePersonDetails h3');
      const title = element.querySelector('.quotePersonDetails h4');
      const quote = element.querySelector(':scope > p');
      const imgCell = [];
      if (img) imgCell.push(img);
      const textCell = [];
      if (name) textCell.push(name);
      if (title) textCell.push(title);
      if (quote) textCell.push(quote);
      cells.push([imgCell.length ? imgCell : '', textCell]);
    } else {
      const img = element.querySelector('.imageHolderCMS img');
      const heading = element.querySelector('h4');
      const link = element.querySelector('a');
      const imgCell = [];
      if (img) imgCell.push(img);
      const textCell = [];
      if (heading) textCell.push(heading);
      if (link) textCell.push(link);
      cells.push([imgCell.length ? imgCell : '', textCell]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: 'columns-feature', cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/text-media.js
  function parse4(element, { document: document2 }) {
    const cells = [];
    const img = element.querySelector('.imageHolderCMS img, .carousel-image, .flickity-slider img');
    const richText = element.querySelector('.richText');
    const textElements = [];
    if (richText) {
      const children = richText.querySelectorAll(':scope > p, :scope > h3, :scope > h4, :scope > a');
      children.forEach((child) => textElements.push(child));
    }
    const imgCell = [];
    if (img) {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('//')) {
        img.src = `https:${src}`;
      }
      imgCell.push(img);
    }
    cells.push([imgCell.length ? imgCell : '', textElements.length ? textElements : '']);
    const block = WebImporter.Blocks.createBlock(document2, { name: 'text-media', cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-team.js
  function parse5(element, { document: document2 }) {
    const employees = element.querySelectorAll('[class*="employee"], .columnCMS');
    const cells = [];
    employees.forEach((emp) => {
      const img = emp.querySelector('.imageHolderCMS img');
      const name = emp.querySelector('.richText h4');
      const title = emp.querySelector('.richText h3');
      const extra = emp.querySelector('.richText h5');
      if (!img && !name) return;
      const imgCell = [];
      if (img) {
        const src = img.getAttribute('src') || '';
        if (src.startsWith('//')) img.src = `https:${src}`;
        imgCell.push(img);
      }
      const textCell = [];
      if (name) textCell.push(name);
      if (title) textCell.push(title);
      if (extra) textCell.push(extra);
      cells.push([imgCell.length ? imgCell : '', textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: 'cards-team', cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-dealer-locator.js
  function parse6(element, { document: document2 }) {
    const heading = element.querySelector('.contact-us-module__heading, h2');
    const tabs = element.querySelectorAll('.contact-us-module__nav a');
    const tabSections = element.querySelectorAll('.contact-us-module__section');
    const cells = [];
    tabs.forEach((tab, index) => {
      const label = tab.textContent.trim();
      const section = tabSections[index];
      const contentCell = [];
      if (section) {
        const addressList = section.querySelector('.contact-us-module__list');
        if (addressList) {
          const items = addressList.querySelectorAll('li');
          items.forEach((item) => {
            const p = document2.createElement('p');
            p.textContent = item.textContent.trim();
            contentCell.push(p);
          });
        }
        const columns = section.querySelectorAll('.contact-us-module__column');
        columns.forEach((col) => {
          const subheading = col.querySelector('.contact-us-module__subheading, h3');
          const list = col.querySelector('.contact-us-module__list');
          if (subheading) {
            const h = document2.createElement('h3');
            h.textContent = subheading.textContent.trim();
            contentCell.push(h);
          }
          if (list) {
            const listItems = list.querySelectorAll('li');
            listItems.forEach((li) => {
              const p = document2.createElement('p');
              p.textContent = li.textContent.trim();
              contentCell.push(p);
            });
          }
        });
      }
      cells.push([label, contentCell.length ? contentCell : label]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: 'tabs-dealer-locator', cells });
    if (heading) {
      const wrapper = document2.createElement('div');
      wrapper.append(heading);
      wrapper.append(block);
      element.replaceWith(wrapper);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/transformers/cotswold-cleanup.js
  const H = { before: 'beforeTransform', after: 'afterTransform' };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        '.alertArea',
        '[class*="cookie"]',
        '[class*="consent"]',
        '[id*="cookie"]',
        '[id*="consent"]',
        '[class*="eprivacy"]',
      ]);
      WebImporter.DOMUtils.remove(element, [
        'header',
        '.siteHeaderHolder',
        '.navHolder',
        '.megaMenu',
        '.menuDropHolder',
        '.mobileMenuHolder',
        'nav:not([aria-label])',
        '.skipToContent',
        '[class*="skipTo"]',
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        'footer',
        '.contentHolder.footer',
        '.breadcrumb',
        'nav[aria-label="Breadcrumb"]',
        '.leftFooter',
        '.socialFooter',
        'iframe',
        'link',
        'noscript',
        '.flickity-button',
        '.flickity-page-dots',
        '[class*="chat-widget"]',
      ]);
      const main = element.querySelector('#main-content') || element.querySelector('.mainBodyHolder');
      if (main) {
        const parent = main.parentElement;
        if (parent && parent !== element) {
          while (element.firstChild) element.firstChild.remove();
          while (main.firstChild) element.appendChild(main.firstChild);
        }
      }
      element.querySelectorAll('*').forEach((el) => {
        el.removeAttribute('data-track');
        el.removeAttribute('onclick');
        el.removeAttribute('data-analytics');
        el.removeAttribute('style');
      });
    }
  }

  // tools/importer/transformers/cotswold-sections.js
  const H2 = { after: 'afterTransform' };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const reversedSections = [...sections].reverse();
      reversedSections.forEach((section) => {
        const selectorList = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectorList) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) return;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: 'Section Metadata',
            cells: { style: section.style },
          });
          sectionEl.after(sectionMetadata);
        }
        if (section.id !== sections[0].id && sectionEl.previousElementSibling) {
          const hr = document.createElement('hr');
          sectionEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-about-us-page.js
  const parsers = {
    'hero-dealership': parse,
    'cards-about': parse2,
    'columns-feature': parse3,
    'text-media': parse4,
    'cards-team': parse5,
    'tabs-dealer-locator': parse6,
  };
  const PAGE_TEMPLATE = {
    name: 'about-us-page',
    description: 'About us / meet the team page with staff profiles and dealership information',
    urls: ['https://www.cotswoldcheltenhambmw.co.uk/about-us/'],
    blocks: [
      { name: 'hero-dealership', instances: ['.heroPageHead.aboutUsHero'] },
      { name: 'cards-about', instances: ['.linkBoxHolder'] },
      { name: 'columns-feature', instances: ['.fullQuotePanel', '.singleTeaserCMS'] },
      { name: 'text-media', instances: ['.splitFrameTeaserCMS.imageCarousel', '.splitBannerTeaserCMS'] },
      { name: 'cards-team', instances: ['.tripleColumnCMS'] },
      { name: 'tabs-dealer-locator', instances: ['.contact-us-module'] },
    ],
    sections: [
      {
        id: 'hero', name: 'Hero / Page Header', selector: '.heroPageHead.aboutUsHero', style: 'dark', blocks: ['hero-dealership'], defaultContent: [],
      },
      {
        id: 'section-navigation', name: 'Section Navigation Cards', selector: '.linkBoxHolder', style: 'dark', blocks: ['cards-about'], defaultContent: [],
      },
      {
        id: 'about-intro', name: 'About Us Introduction', selector: '.fullQuotePanelAltBg', style: 'light', blocks: ['columns-feature'], defaultContent: [],
      },
      {
        id: 'company-intro', name: 'Company Introduction', selector: '.splitFrameTeaserCMS.imageCarousel', style: null, blocks: ['text-media'], defaultContent: [],
      },
      {
        id: 'our-culture', name: 'Our Culture', selector: '.splitBannerTeaserCMS:not(.alt)', style: null, blocks: ['text-media'], defaultContent: [],
      },
      {
        id: 'values', name: 'Values - Five Star Service', selector: '.splitBannerTeaserCMS.alt', style: null, blocks: ['text-media'], defaultContent: [],
      },
      {
        id: 'faqs', name: 'FAQs', selector: '.richText.mainText.btnPrimary-ch', style: null, blocks: [], defaultContent: ['h2', 'p strong', 'p'],
      },
      {
        id: 'meet-the-team', name: 'Meet The Team Grid', selector: '.tripleColumnCMS', style: null, blocks: ['cards-team'], defaultContent: [],
      },
      {
        id: 'get-in-touch', name: 'Get In Touch CTA', selector: '.singleTeaserCMS', style: 'dark', blocks: ['columns-feature'], defaultContent: [],
      },
      {
        id: 'find-us', name: 'Find Us / Dealer Locator', selector: '.contact-us-module', style: null, blocks: ['tabs-dealer-locator'], defaultContent: [],
      },
    ],
  };
  const transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : [],
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
          });
        });
      });
    });
    return pageBlocks;
  }
  var import_about_us_page_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers('beforeTransform', main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        }
      });
      executeTransformers('afterTransform', main, payload);
      const hr = document2.createElement('hr');
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
      );
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name),
        },
      }];
    },
  };
  return __toCommonJS(import_about_us_page_exports);
})();
