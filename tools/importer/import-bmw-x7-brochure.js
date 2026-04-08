/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBrochureParser from './parsers/hero-brochure.js';
import columnsFeatureParser from './parsers/columns-feature.js';
import sectionHeadingParser from './parsers/section-heading.js';
import statsParser from './parsers/stats.js';
import embedParser from './parsers/embed.js';
import textMediaParser from './parsers/text-media.js';
import ctaBarParser from './parsers/cta-bar.js';
import featureGridParser from './parsers/feature-grid.js';
import hotspotImageParser from './parsers/hotspot-image.js';
import promoBannerParser from './parsers/promo-banner.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/bmw-brochure-cleanup.js';
import sectionsTransformer from './transformers/bmw-brochure-sections.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'bmw-x7-brochure',
  description: 'BMW X7 luxury brochure — pattern-based block matching for all pages',
  sections: [],
};

const transformers = [cleanupTransformer, sectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try {
      fn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Pattern-based block detection.
 * Classifies each <section> in the article by its content pattern.
 */
function findBlocksByPattern(document) {
  const article = document.querySelector('article');
  if (!article) return [];

  const sections = [...article.querySelectorAll(':scope > section')];
  const blocks = [];
  const matchedPatterns = new Set();

  sections.forEach((section) => {
    const hasViewerBg = !!section.querySelector('.viewer-background');
    const columns = section.querySelectorAll('.im-column');
    const h2s = section.querySelectorAll('h2');
    const h3s = section.querySelectorAll('h3');
    const h4s = section.querySelectorAll('h4');
    const paragraphs = section.querySelectorAll('p');
    const text = section.textContent.trim();

    const hasIconLinks = [...section.querySelectorAll('a')].some((a) => a.querySelector('img'));
    if (text.length < 3 && !hasViewerBg && !hasIconLinks) return;

    // Pattern 0: EMBED — contains an <iframe> (comparator widgets, external tools)
    const iframes = section.querySelectorAll('iframe');
    if (iframes.length > 0) {
      // Only match non-footer iframes (footer iframes are from handbook.itsjuice.com)
      const contentIframe = [...iframes].find((f) => {
        const src = f.getAttribute('src') || '';
        return !src.includes('foleon-footer') && !src.includes('itsjuice.com');
      });
      if (contentIframe) {
        blocks.push({ name: 'embed', element: section });
        return;
      }
    }

    // Pattern 1a: HOTSPOT-IMAGE — viewer-background + overlay links (interactive car image)
    // Foleon loads hotspot links dynamically, so also check for hotspot SVGs or positioned figures
    if (hasViewerBg) {
      const overlayLinks = section.querySelectorAll('a[href*="overlay"]');
      const hotspotImgs = section.querySelectorAll('img[src*="hotspot"], [class*="Hotspot"], figure[class*="hotspot"]');
      const positionedFigures = section.querySelectorAll('figure[style*="position"]');
      if (overlayLinks.length >= 2 || hotspotImgs.length >= 2 || positionedFigures.length >= 2) {
        blocks.push({ name: 'hotspot-image', element: section });
        return;
      }
    }

    // Pattern 1b: HERO — has viewer-background with CSS bg image
    if (hasViewerBg) {
      const vb = section.querySelector('.viewer-background');
      let hasBgImage = false;
      if (vb) {
        const style = window.getComputedStyle(vb);
        hasBgImage = style.backgroundImage && style.backgroundImage !== 'none';
      }
      if (!hasBgImage) {
        const style = window.getComputedStyle(section);
        hasBgImage = style.backgroundImage && style.backgroundImage !== 'none';
      }
      if (hasBgImage) {
        blocks.push({ name: 'hero-brochure', element: section });
        return;
      }
    }

    // Pattern 2: STATS — multiple h2+h4 pairs (metric value + label)
    // e.g. <h2>846-954mm</h2><h4>REAR LEGROOM</h4>
    if (h2s.length >= 2 && h4s.length >= 2) {
      // Check if h2s contain metric-like values (numbers, units)
      const hasMetrics = [...h2s].some((h) => /\d/.test(h.textContent));
      if (hasMetrics) {
        blocks.push({ name: 'stats', element: section });
        return;
      }
    }

    // Pattern 3: SECTION-HEADING — subtitle <p> + two <h2> (split heading)
    // e.g. "INTRODUCING THE X7" + "THIS IS" + "FORWARDISM."
    if (h2s.length >= 2 && h3s.length === 0 && h4s.length === 0) {
      // Check for a subtitle paragraph before the h2s
      const firstH2 = h2s[0];
      let prevP = firstH2.previousElementSibling;
      while (prevP && prevP.tagName !== 'P') prevP = prevP.previousElementSibling;
      if (prevP && prevP.tagName === 'P' && prevP.textContent.trim().length > 3) {
        blocks.push({ name: 'section-heading', element: section });
        return;
      }
      // Also match h2 pairs without subtitle if they look like split headings
      // (short text, no paragraphs — pure heading sections)
      if (paragraphs.length <= 1 && h2s.length === 2) {
        const totalLen = [...h2s].reduce((sum, h) => sum + h.textContent.trim().length, 0);
        if (totalLen < 60) {
          blocks.push({ name: 'section-heading', element: section });
          return;
        }
      }
    }

    // Pattern 4: FEATURE-GRID — 4+ columns with 4+ h4 title headings + "Learn more" CTAs
    // KEY FEATURES section: SKY LOUNGE, CRAFTED GLASS, M FRONT SPORT SEATS, AIR CONDITIONING
    // Matches both desktop (4 cols) and tablet (7 cols) responsive variants
    if (columns.length >= 4 && h4s.length >= 6) {
      const titleH4s = [...h4s].filter((h) => {
        const t = h.textContent.trim();
        return t.length > 3 && !t.toLowerCase().includes('learn more');
      });
      const hasLearnMore = [...h4s].some((h) => h.textContent.toLowerCase().includes('learn more'));
      if (titleH4s.length >= 3 && hasLearnMore && !matchedPatterns.has('feature-grid')) {
        blocks.push({ name: 'feature-grid', element: section });
        matchedPatterns.add('feature-grid');
        return;
      }
    }

    // Pattern 4b: PROMO-BANNER — column with bg image + h4 heading + paragraph + CTA
    // BMW for Business section: full-bleed background with text overlay
    if (columns.length >= 1 && h4s.length >= 1) {
      let hasBgOnCol = false;
      columns.forEach((col) => {
        const colStyle = window.getComputedStyle(col);
        if (colStyle.backgroundImage && colStyle.backgroundImage !== 'none'
          && !colStyle.backgroundImage.includes('gradient')) {
          hasBgOnCol = true;
        }
      });
      if (hasBgOnCol) {
        blocks.push({ name: 'promo-banner', element: section });
        return;
      }
    }

    // Pattern 5: COLUMNS-FEATURE — heading + paragraph + CTA link
    if (columns.length >= 1 && (h3s.length >= 1 || h4s.length >= 1) && paragraphs.length >= 1) {
      const hasCTA = [...section.querySelectorAll('a[href]')].some((a) => {
        const t = a.textContent.trim();
        return t.length > 2 && !t.startsWith('IMG-');
      });
      if (hasCTA) {
        blocks.push({ name: 'columns-feature', element: section });
        return;
      }
    }

    // Pattern 5: TEXT-MEDIA — h3 heading + descriptive paragraph (no CTA required)
    // Feature descriptions like "OPULENT UPHOLSTERY", "DIGITAL DRIVING EXPERIENCE"
    if ((h3s.length >= 1) && paragraphs.length >= 1) {
      // Ensure there's actual descriptive text (not just image containers)
      const hasDescText = [...paragraphs].some((p) => {
        const t = p.textContent.trim();
        return t.length > 20 && !p.querySelector('img');
      });
      if (hasDescText) {
        blocks.push({ name: 'text-media', element: section });
        return;
      }
    }

    // Pattern 6: CTA-BAR — multiple links containing SVG icon images
    // Build your BMW, New Car Locator, Test Drive, Offers buttons
    const iconLinks = [...section.querySelectorAll('a')].filter((a) => a.querySelector('img'));
    if (iconLinks.length >= 3) {
      blocks.push({ name: 'cta-bar', element: section });
      return;
    }

    // Everything else: default content (headings, images, text)
  });

  console.log(`Pattern matching found ${blocks.length} blocks`);
  return blocks;
}

const parsers = {
  'hero-brochure': heroBrochureParser,
  'columns-feature': columnsFeatureParser,
  'section-heading': sectionHeadingParser,
  'stats': statsParser,
  'embed': embedParser,
  'text-media': textMediaParser,
  'cta-bar': ctaBarParser,
  'feature-grid': featureGridParser,
  'hotspot-image': hotspotImageParser,
  'promo-banner': promoBannerParser,
};

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks by content pattern
    const pageBlocks = findBlocksByPattern(document);

    // 3. Parse each matched block
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name}:`, e);
        }
      }
    });

    // 3b. Post-process: inject hotspot-image for KEY HIGHLIGHTS car image
    // Foleon loads hotspots via JS after a delay the importer can't wait for,
    // so we inject the known hotspot data for the exterior-design page.
    const pageUrl = params.originalURL || url;
    if (pageUrl.includes('exterior-design')) {
      // Find the section that has the KEY HIGHLIGHTS background image
      // The image URL pattern is di21_000047696 (car side view)
      const allSections = main.querySelectorAll('section');
      let hotspotSection = null;
      allSections.forEach((sec) => {
        const vb = sec.querySelector('.viewer-background');
        if (vb) {
          const style = window.getComputedStyle(vb);
          if (style.backgroundImage && style.backgroundImage.includes('di21_000047696')) {
            hotspotSection = sec;
          }
        }
      });

      if (hotspotSection) {
        const hotspots = [
          { x: '19.5', y: '55.8', label: 'Split Adaptive LED Headlights', overlay: '?overlay=Split-Adaptive-LED-Headlights' },
          { x: '33.6', y: '66.1', label: 'Alloy Wheels', overlay: '?overlay=Alloy-Wheels' },
          { x: '51.4', y: '20.8', label: 'Roof Rails', overlay: '?overlay=Roof-Rails' },
          { x: '70.6', y: '42.7', label: 'Soft Close Doors', overlay: '?overlay=Soft-Close-Doors' },
        ];

        const bgMatch = window.getComputedStyle(hotspotSection.querySelector('.viewer-background')).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
        const bgSrc = bgMatch ? bgMatch[1] : 'https://assets.foleon.com/eu-central-1/de-uploads-7e3kk3/15958/di21_000047696_1.98ca10763180.jpg?ext=webp';

        const img = document.createElement('img');
        img.src = bgSrc;
        img.alt = 'BMW X7 Key Highlights';
        const cells = [[img]];

        hotspots.forEach((h) => {
          const a = document.createElement('a');
          a.href = h.overlay;
          a.textContent = h.label;
          cells.push([h.x, h.y, h.label, a]);
        });

        const hotspotBlock = WebImporter.Blocks.createBlock(document, {
          name: 'hotspot-image',
          cells,
        });
        hotspotSection.replaceWith(hotspotBlock);
        console.log('Injected hotspot-image block for KEY HIGHLIGHTS');
      }
    }

    // 3c. Insert section breaks between each Foleon section
    // Each remaining <section> in the article becomes its own EDS section
    // Also handle import-table blocks (created by parsers) that replaced sections
    const article = main.querySelector('article');
    if (article) {
      const children = [...article.children];
      for (let i = 1; i < children.length; i += 1) {
        const child = children[i];
        const prev = children[i - 1];
        // Insert <hr> before each section or import-table block (but not before the first)
        if (child.tagName === 'SECTION' || child.tagName === 'TABLE'
          || (child.tagName === 'DIV' && child.querySelector('.sc-eebgCW'))) {
          const sectionBreak = document.createElement('hr');
          article.insertBefore(sectionBreak, child);
          // Add section-metadata for dark styling if the section has dark content
          const isDark = child.querySelector('.viewer-background')
            || (child.tagName === 'TABLE' && child.querySelector('th')
              && (child.querySelector('th').textContent.includes('hero-brochure')
                || child.querySelector('th').textContent.includes('section-heading')));
          if (isDark) {
            const metaBlock = WebImporter.Blocks.createBlock(document, {
              name: 'Section Metadata',
              cells: { style: 'dark' },
            });
            // Insert after the previous child (before the hr)
            if (prev.nextSibling) {
              article.insertBefore(metaBlock, prev.nextSibling);
            }
          }
        }
      }
    }

    // 4. Final cleanup + section breaks
    executeTransformers('afterTransform', main, payload);

    // 5. Built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Path
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
