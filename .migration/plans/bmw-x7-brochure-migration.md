# BMW X7 Luxury Brochure - EDS Migration Plan

## Overview

**Source site:** BMW X7 Luxury Brochure (https://luxury-brochures.bmw.co.uk/x7/) — built on the **Foleon** platform (a digital publishing/brochure SaaS). The site is a rich, scroll-driven digital brochure with fullscreen hero imagery, scroll-triggered fade-in animations, overlay popups, and a persistent brochure navigation bar.

**Target:** Like-for-like replica in Adobe Edge Delivery Services, under a `brochures/` folder.

**Pages in scope:**
1. **Introduction** (`/x7/`) — 21 sections: hero with BMW X7 image, animated text reveals ("THIS IS FORWARDISM", "ELEGANCE IN EVERY DETAIL"), large car imagery, body copy, BMW for Business CTA, embedded iframe footer
2. **Exterior Design** (`/x7/exterior-design`) — 19 sections: hero with headline + CTA links iframe, blockquote, interactive hotspot image ("KEY HIGHLIGHTS" with clickable overlay icons), image+text columns ("PURE CHARISMA", "A STATEMENT THAT ATTRACTS ATTENTION"), CTA link cards, footer iframe
3. **Interior Design** (`/x7/interior-design`) — richest page: hero CTA banner cards, dual-image sections, image+text columns ("OPULENT UPHOLSTERY", "DIGITAL DRIVING EXPERIENCE"), statistics block (legroom/capacity/seats), numbered feature cards with overlays, dimensions download, CTA link cards, footer iframe

---

## Site Analysis Summary

### Platform & Architecture
- Built on **Foleon** (digital publishing platform) — uses styled-components (CSS-in-JS), IntersectionObserver-driven scroll animations
- All sections use `in-viewport-pending` / `in-viewport` class toggling to trigger CSS transitions (fade/slide on scroll)
- Navigation is a persistent top bar with page index (10 brochure pages) + previous/next page arrows
- Footer is loaded via iframe from `handbook.itsjuice.com`
- Hero "CTA links" (Build now, New Car Locator, Test Drive, Offers) also loaded via iframe from itsjuice.com
- Overlay popups triggered via `?overlay=Name` URL params

### Key Interaction Patterns
1. **Scroll-triggered animations**: Sections fade/slide in when scrolling into viewport (`in-viewport-pending` → `in-viewport`)
2. **Overlay modals**: Feature highlights open overlays via URL parameter (e.g., `?overlay=Alloy-Wheels`)
3. **Persistent brochure nav**: Fixed top navigation with page index dropdown and prev/next pagination
4. **Fullscreen background images**: Multiple sections use CSS background-image for fullbleed imagery
5. **Text reveal animations**: Headings appear with fade-up transitions on scroll

### Visual Design Tokens
- **Background**: Black (#000) / very dark
- **Text**: White primary, grey secondary
- **Accents**: BMW Blue for links/CTAs
- **Typography**: BMW proprietary font (already available in project as BMWTypeNextLatin)
- **Layout**: Full-width sections, centered content areas, large imagery

---

## Proposed Block Architecture

### New Blocks to Create (under `blocks/`)

| # | Block Name | Purpose | Used On |
|---|-----------|---------|---------|
| 1 | **brochure-nav** | Persistent top navigation bar with logo, page index dropdown, prev/next arrows | All 3 pages |
| 2 | **brochure-hero** | Fullscreen hero section with background image, optional heading overlay | Intro, Exterior |
| 3 | **brochure-text-reveal** | Animated text section with subtitle, separator line, heading(s) that fade in on scroll | Intro (x3), Exterior |
| 4 | **brochure-image-full** | Full-width image section (no text overlay) | Intro (x4) |
| 5 | **brochure-image-text** | Side-by-side or stacked image + text with separator, heading, paragraph | Exterior (x2), Interior (x2) |
| 6 | **brochure-blockquote** | Image alongside a styled blockquote | Exterior |
| 7 | **brochure-hotspot** | Interactive image with clickable hotspot icons that trigger overlays | Exterior |
| 8 | **brochure-cta-cards** | Row of linked image cards (Build now, Locator, Test Drive, Offers) | Exterior, Interior |
| 9 | **brochure-hero-cards** | Hero section with overlapping small CTA cards at top | Interior |
| 10 | **brochure-dual-image** | Two side-by-side images section | Interior |
| 11 | **brochure-stats** | Large statistics display (number + label columns) | Interior |
| 12 | **brochure-features** | Numbered feature cards with title, overlay link | Interior |
| 13 | **brochure-body** | Simple body text section (heading + paragraph, centered) | Intro, Interior |
| 14 | **brochure-promo** | CTA banner section (e.g., BMW for Business) with text + image | Intro |
| 15 | **brochure-footer** | Brochure-specific footer with social links, useful tools, contact, legal | All 3 pages |
| 16 | **brochure-overlay** | Modal overlay triggered by URL params for feature detail popups | Exterior, Interior |
| 17 | **brochure-dimensions** | Dimensions download section with icon + text + download link | Interior |

### Shared Infrastructure

| Item | Purpose |
|------|---------|
| **Scroll animation system** | IntersectionObserver-based utility in `scripts/` to add `in-viewport` classes, triggering CSS transitions |
| **Brochure theme CSS** | Global brochure styles in `styles/` — dark theme, BMW typography, section transitions |
| **Page navigation data** | JSON or authored content defining the brochure page order for prev/next links |

---

## Implementation Plan

### Phase 1: Foundation & Infrastructure
- [ ] **1.1** Create `brochures/` content folder structure (`brochures/x7/`, `brochures/x7/exterior-design/`, `brochures/x7/interior-design/`)
- [ ] **1.2** Create brochure theme CSS (`styles/brochure-theme.css`) — dark background, white text, full-width sections, BMW typography tokens, responsive breakpoints
- [ ] **1.3** Create scroll animation utility (`scripts/brochure-animations.js`) — IntersectionObserver that toggles `in-viewport` class on sections, with configurable thresholds and transition delays
- [ ] **1.4** Create brochure page data structure for navigation (page order, titles, URLs)

### Phase 2: Shared Blocks (used across pages)
- [ ] **2.1** Build `brochure-nav` block — persistent top bar with BMW logo, page index dropdown, prev/next pagination arrows
- [ ] **2.2** Build `brochure-footer` block — social links, useful tools, contact info, legal text (replicate iframe footer content as native EDS)
- [ ] **2.3** Build `brochure-cta-cards` block — row of 4 linked image cards for external CTAs
- [ ] **2.4** Build `brochure-overlay` block — modal overlay system triggered by URL hash/params
- [ ] **2.5** Build `brochure-image-text` block — image + text column layout with separator line, heading, body text (supports left/right image variants)
- [ ] **2.6** Build `brochure-body` block — centered text section with optional heading + paragraph

### Phase 3: Introduction Page Blocks & Content
- [ ] **3.1** Build `brochure-hero` block — fullscreen background image with optional overlay content
- [ ] **3.2** Build `brochure-text-reveal` block — subtitle + hr + animated headings (fade-up on scroll)
- [ ] **3.3** Build `brochure-image-full` block — fullwidth image display
- [ ] **3.4** Build `brochure-promo` block — text + image CTA panel (BMW for Business)
- [ ] **3.5** Author Introduction page HTML content (`content/brochures/x7/index.html`)
- [ ] **3.6** Preview and validate Introduction page against original

### Phase 4: Exterior Design Page Blocks & Content
- [ ] **4.1** Build `brochure-blockquote` block — image + styled blockquote
- [ ] **4.2** Build `brochure-hotspot` block — car image with positioned hotspot buttons that trigger overlays
- [ ] **4.3** Create overlay content for Exterior features (Alloy Wheels, Soft-close Doors, LED Headlights, Roof Rails)
- [ ] **4.4** Author Exterior Design page HTML content (`content/brochures/x7/exterior-design.html`)
- [ ] **4.5** Preview and validate Exterior Design page against original

### Phase 5: Interior Design Page Blocks & Content
- [ ] **5.1** Build `brochure-hero-cards` block — hero with overlapping CTA card links
- [ ] **5.2** Build `brochure-dual-image` block — two side-by-side images
- [ ] **5.3** Build `brochure-stats` block — large number + label statistics columns
- [ ] **5.4** Build `brochure-features` block — numbered feature cards with overlay links
- [ ] **5.5** Build `brochure-dimensions` block — download section with icon + CTA
- [ ] **5.6** Author Interior Design page HTML content (`content/brochures/x7/interior-design.html`)
- [ ] **5.7** Preview and validate Interior Design page against original

### Phase 6: Cross-Page Polish & QA
- [ ] **6.1** Validate all scroll animations across pages — timing, easing, threshold consistency
- [ ] **6.2** Responsive testing — mobile, tablet, desktop breakpoints
- [ ] **6.3** Overlay functionality testing across all feature popups
- [ ] **6.4** Navigation testing — prev/next links, page index dropdown, active states
- [ ] **6.5** Visual regression comparison against original screenshots
- [ ] **6.6** Performance check — lazy loading, image optimization, LCP targets
- [ ] **6.7** Accessibility audit — keyboard navigation, screen reader, heading hierarchy
- [ ] **6.8** Run linting (`npm run lint`) and fix issues

---

## Key Technical Decisions

### 1. Iframe Content → Native EDS
The original site loads footer and hero CTA links via iframes from external domains. We will **replicate this content natively** in EDS blocks rather than embedding iframes, for better performance, SEO, and maintainability.

### 2. Scroll Animations
We will use a **shared IntersectionObserver utility** (similar to the existing Motorrad scroll animations in `scripts.js`) that:
- Observes all `.brochure section` elements
- Toggles `in-viewport` class when sections enter viewport
- CSS transitions handle the actual animation (opacity, transform)
- Configurable delay offsets for staggered animations within sections

### 3. Overlay System
Overlays will use a **URL hash-based system** (`#overlay-name`) rather than query params, so they work with EDS routing. The `brochure-overlay` block will:
- Listen for hash changes
- Show/hide modal content accordingly
- Support back button navigation

### 4. Brochure Navigation
The brochure nav is **not** the standard EDS header/footer. It will be implemented as a custom block that:
- Reads page order from authored content or a JSON config
- Renders the persistent nav bar with index dropdown
- Highlights the current page
- Provides prev/next navigation

### 5. Image Strategy
- Hero/fullscreen images: CSS `background-image` with `object-fit: cover`
- Content images: Standard `<img>` tags with lazy loading
- All images will reference the original Foleon CDN URLs initially (can be migrated to AEM DAM later)

---

## Content Structure Per Page

### Introduction (`/brochures/x7/`)
| Section | Block | Content |
|---------|-------|---------|
| 1 | brochure-nav | Navigation bar |
| 2 | brochure-hero | Fullscreen X7 front image with BMW logo overlay |
| 3 | brochure-text-reveal | "INTRODUCING THE X7" / "THIS IS FORWARDISM." |
| 4 | brochure-image-full | X7 side profile (wide crop) |
| 5 | brochure-text-reveal | "INTRODUCING THE X7" / "ELEGANCE IN EVERY DETAIL." |
| 6 | brochure-image-full | X7 front 3/4 view |
| 7 | brochure-image-full | X7 rear close-up |
| 8 | brochure-body | "INTRODUCING THE X7" / "LUXURY WITHOUT LIMITS" + paragraph |
| 9 | brochure-promo | BMW for Business CTA |
| 10 | brochure-footer | Social, tools, contact, legal |

### Exterior Design (`/brochures/x7/exterior-design`)
| Section | Block | Content |
|---------|-------|---------|
| 1 | brochure-nav | Navigation bar |
| 2 | brochure-hero | Fullscreen exterior image + "ATHLETIC AESTHETICS." heading + CTA links |
| 3 | brochure-blockquote | X7 image + design philosophy blockquote |
| 4 | brochure-hotspot | "KEY HIGHLIGHTS" — X7 image with 4 clickable hotspots |
| 5 | brochure-image-text | Rear LED image + "PURE CHARISMA" text |
| 6 | brochure-image-text (reversed) | "A STATEMENT THAT ATTRACTS ATTENTION" text + kidney grille image |
| 7 | brochure-cta-cards | Build, Locator, Test Drive, Offers cards |
| 8 | brochure-footer | Social, tools, contact, legal |

### Interior Design (`/brochures/x7/interior-design`)
| Section | Block | Content |
|---------|-------|---------|
| 1 | brochure-nav | Navigation bar |
| 2 | brochure-hero-cards | Hero with 3 CTA overlay cards + "LUXURY REDEFINED" heading + CTA links |
| 3 | brochure-dual-image | Two interior images side by side |
| 4 | brochure-image-text | Interior leather image + "OPULENT UPHOLSTERY" text |
| 5 | brochure-image-text (reversed) | "DIGITAL DRIVING EXPERIENCE" text + curved display image |
| 6 | brochure-body | "COMFORT AND PRACTICALITY" heading + paragraph |
| 7 | brochure-stats | 846-954mm Legroom / 300-2120L Capacity / 6/7 Seats |
| 8 | brochure-features | 4 numbered feature cards (Sky Lounge, Crafted Glass, M Sport Seats, Air Con) |
| 9 | brochure-dimensions | Dimensions download section |
| 10 | brochure-cta-cards | Build, Locator, Test Drive, Offers cards |
| 11 | brochure-footer | Social, tools, contact, legal |

---

## Risks & Considerations

| Risk | Mitigation |
|------|-----------|
| **Complex scroll animations may not match exactly** | Use same IntersectionObserver approach; fine-tune thresholds and easing via iterative QA |
| **Overlay content not fully captured** | Manually inspect each overlay on the original site during Phase 4-5 to capture all content |
| **Foleon-specific responsive breakpoints** | Map to standard EDS breakpoints (600px/900px/1200px); visual QA at each |
| **External iframe content may change** | We're replicating natively, so our version is a snapshot; link URLs may need updating |
| **Image loading performance** | Use lazy loading, responsive image widths, and WebP format from Foleon CDN |
| **17 new blocks is a large surface area** | Build shared blocks first (Phase 2), then page-specific; some blocks may be combinable during implementation |

---

## Checklist

- [ ] Phase 1: Foundation & Infrastructure (4 tasks)
- [ ] Phase 2: Shared Blocks (6 tasks)
- [ ] Phase 3: Introduction Page (6 tasks)
- [ ] Phase 4: Exterior Design Page (5 tasks)
- [ ] Phase 5: Interior Design Page (7 tasks)
- [ ] Phase 6: Cross-Page Polish & QA (8 tasks)

**Estimated blocks to build:** 17
**Estimated content pages:** 3
**Total checklist items:** 36

---

*This plan requires Execute mode to begin implementation. When ready, say "go" and I'll start with Phase 1.*
