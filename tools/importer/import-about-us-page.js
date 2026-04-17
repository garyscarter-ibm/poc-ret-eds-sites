/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroDealershipParser from './parsers/hero-dealership.js';
import cardsAboutParser from './parsers/cards-about.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import textMediaParser from './parsers/text-media.js';
import cardsTeamParser from './parsers/cards-team.js';
import tabsDealerLocatorParser from './parsers/tabs-dealer-locator.js';

// TRANSFORMER IMPORTS
import cotswoldCleanup from './transformers/cotswold-cleanup.js';
import cotswoldSections from './transformers/cotswold-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-dealership': heroDealershipParser,
  'cards-about': cardsAboutParser,
  'columns-feature': columnsFeatureParser,
  'text-media': textMediaParser,
  'cards-team': cardsTeamParser,
  'tabs-dealer-locator': tabsDealerLocatorParser,
};

// PAGE TEMPLATE CONFIGURATION
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
    { id: 'hero', name: 'Hero / Page Header', selector: '.heroPageHead.aboutUsHero', style: 'dark', blocks: ['hero-dealership'], defaultContent: [] },
    { id: 'section-navigation', name: 'Section Navigation Cards', selector: '.linkBoxHolder', style: 'dark', blocks: ['cards-about'], defaultContent: [] },
    { id: 'about-intro', name: 'About Us Introduction', selector: '.fullQuotePanelAltBg', style: 'light', blocks: ['columns-feature'], defaultContent: [] },
    { id: 'company-intro', name: 'Company Introduction', selector: '.splitFrameTeaserCMS.imageCarousel', style: null, blocks: ['text-media'], defaultContent: [] },
    { id: 'our-culture', name: 'Our Culture', selector: '.splitBannerTeaserCMS:not(.alt)', style: null, blocks: ['text-media'], defaultContent: [] },
    { id: 'values', name: 'Values - Five Star Service', selector: '.splitBannerTeaserCMS.alt', style: null, blocks: ['text-media'], defaultContent: [] },
    { id: 'faqs', name: 'FAQs', selector: '.richText.mainText.btnPrimary-ch', style: null, blocks: [], defaultContent: ['h2', 'p strong', 'p'] },
    { id: 'meet-the-team', name: 'Meet The Team Grid', selector: '.tripleColumnCMS', style: null, blocks: ['cards-team'], defaultContent: [] },
    { id: 'get-in-touch', name: 'Get In Touch CTA', selector: '.singleTeaserCMS', style: 'dark', blocks: ['columns-feature'], defaultContent: [] },
    { id: 'find-us', name: 'Find Us / Dealer Locator', selector: '.contact-us-module', style: null, blocks: ['tabs-dealer-locator'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cotswoldCleanup,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [cotswoldSections] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      }
    });

    // 4. Execute afterTransform transformers (cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
