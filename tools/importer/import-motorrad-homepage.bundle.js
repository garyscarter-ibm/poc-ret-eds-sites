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

  // tools/importer/import-motorrad-homepage.js
  var import_motorrad_homepage_exports = {};
  __export(import_motorrad_homepage_exports, {
    default: () => import_motorrad_homepage_default
  });

  // tools/importer/parsers/hero-dealership.js
  function parse(element, { document }) {
    const heroImg = element.querySelector(".splide__slide img, .mnn-carousel-item img, .carousel img");
    const introHeadline = element.querySelector(".dealerheader__introduction-headline h1, .dealerheader__introduction h1");
    const introSubline = element.querySelector(".dealerheader__introduction-subline, .dealerheader__introduction > div:last-child");
    const address = element.querySelector(".dealercontact__address, .mnm-contact-address");
    const phoneLink = element.querySelector(".mnm-contact-phone");
    const emailLink = element.querySelector(".mnm-contact-mail, .dealercontact__link--mail");
    const salesHours = element.querySelector(".dealercontact__openingtimes.mnm-sale-tab .dealercontact__items, .dealercontact__openingtimes .dealercontact__items");
    const hourItems = salesHours ? salesHours.querySelectorAll(".dealercontact__time") : [];
    const ctaList = element.querySelector(".dealercontact__quickentries, ul");
    const ctaLinks = ctaList ? ctaList.querySelectorAll("a") : [];
    const cells = [];
    if (heroImg) {
      cells.push([heroImg.cloneNode(true)]);
    }
    const nameContent = [];
    if (introSubline) {
      const p = document.createElement("p");
      p.textContent = introSubline.textContent.trim();
      nameContent.push(p);
    }
    if (introHeadline) {
      const h1 = document.createElement("h1");
      h1.textContent = introHeadline.textContent.trim();
      nameContent.push(h1);
    }
    if (nameContent.length > 0) cells.push(nameContent);
    const contactContent = [];
    if (address) {
      const p = document.createElement("p");
      p.textContent = address.textContent.trim();
      contactContent.push(p);
    }
    if (phoneLink) {
      const a = document.createElement("a");
      a.href = phoneLink.getAttribute("href") || "";
      const phoneText = phoneLink.querySelector(".dealercontact__contact-cta-label");
      a.textContent = phoneText ? phoneText.textContent.trim() : phoneLink.textContent.trim().replace(/\s+/g, " ");
      contactContent.push(a);
    }
    if (emailLink) {
      const a = document.createElement("a");
      a.href = emailLink.getAttribute("href") || "";
      const emailText = emailLink.querySelector(".dealercontact__contact-cta-label");
      a.textContent = emailText ? emailText.textContent.trim() : "Send Mail";
      contactContent.push(a);
    }
    if (contactContent.length > 0) cells.push(contactContent);
    const hoursContent = [];
    hourItems.forEach((time) => {
      var _a, _b;
      const dayEl = (_a = time.closest(".dealercontact__info-content, .dealercontact__items")) == null ? void 0 : _a.querySelector(".mnm_dealeropening_day");
      const day = dayEl || ((_b = time.parentElement) == null ? void 0 : _b.querySelector(".mnm_dealeropening_day"));
      const fromEl = time.querySelector(".dealercontact__from");
      if (fromEl) {
        const p = document.createElement("p");
        const dayText = day ? day.textContent.trim() : "";
        p.textContent = dayText ? `${dayText}: ${fromEl.textContent.trim()}` : fromEl.textContent.trim();
        hoursContent.push(p);
      }
    });
    if (hoursContent.length > 0) cells.push(hoursContent);
    const links = [];
    const seen = /* @__PURE__ */ new Set();
    ctaLinks.forEach((a) => {
      const href = a.getAttribute("href");
      const textEl = a.querySelector(".mnm-button-label, span");
      const text = textEl ? textEl.textContent.trim() : a.textContent.trim();
      if (href && text && !seen.has(text)) {
        seen.add(text);
        const link = document.createElement("a");
        link.href = href;
        link.textContent = text;
        links.push(link);
      }
    });
    if (links.length > 0) cells.push(links);
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, {
      name: "hero-dealership",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse2(element, { document }) {
    let img = element.querySelector(".mediacopy__single-image img, .mediacontent__mediaContainer img");
    if (!img) {
      const allImgs = element.querySelectorAll("img");
      for (const candidate of allImgs) {
        const src = candidate.getAttribute("src") || "";
        const alt = candidate.getAttribute("alt") || "";
        if (!src.includes("spinner") && !src.includes("close.svg") && !src.includes("badge-right") && !src.includes("readmore_gradient") && !src.includes("data:image") && !src.includes("svgicon") && alt) {
          img = candidate;
          break;
        }
      }
    }
    let heading = element.querySelector(".mediacontent__copyContainer--headline.desktop-teaser-headline");
    if (!heading) {
      heading = element.querySelector(".mediacontent__copyContainer--headline");
    }
    if (!heading) {
      heading = element.querySelector("h3:not(.mobile-teaser-headline), h2:not(.mobile-teaser-headline)");
    }
    const sectionHeadline = element.querySelector(".c-section-headline__title h2");
    const descContainer = element.querySelector(".mediacontent__copyContainer--copy");
    const descParagraphs = descContainer ? descContainer.querySelectorAll("p") : [];
    const ctaContainer = element.querySelector(".mediacontent__copyContainer--buttons");
    const ctaLinks = ctaContainer ? ctaContainer.querySelectorAll("a") : element.querySelectorAll(".mediacontent__copyContainer--button");
    const links = [];
    const seen = /* @__PURE__ */ new Set();
    ctaLinks.forEach((a) => {
      const href = a.getAttribute("href");
      const textEl = a.querySelector(".mnm-auto-dlo-text, .mnm-button-label, span");
      const text = textEl ? textEl.textContent.trim() : a.textContent.trim();
      if (href && text && !seen.has(href)) {
        seen.add(href);
        const link = document.createElement("a");
        link.href = href;
        link.textContent = text;
        links.push(link);
      }
    });
    const cells = [];
    if (img) {
      const imgClone = img.cloneNode(true);
      cells.push([imgClone]);
    }
    const textContent = [];
    if (sectionHeadline) {
      const h = document.createElement("h2");
      h.textContent = sectionHeadline.textContent.trim();
      textContent.push(h);
    }
    if (heading) {
      const h = document.createElement("h3");
      h.textContent = heading.textContent.trim();
      textContent.push(h);
    }
    descParagraphs.forEach((p) => {
      const text = p.textContent.trim();
      if (text) {
        const para = document.createElement("p");
        if (p.querySelector("strong")) {
          const strong = document.createElement("strong");
          strong.textContent = text;
          para.appendChild(strong);
        } else {
          para.textContent = text;
        }
        textContent.push(para);
      }
    });
    links.forEach((link) => {
      const p = document.createElement("p");
      p.appendChild(link);
      textContent.push(p);
    });
    if (textContent.length > 0) {
      cells.push(textContent);
    }
    if (cells.length === 0) return;
    const block = WebImporter.Blocks.createBlock(document, {
      name: "columns-feature",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-about.js
  function parse3(element, { document }) {
    const items = element.querySelectorAll(".productservice__item, li");
    const cells = [];
    items.forEach((item) => {
      var _a, _b;
      const img = item.querySelector("img");
      const heading = item.querySelector("h4, h3, .productservice__headline");
      const desc = item.querySelector("p, .productservice__copy");
      const cta = item.querySelector("button, a.c-button");
      const row = [];
      if (img) {
        row.push(img);
      }
      const textContent = [];
      if (heading) {
        const h5 = document.createElement("h5");
        h5.textContent = heading.textContent.trim();
        textContent.push(h5);
      }
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc.textContent.trim();
        textContent.push(p);
      }
      if (cta && cta.textContent.trim()) {
        const link = document.createElement("a");
        link.href = cta.href || "#";
        link.textContent = ((_b = (_a = cta.querySelector(".mnm-button-label")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || cta.textContent.trim();
        textContent.push(link);
      }
      if (textContent.length > 0) {
        row.push(textContent);
      }
      if (row.length > 0) {
        cells.push(row);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards-about",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-offers.js
  function parse4(element, { document }) {
    const items = element.querySelectorAll('.onecolumnteaser, .hl-offers__slide, [class*="onecolumnteaser"]');
    const cells = [];
    items.forEach((item) => {
      var _a, _b;
      const img = item.querySelector("img");
      const badge = item.querySelector('.onecolumnteaser__info--label, [class*="label"]');
      const modelName = item.querySelector(".onecolumnteaser__info--headline, h3, h4");
      const offerText = item.querySelector(".onecolumnteaser__info--subline, .onecolumnteaser__info--copy, p");
      const cta = item.querySelector("a, button");
      const row = [];
      if (img) {
        row.push(img);
      }
      const textContent = [];
      if (badge) {
        const p = document.createElement("p");
        p.textContent = badge.textContent.trim();
        textContent.push(p);
      }
      if (modelName) {
        const h5 = document.createElement("h5");
        h5.textContent = modelName.textContent.trim();
        textContent.push(h5);
      }
      if (offerText) {
        const p = document.createElement("p");
        p.textContent = offerText.textContent.trim();
        textContent.push(p);
      }
      if (cta && cta.href) {
        const link = document.createElement("a");
        link.href = cta.href;
        link.textContent = ((_b = (_a = cta.querySelector(".mnm-button-label, span")) == null ? void 0 : _a.textContent) == null ? void 0 : _b.trim()) || cta.textContent.trim();
        textContent.push(link);
      }
      if (textContent.length > 0) {
        row.push(textContent);
      }
      if (row.length > 0) {
        cells.push(row);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "carousel-offers",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/banner-terms.js
  function parse5(element, { document }) {
    const paragraphs = element.querySelectorAll("p, .shortnote__copy p, .mediacontent__copyContainer--copy p, sup, sub");
    const cells = [];
    paragraphs.forEach((p) => {
      const text = p.textContent.trim();
      if (text) {
        const para = document.createElement("p");
        para.textContent = text;
        cells.push([para]);
      }
    });
    if (cells.length === 0) {
      const text = element.textContent.trim();
      if (text) {
        const para = document.createElement("p");
        para.textContent = text;
        cells.push([para]);
      }
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "banner-terms",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/motorrad-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "section.cookielayer",
        ".cookielayer",
        ".mnm-cookieoverlay",
        ".map__cookies-disabled",
        ".c-content-modal",
        ".c-content-modal__backdrop"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".dealertoolbar",
        ".dealertoolbar__wrapper"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".bikepricedetails",
        ".bike-price-details"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".map__container",
        ".mnm-map-container",
        '[class*="map__fallback"]',
        '[class*="map__cookies"]'
      ]);
      element.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (src.includes("maps.googleapis.com") || src.includes("maps.gstatic.com")) {
          const parent = img.closest("p") || img.parentElement;
          if (parent) parent.remove();
          else img.remove();
        }
      });
      element.querySelectorAll("img").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (src.includes("readmore_gradient")) {
          const wrapper = img.closest(".readmore") || img.closest("p") || img.parentElement;
          if (wrapper) wrapper.remove();
          else img.remove();
        }
      });
      element.querySelectorAll('.readmore, [class*="readmore"]').forEach((el) => el.remove());
      element.querySelectorAll("p, div, span").forEach((el) => {
        if (el.textContent.trim() === "+ Read more" || el.textContent.trim() === "Read more") {
          el.remove();
        }
      });
      WebImporter.DOMUtils.remove(element, [
        ".mobile-teaser-headline",
        ".mnm-if-mobile-or-tablet-portrait",
        ".mnm-dc-if-mobile",
        '[class*="mobile-teaser"]'
      ]);
      element.querySelectorAll("div").forEach((div) => {
        const codes = div.querySelectorAll("code");
        if (codes.length >= 4) {
          const text = Array.from(codes).map((c) => c.textContent).join("");
          if (text.includes("\u2192") && text.includes("\u2191") && text.includes("+")) {
            div.remove();
          }
        }
      });
      element.querySelectorAll("p").forEach((p) => {
        const text = p.textContent.trim();
        if (text.includes("Map data \xA9") || text.includes("Map DataMap") || text.includes("Keyboard shortcuts") || text.includes("Click to toggle between metric") || text.includes("Report a map error") || text === "100 m" || text.includes("Cookie consent required to use location service") || text === "Activate") {
          p.remove();
        }
      });
      element.querySelectorAll("p").forEach((p) => {
        const links = p.querySelectorAll("a");
        if (links.length > 0 && !p.textContent.trim()) {
          p.remove();
        }
      });
      element.querySelectorAll('img[src*="spinner"], img[src*="close.svg"], img[src*="badge-right"]').forEach((img) => {
        const wrapper = img.closest("p") || img.parentElement;
        if (wrapper && !wrapper.querySelector('img:not([src*="spinner"]):not([src*="close"]):not([src*="badge"])')) {
          wrapper.remove();
        } else {
          img.remove();
        }
      });
      element.querySelectorAll('img[src^="blob:"]').forEach((img) => {
        const alt = (img.getAttribute("alt") || "").toLowerCase();
        const src = img.getAttribute("src");
        const imageMap = {
          "cotswold motorrad": "/content/dam/bmwmotorradnsc/marketGB_DEALER/www_cotswold-cheltenham_bmw-motorrad_co_uk/cotswold-motorrad-header-image.jpg",
          "driver sat on a motorbike": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/stocklocator1920x1080.jpg",
          "2 motorcyclist on bmw motorbikes riding on a road with the sun": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/demo-tour-snippet-1920x1080.jpg",
          "2 motorcyclist on bmw motorbikes riding on a road": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/nsc-brand-campaign-2026-mediacopy-03.jpg",
          "rider walking towards a used red": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/approvedusedbikes1920x1080.jpeg",
          "black premium bmw motorbike": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/r181920x1080.jpg",
          "bmw motorrad employee servicing": "/content/dam/bmwmotorradnsc/common/dealer_master/home/services/Home_Productservice3.jpg",
          "man signing bmw finance": "/content/dam/bmwmotorradnsc/common/dealer_master/home/services/Home_Productservice6.jpg",
          "man walking while taking off white helmet": "/content/dam/bmwmotorradnsc/common/dealer_master/home/services/Home_Productservice1.jpg",
          "woman pushing bmw motorbike": "/content/dam/bmwmotorradnsc/common/dealer_master/home/services/Home_Productservice2jpg.jpg",
          "blue bmw f 900 r motorbike": "/content/dam/bmwmotorradnsc/marketGB/bmw-motorrad_co_uk/multiimages/r1300rt2.jpg",
          "blue bmw f 450 gs": "/content/dam/bmwmotorradnsc/marketGB/bmw-motorrad_co_uk/multiimages/f450gs-1920x1080.jpg",
          "driver on a new bmw motorbike riding through": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/perfectbmw1920x1080.jpg",
          "group of bmw motorbike riders on race track": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/motorrad-performance-academy.jpg",
          "rookie to rider instructor": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/r2r1920x1080.jpg",
          "man in a bmw motorbike service garage on the phone": "/content/dam/bmwmotorradnsc/common/dealer_master/home/services/Home_Service_Kontakt.jpg",
          "people trying out a bmw motorbike": "/content/dam/bmwmotorradnsc/common/dealer_master/home/services/Home_Mehr_Sein_Shop.jpg",
          "person getting on a bmw bike": "/content/dam/bmwmotorradnsc/common/multiimages/images/experience/stories/sport/hp4race_chasing_the_impossible/HP4RACE-0E31-YN2E-story-cti-media-copy-peter-hickman-1920x1080-1.jpg",
          "bmw f 900 r motorbike parked on a rooftop": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/f-900-r-highlight-offers-roln.jpg",
          "person riding a red bmw motorbike": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/f900-xr-highlight-offers-roln.jpg",
          "woman stood beside a bmw motorbike": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/r-12-highlight-offers-roln.jpg",
          "two bmw motorbikes parked side by side": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/s1000-xr-highlight-offers-roln.jpg",
          "motorcyclist riding through a road surrounded by wheat": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/k-1600-gt-se-carousel.jpg",
          "2 bmw motorbikes parked side by side": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/q2-trade-in-offer-1920x1080.jpg",
          "person riding bmw motorbike into the sunset": "/content/dam/bmwmotorradnsc/marketGB_DEALER/common/multiimages/luggage-offer-1920x1080.jpg",
          "man pushing bmw motorbike into": "/content/dam/bmwmotorradnsc/common/dealer_master/home/ueber_uns/Home_Ueber_Uns.jpg",
          "rider on a bmw motorbike riding in the countryside": "/content/dam/bmwmotorradnsc/common/dealer_master/home/Home_Probefahrt.jpg"
        };
        for (const [key, damUrl] of Object.entries(imageMap)) {
          if (alt.includes(key)) {
            img.setAttribute("src", `https://www.bmw-motorrad.co.uk${damUrl}`);
            break;
          }
        }
      });
      element.querySelectorAll('img[src^="blob:"]').forEach((img) => {
        const parent = img.closest("p");
        if (parent && parent.children.length === 1) {
          parent.remove();
        }
      });
      const firstChildren = element.querySelectorAll(":scope > p, :scope > div > p");
      firstChildren.forEach((p) => {
        const text = p.textContent.trim();
        if (text === "*" || text.startsWith("*All prices include VAT") || text.startsWith("All motorcycles are delivered with the legally required")) {
          p.remove();
        }
      });
      element.querySelectorAll('a[href="javascript:void(0);"], a[href="#"]').forEach((a) => {
        const parent = a.closest("p");
        if (parent && parent.querySelectorAll("a").length === parent.children.length && !parent.textContent.trim()) {
          parent.remove();
        }
      });
      element.querySelectorAll('[style*="overflow: hidden"]').forEach((el) => {
        el.style.overflow = "visible";
      });
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "header#pageHeader",
        "#pageHeader",
        ".navigationContainer",
        "nav.mainnavigation",
        "footer#pageFooter",
        "#pageFooter",
        "section.footernavigation",
        ".dealertoolbar",
        ".login-flyout",
        ".dealer-flyout",
        ".skip-content",
        'img[alt="spinner"]',
        "iframe",
        "link",
        "noscript"
      ]);
      const serviceTabs = element.querySelectorAll(".dealercontact__panel-wrapper.dealercontact__openingtimes.mnm-service-tab");
      serviceTabs.forEach((tab) => tab.remove());
      WebImporter.DOMUtils.remove(element, [
        ".mnm-service-label-mobile",
        ".mnm-sale-label-mobile"
      ]);
      element.querySelectorAll("[data-track]").forEach((el) => el.removeAttribute("data-track"));
      element.querySelectorAll("[onclick]").forEach((el) => el.removeAttribute("onclick"));
      element.querySelectorAll(".splide__legacy-carousel-pagination, .carousel__pagination, .splide__arrows").forEach((el) => el.remove());
      element.querySelectorAll("p").forEach((p) => {
        if (!p.textContent.trim() && !p.querySelector("img, a")) {
          p.remove();
        }
      });
      element.querySelectorAll("p").forEach((p) => {
        const text = p.textContent.trim();
        if (text.startsWith("By using Google Maps")) {
          p.remove();
        }
      });
    }
  }

  // tools/importer/import-motorrad-homepage.js
  var parsers = {
    "hero-dealership": parse,
    "columns-feature": parse2,
    "cards-about": parse3,
    "carousel-offers": parse4,
    "banner-terms": parse5
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "motorrad-homepage",
    description: "BMW Motorrad dealer homepage with hero, model range, offers, services, and dealer locator",
    urls: ["https://www.bmw-motorrad.co.uk/cotswold-cheltenham/en/home.html"],
    blocks: [
      {
        name: "hero-dealership",
        instances: [".dealerheader__container"]
      },
      {
        name: "columns-feature",
        instances: ["section.mediacopy"]
      },
      {
        name: "cards-about",
        instances: [".productservice-items"]
      },
      {
        name: "carousel-offers",
        instances: [".hl-offers__slider"]
      },
      {
        name: "banner-terms",
        instances: [".shortnote"]
      }
    ]
  };
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
  var import_motorrad_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
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
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
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
  return __toCommonJS(import_motorrad_homepage_exports);
})();
