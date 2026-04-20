# BMW X7 Brochure - Refinement Plan

## Overview

This plan addresses the significant differences identified between our current EDS implementation and the original BMW X7 luxury brochure site at https://luxury-brochures.bmw.co.uk/x7/. The analysis compared both desktop (1440px) and mobile (390px) viewports across all three pages.

---

## Issue Analysis

### GLOBAL ISSUE 1: Colour Scheme is Wrong (Dark Mode vs Light Mode)

**Original site:** White/light background (`rgb(255,255,255)`), dark text (`rgb(38,38,38)` / `#262626`), with the nav and content areas on a white background. The only dark sections are the footer area (dark grey `#262626` bg) and full-bleed images.

**Our implementation:** Entire page uses dark mode (black `#000` bg, white text). This is fundamentally wrong.

**Fix required:**
- [ ] **1.1** Rewrite `styles/brochure-theme.css` — change base to white bg (`#fff`), dark text (`#262626`), only footer section gets dark bg
- [ ] **1.2** Update `brochure-text-reveal` CSS — headings should be dark (`#262626`), subtitle label dark, separator dark
- [ ] **1.3** Update `brochure-body` CSS — headings dark, paragraphs dark text
- [ ] **1.4** Update `brochure-image-text` CSS — text column on white bg, dark headings, dark body text, dark separator
- [ ] **1.5** Update `brochure-blockquote` CSS — white/light bg, dark text blockquote
- [ ] **1.6** Update `brochure-hotspot` CSS — white bg, dark headings
- [ ] **1.7** Update `brochure-stats` CSS — white bg, dark numbers and labels
- [ ] **1.8** Update `brochure-features` CSS — white bg with dark borders, dark text
- [ ] **1.9** Update `brochure-dimensions` CSS — white bg, dark text
- [ ] **1.10** Update `brochure-promo` CSS — light grey bg, dark text
- [ ] **1.11** Update `brochure-overlay` CSS — keep dark overlay modal (this is correct as-is)

### GLOBAL ISSUE 2: Header Navigation is Completely Wrong

**Original site (desktop, 1440px):** The nav is a **white bar** with:
- Far left: BMW roundel logo + hamburger "Index" button
- Center: **Horizontal tab strip** showing all page names as clickable tabs: "Introduction | Exterior Design | Interior Design | Discover Your Model | Performance | My BMW App | Technology - Multimedia | Technology - Driving Assistance | BMW Ownership | Next Steps"
- Tabs are styled: `font-size: 13px`, `font-weight: 700`, `color: rgb(77,77,77)`, separated by vertical borders, `padding: 0 25px`
- Active page tab has an underline indicator
- Far right: Search icon button
- Below the main nav: a slim **page navigation bar** with prev/next arrows positioned at the **bottom-right corner** of the viewport (fixed), not in a bar

**Our implementation:** Black bg nav bar with just a BMW logo, an "Index" text button, and a dropdown menu. Completely different layout.

**Fix required:**
- [ ] **2.1** Rewrite `brochure-nav` JS — render all page names as horizontal tab links in the nav bar (not a dropdown)
- [ ] **2.2** Rewrite `brochure-nav` CSS — white bg, horizontal tab strip with vertical separators, 13px/700 font, grey text, active tab underline
- [ ] **2.3** Keep hamburger menu button for Index (left of tabs), BMW logo at far-left
- [ ] **2.4** Add search icon button at far-right (placeholder, non-functional)
- [ ] **2.5** Move prev/next page arrows to **fixed bottom-right** position as circular buttons (like original), not a nav bar

### GLOBAL ISSUE 3: Header Mobile Mode is Wrong

**Original site (mobile, 390px):** The nav collapses to:
- Just the hamburger button + BMW logo + search icon
- No visible tabs
- Tapping hamburger opens a **full-screen "Pages" overlay** with:
  - "Pages" title + close X button at top
  - Grid of **visual tile cards** — each tile shows a screenshot/thumbnail of that page with the page number and title overlaid (e.g., "01 Introduction", "02 Exterior Design", etc.)
  - Cards are stacked vertically, each showing a preview image

**Our implementation:** Shows an "Index" text button that opens a simple text dropdown. Needs the visual tile grid overlay.

**Fix required:**
- [ ] **3.1** Update `brochure-nav` JS — mobile mode: render a full-screen overlay with page tiles (image thumbnails + numbered titles)
- [ ] **3.2** Update `brochure-nav` CSS — full-screen overlay styling, tile card layout with background images, numbered labels
- [ ] **3.3** Source thumbnail images for each page tile (use hero images from each page as backgrounds)

### INTRO ISSUE 1: Large Car Outline ("THE X7") Not Rendered

**Original site:** The hero section has a large fullscreen background image with "THE" text and a massive "X7" outline overlaid on the image in white. This is part of the hero image itself (baked into the image from Foleon).

**Our implementation:** Shows the car image but the "THE X7" text overlay isn't visible. The hero image used may be the wrong crop/variant. The original uses a desktop version with the text overlay baked in at `x7_iconised_header_desktop` and a tablet version at `x7_iconised_header_tablet`.

**Fix required:**
- [ ] **4.1** Use the correct hero image — the desktop version includes the "THE X7" text overlay: `x7_iconised_header_desktop.42fef0a4b7d8.jpg`
- [ ] **4.2** Add responsive `<picture>` element with desktop and tablet image sources
- [ ] **4.3** Hero should be full viewport height with the image covering the entire section

### INTRO ISSUE 2: Page Title Shows "Index" Instead of "Introduction"

**Original site:** The nav shows "Introduction" as the active page name/tab with an underline.

**Our implementation:** Shows "Index" as text on the button.

**Fix required:**
- [ ] **4.4** This will be fixed by the nav rewrite (Issue 2) — active tab will show "Introduction" with underline

### INTRO ISSUE 3: Footer Layout is Wrong

**Original site footer:**
- Dark background (`#262626` / very dark grey)
- "Social Media" heading is **right-aligned** with social icons also right-aligned
- Below a horizontal separator line
- Three columns left-aligned: "Useful Tools" | "Contact" | "Legal" (also includes "My BMW App" link under Useful Tools)
- Below another separator: disclaimer text + copyright, both left-aligned
- Overall layout: clean, spacious, right-aligned social, left-aligned link columns

**Our implementation:** Social media is left-aligned, columns are stacked differently, overall alignment is off.

**Fix required:**
- [ ] **4.5** Rewrite `brochure-footer` CSS — "Social Media" section right-aligned (heading + icons)
- [ ] **4.6** Update footer link columns to 3-column grid left-aligned below the separator
- [ ] **4.7** Add "My BMW App" link to Useful Tools column
- [ ] **4.8** Ensure horizontal separator between social and links sections
- [ ] **4.9** Legal disclaimer section below links with proper spacing

### INTERIOR ISSUE 1: Hero CTA Links Not Visible

**Original site:** The Interior Design hero shows a fullscreen interior image with "LUXURY REDEFINED." heading at the top-left, and at the bottom: four CTA links with icons — "Build now", "New Car Locator", "Book a test drive", "Offers and Finance" — each with an SVG icon above the label, displayed as a horizontal row.

**Our implementation:** Used a `brochure-hero-cards` block with tile images that don't match. The CTAs should be icon+text links at the bottom of the hero, not image cards.

**Fix required:**
- [ ] **5.1** Rewrite `brochure-hero-cards` block — hero should show a fullscreen background image with heading at top-left and CTA icon links at bottom
- [ ] **5.2** Use the correct hero background image (the interior skylight/seats image)
- [ ] **5.3** CTA links should be icon+text format (SVG icon above label), laid out horizontally at the bottom of the hero
- [ ] **5.4** Fetch/reference the correct SVG icons from the original site: `build_now-1.svg`, `new_car_locator.svg`, `test-drive-1.svg`, `offers_and_finance.svg`

### INTERIOR ISSUE 2: Image Layouts Misaligned

**Original site:** The dual interior images are properly sized and aligned. The image-text sections use a clean 50/50 split at desktop with images edge-to-edge.

**Our implementation:** Images appear oddly cropped/sized, aspect ratios not matching original.

**Fix required:**
- [ ] **5.5** Review `brochure-dual-image` CSS — ensure images fill their containers properly with correct aspect ratios
- [ ] **5.6** Review `brochure-image-text` CSS — ensure 50/50 split at desktop with images covering their half fully

### INTERIOR ISSUE 3: Key Features Section Doesn't Match

**Original site:** The features section shows numbered items ("01", "02", etc.) with title + "Learn more" link, laid out in a horizontal row. Each card has a number, title, and small arrow link. Clean, minimal styling on white bg.

**Our implementation:** Cards have visible borders and blue accent links which don't match the subtle original styling.

**Fix required:**
- [ ] **5.7** Update `brochure-features` CSS — remove visible borders, use subtle bottom-border or no border, match the original's minimal style with dark text on white bg

### EXTERIOR ISSUE 1: Hotspot Image Design Not Premium

**Original site:** The hotspot markers are **elegant circular buttons** — thin white circle outline with a small dot in the center (like a target/crosshair). They're semi-transparent, ~40px diameter, positioned precisely on the car features. No labels visible until hover. The overall feel is clean and premium.

**Our implementation:** Blue filled circles with a "+" symbol and text labels — looks cheap and cluttered.

**Fix required:**
- [ ] **6.1** Rewrite `brochure-hotspot` CSS — hotspot markers should be thin white circular outlines (~40px) with a small centre dot, no fill color
- [ ] **6.2** Remove visible labels from hotspot buttons (show on hover only, or don't show at all — the original doesn't show labels)
- [ ] **6.3** Adjust hotspot positions to match actual feature locations on the car image more precisely
- [ ] **6.4** Use the correct car image from the original (the dark cobblestone X7 shot, not a different image)

---

## Checklist

### Global Fixes
- [ ] **1.1–1.11** Switch colour scheme from dark mode to light mode (white bg, dark text) across all blocks and theme CSS
- [ ] **2.1–2.5** Completely rewrite brochure-nav for desktop: horizontal tab strip, white bg, active state underline, fixed prev/next arrows at bottom-right
- [ ] **3.1–3.3** Rewrite brochure-nav mobile mode: fullscreen visual tile grid overlay with page thumbnails

### Introduction Page Fixes
- [ ] **4.1–4.3** Fix hero image — use correct desktop/tablet variants with "THE X7" text overlay, full viewport height
- [ ] **4.4** Fix active page name in nav (handled by nav rewrite)
- [ ] **4.5–4.9** Fix footer layout — right-align social section, 3-column links, add My BMW App link, proper separators

### Interior Design Page Fixes
- [ ] **5.1–5.4** Rewrite hero-cards block — fullscreen bg image, heading at top-left, icon+text CTA links at bottom
- [ ] **5.5–5.6** Fix image sizing/alignment in dual-image and image-text blocks
- [ ] **5.7** Fix key features styling — minimal, no visible borders, dark text on white bg

### Exterior Design Page Fixes
- [ ] **6.1–6.4** Rewrite hotspot styling — elegant white circular outlines, no labels, correct image and precise positions

### Final QA
- [ ] **7.1** Visual comparison of each page section at 1440px desktop against original screenshots
- [ ] **7.2** Visual comparison at 390px mobile
- [ ] **7.3** Test navigation: tab clicks, prev/next arrows, mobile tile overlay
- [ ] **7.4** Test scroll animations
- [ ] **7.5** Run linting (`npm run lint`)
- [ ] **7.6** Test overlay modals on exterior and interior pages

---

## Priority Order

1. **Global colour scheme fix** (affects everything, most impactful)
2. **Navigation rewrite** (second most visible difference)
3. **Footer layout fix** (shared across pages)
4. **Hero images and CTAs** (per-page hero fixes)
5. **Hotspot and features styling** (detail polish)
6. **Final QA pass**

---

*This plan requires Execute mode to begin implementation.*
