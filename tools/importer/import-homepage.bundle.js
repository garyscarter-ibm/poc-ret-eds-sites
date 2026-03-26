var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const bgStyle = element.querySelector(".heroPageHead");
    let bgImg = null;
    if (bgStyle) {
      const styleAttr = bgStyle.getAttribute("style") || "";
      const urlMatch = styleAttr.match(/url\(['"]?(\/\/[^'")\s]+|https?:\/\/[^'")\s]+)['"]?\)/);
      if (urlMatch) {
        let imgUrl = urlMatch[1];
        if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
        bgImg = document.createElement("img");
        bgImg.src = imgUrl;
        bgImg.alt = "";
      }
    }
    const heading = element.querySelector(".heroText h1, h1");
    const subheading = element.querySelector(".heroText h2, .heroText p");
    const ctas = Array.from(element.querySelectorAll(".buttonHolder a.btnPrimary, .buttonHolder a.btnSecondary"));
    const cells = [];
    if (bgImg) {
      cells.push([bgImg]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (subheading) contentCell.push(subheading);
    ctas.forEach((cta) => contentCell.push(cta));
    const ratingSections = element.querySelectorAll(".starRating");
    if (ratingSections.length > 0) {
      ratingSections.forEach((rating) => {
        const title = rating.querySelector(".ratingTitle");
        const number = rating.querySelector(".numberRating");
        if (title && number) {
          const p = document.createElement("p");
          p.textContent = `${title.textContent.trim()}: ${number.textContent.trim()}/5`;
          contentCell.push(p);
        }
      });
      const reviewLink = element.querySelector(".ratingSection a");
      if (reviewLink) contentCell.push(reviewLink);
    }
    cells.push(contentCell);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-model-showcase.js
  function parse2(element, { document }) {
    const video = element.querySelector("video.videoBgPlayer");
    const posterUrl = video ? video.getAttribute("poster") : null;
    let imgEl = null;
    if (posterUrl) {
      imgEl = document.createElement("img");
      imgEl.src = posterUrl.startsWith("./") ? "https://www.grassicksbmw.co.uk/" + posterUrl.slice(2) : posterUrl;
      imgEl.alt = "BMW iX3";
    }
    const carName = element.querySelector(".carName, h2");
    const fuelType = element.querySelector(".fuelType li, #carNavFuelOptions");
    const modelStrap = element.querySelector(".modelStrap");
    const specs = Array.from(element.querySelectorAll(".modelExtra li"));
    const ctaLink = element.querySelector(".modelLinks a, a.moreDetails");
    const textCell = [];
    if (carName) textCell.push(carName);
    if (fuelType) {
      const p = document.createElement("p");
      p.textContent = fuelType.textContent.trim();
      textCell.push(p);
    }
    if (modelStrap) {
      const p = document.createElement("p");
      p.textContent = modelStrap.textContent.trim();
      textCell.push(p);
    }
    specs.forEach((spec) => {
      const title = spec.querySelector(".infoTitle");
      const info = spec.querySelector(".infoInfo");
      if (title && info) {
        const p = document.createElement("p");
        p.textContent = `${title.textContent.trim()}: ${info.textContent.trim()}`;
        textCell.push(p);
      }
    });
    if (ctaLink) textCell.push(ctaLink);
    const cells = [];
    const row = [];
    if (imgEl) {
      row.push(imgEl);
    }
    row.push(textCell);
    cells.push(row);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-model-showcase", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-car-locator.js
  function parse3(element, { document }) {
    const promos = Array.from(element.querySelectorAll(".linkPromo"));
    const cells = [];
    promos.forEach((promo) => {
      const styleAttr = promo.getAttribute("style") || "";
      const urlMatch = styleAttr.match(/url\(['"]?(\/\/[^'")\s]+|https?:\/\/[^'")\s]+)['"]?\)/);
      let imgEl = null;
      if (urlMatch) {
        let imgUrl = urlMatch[1];
        if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
        imgEl = document.createElement("img");
        imgEl.src = imgUrl;
        imgEl.alt = "";
      }
      const heading = promo.querySelector(".teaserText h3, h3");
      const link = promo.querySelector(".teaserText a, a");
      const textCell = [];
      if (heading) textCell.push(heading);
      if (link) textCell.push(link);
      if (imgEl) {
        cells.push([imgEl, textCell]);
      } else {
        cells.push([textCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-car-locator", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news.js
  function parse4(element, { document }) {
    const panels = Array.from(element.querySelectorAll(".panel, .homePagePanel"));
    const cells = [];
    panels.forEach((panel) => {
      const styleAttr = panel.getAttribute("style") || "";
      const urlMatch = styleAttr.match(/url\(["']?(\/\/[^"')\s]+|https?:\/\/[^"')\s]+)["']?\)/);
      let imgEl = null;
      if (urlMatch) {
        let imgUrl = urlMatch[1];
        if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
        imgEl = document.createElement("img");
        imgEl.src = imgUrl;
        imgEl.alt = "";
      }
      const category = panel.querySelector("h4");
      const heading = panel.querySelector("h5, a h5");
      const description = panel.querySelector("p, a p");
      const link = panel.querySelector("a[href]");
      const textCell = [];
      if (category) textCell.push(category);
      if (heading) textCell.push(heading);
      if (description) textCell.push(description);
      if (link) {
        const readMore = panel.querySelector(".arrowLink");
        if (readMore && link) {
          const a = document.createElement("a");
          a.href = link.getAttribute("href");
          a.textContent = readMore.textContent.trim() || "Read more";
          textCell.push(a);
        }
      }
      if (imgEl) {
        cells.push([imgEl, textCell]);
      } else {
        cells.push([textCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-news", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse5(element, { document }) {
    const img = element.querySelector(".imageHolderCMS img, img");
    const richText = element.querySelector(".richText");
    const heading = richText ? richText.querySelector("h3, h5") : element.querySelector("h3, h5");
    const paragraphs = richText ? Array.from(richText.querySelectorAll("p")) : Array.from(element.querySelectorAll("p"));
    const ctaLink = richText ? richText.querySelector("a[href]") : element.querySelector("a[href]");
    const textCell = [];
    if (heading) textCell.push(heading);
    paragraphs.forEach((p) => {
      if (ctaLink && p.contains(ctaLink) && p.children.length === 1) return;
      textCell.push(p);
    });
    if (ctaLink) textCell.push(ctaLink);
    const isAlt = element.classList.contains("alt");
    const cells = [];
    if (isAlt) {
      cells.push([textCell, img || ""]);
    } else {
      cells.push([img || "", textCell]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-welcome.js
  function parse6(element, { document }) {
    const img = element.querySelector(".imageHolderCMS img, img");
    const richText = element.querySelector(".richText");
    const heading = richText ? richText.querySelector("h3, h5") : element.querySelector("h3, h5");
    const paragraphs = richText ? Array.from(richText.querySelectorAll("p")) : Array.from(element.querySelectorAll("p"));
    const ctaLink = richText ? richText.querySelector("a[href]") : element.querySelector("a[href]");
    const textCell = [];
    if (heading) textCell.push(heading);
    paragraphs.forEach((p) => {
      if (ctaLink && p.contains(ctaLink) && p.children.length === 1) return;
      textCell.push(p);
    });
    if (ctaLink) textCell.push(ctaLink);
    const cells = [];
    cells.push([img || "", textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-welcome", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-about.js
  function parse7(element, { document }) {
    const panels = Array.from(element.querySelectorAll(".panel"));
    const cells = [];
    panels.forEach((panel) => {
      const styleAttr = panel.getAttribute("style") || "";
      const urlMatch = styleAttr.match(/url\(["']?(\/\/[^"')\s]+|https?:\/\/[^"')\s]+|\/[^"')\s]+)["']?\)/);
      let imgEl = null;
      if (urlMatch) {
        let imgUrl = urlMatch[1];
        if (imgUrl.startsWith("//")) imgUrl = "https:" + imgUrl;
        else if (imgUrl.startsWith("/") && !imgUrl.startsWith("//")) imgUrl = "https://www.grassicksbmw.co.uk" + imgUrl;
        imgEl = document.createElement("img");
        imgEl.src = imgUrl;
        imgEl.alt = "";
      }
      const heading = panel.querySelector("h5");
      const links = Array.from(panel.querySelectorAll("a[href]"));
      const textCell = [];
      if (heading) textCell.push(heading);
      links.forEach((link) => textCell.push(link));
      if (imgEl) {
        cells.push([imgEl, textCell]);
      } else {
        cells.push([textCell]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-about", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-dealer-locator.js
  function parse8(element, { document }) {
    const heading = element.querySelector(".contact-us-module__heading, h2");
    const tabLinks = Array.from(element.querySelectorAll(".contact-us-module__nav a"));
    const tabSections = Array.from(element.querySelectorAll(".contact-us-module__section"));
    const cells = [];
    tabLinks.forEach((tabLink, index) => {
      const tabLabel = tabLink.textContent.trim();
      const section = tabSections[index];
      const contentCell = [];
      if (section) {
        const columns = Array.from(section.querySelectorAll(".contact-us-module__column"));
        columns.forEach((col) => {
          const subheading = col.querySelector(".contact-us-module__subheading, h3");
          const listItems = Array.from(col.querySelectorAll(".contact-us-module__list li"));
          if (subheading) {
            const h4 = document.createElement("h4");
            h4.textContent = subheading.textContent.trim();
            contentCell.push(h4);
          }
          listItems.forEach((li) => {
            const p = document.createElement("p");
            const day = li.querySelector(".day");
            const time = li.querySelector(".time");
            if (day && time) {
              p.textContent = day.textContent.trim() + " " + time.textContent.trim();
            } else {
              p.textContent = li.textContent.trim();
            }
            contentCell.push(p);
          });
        });
      }
      cells.push([tabLabel, contentCell]);
    });
    const container = document.createElement("div");
    if (heading) container.appendChild(heading);
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-dealer-locator", cells });
    container.appendChild(block);
    element.replaceWith(container);
  }

  // tools/importer/transformers/grassicksbmw-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#bmw-eprivacy-banner",
        "#cct-widget-main",
        ".periodic-embedded-calendar-shadowbox",
        ".skip-link",
        "#livechat_rolnHost"
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "nav#menuOverlay",
        "noscript",
        "link",
        "iframe"
      ]);
    }
  }

  // tools/importer/transformers/grassicksbmw-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const document = element.ownerDocument;
      const sections = payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const reversedSections = [...sections].reverse();
      reversedSections.forEach((section, reverseIndex) => {
        const isFirst = reverseIndex === sections.length - 1;
        const selector = section.selector;
        if (!selector) return;
        let sectionEl = null;
        if (Array.isArray(selector)) {
          for (const sel of selector) {
            sectionEl = element.querySelector(sel);
            if (sectionEl) break;
          }
        } else {
          sectionEl = element.querySelector(selector);
        }
        if (!sectionEl) return;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(metaBlock);
        }
        if (!isFirst) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero": parse,
    "columns-model-showcase": parse2,
    "cards-car-locator": parse3,
    "cards-news": parse4,
    "columns": parse5,
    "columns-welcome": parse6,
    "cards-about": parse7,
    "tabs-dealer-locator": parse8
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Main dealership homepage with hero video carousel, sales/service ratings widget, featured model showcase, news & offers cards, promotional image-text banners, and dealer locator map",
    urls: [
      "https://www.grassicksbmw.co.uk/"
    ],
    blocks: [
      {
        name: "hero",
        instances: [".heroCarousel .carousel-cell.heroCell"]
      },
      {
        name: "columns-model-showcase",
        instances: ["#soc5Series"]
      },
      {
        name: "cards-car-locator",
        instances: [".splitPromoNavigation"]
      },
      {
        name: "cards-news",
        instances: [".homeSpace .triplePanel"]
      },
      {
        name: "columns",
        instances: [".splitBannerTeaserCMS"]
      },
      {
        name: "columns-welcome",
        instances: [".splitFrameTeaserCMS"]
      },
      {
        name: "cards-about",
        instances: ["#aboutUs .triplePanel"]
      },
      {
        name: "tabs-dealer-locator",
        instances: [".contact-us-module"]
      }
    ],
    sections: [
      {
        id: "hero",
        name: "Hero Carousel",
        selector: ".heroCarousel",
        style: "dark",
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "featured-model",
        name: "Featured Model Showcase",
        selector: "#soc5Series",
        style: "dark",
        blocks: ["columns-model-showcase"],
        defaultContent: []
      },
      {
        id: "car-locator",
        name: "Car Locator Links",
        selector: ".splitPromoNavigation",
        style: "dark",
        blocks: ["cards-car-locator"],
        defaultContent: []
      },
      {
        id: "news-offers",
        name: "News & Offers",
        selector: ".homeSpace",
        style: "light-grey",
        blocks: ["cards-news"],
        defaultContent: [".homeSpace .contentHolder.title h2"]
      },
      {
        id: "promotional-teasers",
        name: "Promotional Teasers",
        selector: ".splitBannerTeaserCMS",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "welcome-message",
        name: "Welcome Message",
        selector: ".splitFrameTeaserCMS",
        style: null,
        blocks: ["columns-welcome"],
        defaultContent: []
      },
      {
        id: "about-us",
        name: "About Us",
        selector: "#aboutUs",
        style: "light-grey",
        blocks: ["cards-about"],
        defaultContent: ["#aboutUs .contentHolder.title h2"]
      },
      {
        id: "disclaimer",
        name: "Disclaimer",
        selector: ".termTextModule",
        style: "light-grey",
        blocks: [],
        defaultContent: [".termTextModule .termTextCMS"]
      },
      {
        id: "dealer-locator",
        name: "Dealer Locator",
        selector: ".contact-us-module",
        style: null,
        blocks: ["tabs-dealer-locator"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
