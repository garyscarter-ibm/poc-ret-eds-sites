/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import columnsModelShowcaseParser from './parsers/columns-model-showcase.js';
import cardsCarLocatorParser from './parsers/cards-car-locator.js';
import cardsNewsParser from './parsers/cards-news.js';
import columnsParser from './parsers/columns.js';
import columnsWelcomeParser from './parsers/columns-welcome.js';
import cardsAboutParser from './parsers/cards-about.js';
import tabsDealerLocatorParser from './parsers/tabs-dealer-locator.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/grassicksbmw-cleanup.js';
import sectionsTransformer from './transformers/grassicksbmw-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'columns-model-showcase': columnsModelShowcaseParser,
  'cards-car-locator': cardsCarLocatorParser,
  'cards-news': cardsNewsParser,
  'columns': columnsParser,
  'columns-welcome': columnsWelcomeParser,
  'cards-about': cardsAboutParser,
  'tabs-dealer-locator': tabsDealerLocatorParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Main dealership homepage with hero video carousel, sales/service ratings widget, featured model showcase, news & offers cards, promotional image-text banners, and dealer locator map',
  urls: [
    'https://www.grassicksbmw.co.uk/',
  ],
  blocks: [
    {
      name: 'hero',
      instances: ['.heroCarousel .carousel-cell.heroCell'],
    },
    {
      name: 'columns-model-showcase',
      instances: ['#soc5Series'],
    },
    {
      name: 'cards-car-locator',
      instances: ['.splitPromoNavigation'],
    },
    {
      name: 'cards-news',
      instances: ['.homeSpace .triplePanel'],
    },
    {
      name: 'columns',
      instances: ['.splitBannerTeaserCMS'],
    },
    {
      name: 'columns-welcome',
      instances: ['.splitFrameTeaserCMS'],
    },
    {
      name: 'cards-about',
      instances: ['#aboutUs .triplePanel'],
    },
    {
      name: 'tabs-dealer-locator',
      instances: ['.contact-us-module'],
    },
  ],
  sections: [
    {
      id: 'hero',
      name: 'Hero Carousel',
      selector: '.heroCarousel',
      style: 'dark',
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'featured-model',
      name: 'Featured Model Showcase',
      selector: '#soc5Series',
      style: 'dark',
      blocks: ['columns-model-showcase'],
      defaultContent: [],
    },
    {
      id: 'car-locator',
      name: 'Car Locator Links',
      selector: '.splitPromoNavigation',
      style: 'dark',
      blocks: ['cards-car-locator'],
      defaultContent: [],
    },
    {
      id: 'news-offers',
      name: 'News & Offers',
      selector: '.homeSpace',
      style: 'light-grey',
      blocks: ['cards-news'],
      defaultContent: ['.homeSpace .contentHolder.title h2'],
    },
    {
      id: 'promotional-teasers',
      name: 'Promotional Teasers',
      selector: '.splitBannerTeaserCMS',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'welcome-message',
      name: 'Welcome Message',
      selector: '.splitFrameTeaserCMS',
      style: null,
      blocks: ['columns-welcome'],
      defaultContent: [],
    },
    {
      id: 'about-us',
      name: 'About Us',
      selector: '#aboutUs',
      style: 'light-grey',
      blocks: ['cards-about'],
      defaultContent: ['#aboutUs .contentHolder.title h2'],
    },
    {
      id: 'disclaimer',
      name: 'Disclaimer',
      selector: '.termTextModule',
      style: 'light-grey',
      blocks: [],
      defaultContent: ['.termTextModule .termTextCMS'],
    },
    {
      id: 'dealer-locator',
      name: 'Dealer Locator',
      selector: '.contact-us-module',
      style: null,
      blocks: ['tabs-dealer-locator'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

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
    const { document, url, html, params } = payload;

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

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index'
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
