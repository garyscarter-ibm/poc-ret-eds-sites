/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroDealershipParser from './parsers/hero-dealership.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import cardsAboutParser from './parsers/cards-about.js';
import carouselOffersParser from './parsers/carousel-offers.js';
import bannerTermsParser from './parsers/banner-terms.js';

// TRANSFORMER IMPORTS
import motorradCleanupTransformer from './transformers/motorrad-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-dealership': heroDealershipParser,
  'columns-feature': columnsFeatureParser,
  'cards-about': cardsAboutParser,
  'carousel-offers': carouselOffersParser,
  'banner-terms': bannerTermsParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  motorradCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'motorrad-homepage',
  description: 'BMW Motorrad dealer homepage with hero, model range, offers, services, and dealer locator',
  urls: ['https://www.bmw-motorrad.co.uk/cotswold-cheltenham/en/home.html'],
  blocks: [
    {
      name: 'hero-dealership',
      instances: ['.dealerheader__container'],
    },
    {
      name: 'columns-feature',
      instances: ['section.mediacopy'],
    },
    {
      name: 'cards-about',
      instances: ['.productservice-items'],
    },
    {
      name: 'carousel-offers',
      instances: ['.hl-offers__slider'],
    },
    {
      name: 'banner-terms',
      instances: ['.shortnote'],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

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
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
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
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
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
