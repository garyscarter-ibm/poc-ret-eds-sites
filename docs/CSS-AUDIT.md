# CSS Audit Report

**Date:** 17 April 2026  
**Scope:** All 44 CSS files across `styles/` and `blocks/`  
**Project:** Grassicks BMW – Edge Delivery Services  

---

## Executive Summary

The codebase has **a well-structured design token system** in `styles.css` and `brochure-theme.css`, but many blocks bypass these tokens with hardcoded values. There are also **inconsistent media query breakpoints**, **mobile-first violations**, and **selector scoping issues** that deviate from the project's own AGENTS.md guidelines.

---

## 1. Inconsistent Media Query Breakpoints

### The Standard (per AGENTS.md)
> Declare styles mobile first, use `min-width` media queries at **600px / 900px / 1200px** for tablet and desktop.

### Violations

| Breakpoint Used | Expected | Files |
|---|---|---|
| `max-width: 767px` | Should be `max-width: 599px` or mobile-first | `header.css` (×3), `footer.css` (×2), `tiles-cta.css` |
| `max-width: 1023px` | Should be `max-width: 899px` or mobile-first | `header.css`, `footer.css` (×2), `styles.css` (×2) |
| `min-width: 768px` | Should be `min-width: 600px` | `cards-news.css`, `cards-car-locator.css`, `carousel-offers.css`, `carousel-models.css`, `cards-promo.css` (×2), `tiles-cta.css`, `tiles-contact.css`, `columns-model-showcase.css`, `header.css` |
| `min-width: 1024px` | Should be `min-width: 900px` or `1200px` | `carousel-offers.css`, `carousel-models.css`, `cards-promo.css`, `tiles-contact.css`, `header.css` |
| `max-width: 899px` | Mobile-first violation | `brochure-text-reveal.css` |

**Impact:** 15+ blocks use non-standard breakpoints. This creates inconsistent layout shift points where some blocks reflow at 768px while their neighbours wait until 900px.

### Recommendation
Standardise all breakpoints to **600px / 900px / 1200px** `min-width` only. Eliminate `max-width` queries in favour of mobile-first overrides.

---

## 2. Mobile-First Violations (`max-width` queries)

The following files use desktop-first `max-width` media queries instead of mobile-first `min-width`:

| File | max-width queries |
|---|---|
| `brochure-footer.css` | `max-width: 599px`, `min-width: 600px and max-width: 899px` |
| `brochure-text-reveal.css` | `max-width: 899px` |
| `columns-feature.css` | `max-width: 599px` (×3), `min-width: 600px and max-width: 899px` (×3) |
| `columns-model-showcase.css` | `max-width: 767px`, `min-width: 768px and max-width: 1023px` |
| `footer.css` | `max-width: 1023px` (×2), `max-width: 767px` (×2) |
| `header.css` | `max-width: 767px` (×3), `max-width: 1023px` |
| `styles.css` | `max-width: 1023px` (×2), `max-width: 599px` |
| `tiles-cta.css` | `max-width: 767px` |

**Total:** ~20 `max-width` media queries across 8 files.

### Recommendation
Refactor to mobile-first. Define base styles for mobile, then progressively enhance with `min-width` queries.

---

## 3. Hardcoded Colour Values (Token Bypass)

`styles.css` defines a comprehensive set of CSS custom properties (`--color-text`, `--color-white`, `--color-bmw-blue`, etc.) and `brochure-theme.css` defines `--brochure-text`, `--brochure-bg`, etc. However, many blocks hardcode the same values:

### Hardcoded `#262626` (should be `var(--color-text)` or `var(--brochure-text)`)
- `brochure-text-reveal.css` (×2)
- `brochure-body.css`
- `brochure-nav.css` (×6)

### Hardcoded `#fff` / `#000` (should be `var(--color-white)` / `var(--color-black)`)
- `brochure-cta-cards.css`: `color: #fff`
- `brochure-features.css`: `color: #fff` (×3)
- `brochure-hero.css`: `color: #fff` (×2)
- `brochure-hero-cards.css`: `color: #fff` (×3)
- `brochure-locked.css`: `color: #fff`
- `hero-brochure.css`: `color: #fff` (×3)
- `brochure-nav.css`: `background: #fff`, `color: #fff`
- `brochure-footer.css`: `color: #fff` (×3)
- `brochure-promo.css`: `color: #fff` (×3)

### Hardcoded `#f5f5f5` (should be `var(--color-background-grey)`)
- `brochure-promo.css`: `background: #f5f5f5`

### Hardcoded `#4d4d4d` (should be `var(--brochure-text-secondary)`)
- `brochure-nav.css`: `color: #4d4d4d`

### Hardcoded `#666` (should be `var(--color-text-light)` or `var(--brochure-text-muted)`)
- `brochure-cta-cards.css`: `background: #666` (×2)
- `cta-bar.css`: `background: #666` (×2)

### Hardcoded `#1a1a1a`, `#333`, `#555`, `#e6e6e6`, `#e0e0e0`
- `brochure-features.css`: `background: #1a1a1a`, `background: #262626`
- `brochure-locked.css`: `background: #1a1a1a`
- `brochure-overlay.css`: `background: #1a1a1a`
- `brochure-footer.css`: `background: #333`
- `brochure-stats.css`: `background: #e6e6e6`

### Brand-specific hardcoded colours (not tokenised)
- `#01693e` (MINI green): `cards-about.css`, `hero-dealership.css`, `cards-promo.css`
- `#0085ac` (MINI teal): `tabs-dealer-locator.css` (×2)
- `#d4af37` / `#d4a843` (MINI gold stars): `hero-dealership.css`, `columns-feature.css`
- `#1b3fb7` (MINI blue): `carousel-models.css`

**Impact:** If the brand palette ever changes, dozens of files must be updated individually. MINI and Motorrad brand colours have no tokens at all.

### Recommendation
1. Add MINI brand tokens: `--mini-green`, `--mini-teal`, `--mini-blue`, `--mini-gold-star`
2. Add shared tokens for dark backgrounds: `--color-dark-bg: #1a1a1a`, `--color-grey-bg: #e6e6e6`
3. Replace all hardcoded hex values with their corresponding tokens

---

## 4. Hardcoded `font-size` in `px` (Should use `rem`)

The global system uses `rem` units (e.g. `--body-font-size: 1rem`, `--heading-font-size-l: 1.5rem`). These blocks use `px` instead:

| File | Values |
|---|---|
| `brochure-text-reveal.css` | `12px`, `80px`, `50px` |
| `brochure-footer.css` | `18px` (×2), `14px`, `11px` |
| `brochure-promo.css` | `25px`, `15px` (×2), `22px` |
| `brochure-nav.css` | `13px` |
| `hotspot-image.css` | `16px` |
| `hero-dealership.css` | `16px` (×2) |
| `columns-feature.css` | `16px` |

**Impact:** Accessibility concern — `px` font sizes don't scale with user browser zoom preferences. `rem` units respect the user's root font-size setting.

### Recommendation
Convert all `font-size` declarations to `rem` or use design token variables.

---

## 5. Hardcoded `line-height` in `px`

Several blocks use fixed `px` line-heights instead of unitless ratios:

| File | Values |
|---|---|
| `brochure-text-reveal.css` | `84px`, `52.5px` |
| `brochure-promo.css` | `35px`, `21px` |
| `columns-feature.css` | `38px`, `36px`, `32px`, `22px`, `24px`, `73px` |
| `carousel-offers.css` | `24px`, `22px`, `16px` |
| `carousel-models.css` | Various |
| `hero-dealership.css` | `44px`, `18px`, `17px`, `24px` |

**Impact:** Fixed `px` line-heights don't scale proportionally when font-size changes, potentially causing text overlap.

### Recommendation
Use unitless line-height values (e.g. `1.2`, `1.4`, `1.5`) matching the global `--body-line-height: 1.5` and `--heading-line-height: 1.2`.

---

## 6. `stylelint-disable` Blanket Suppressions

Two files disable stylelint entirely with no targeted rules:

| File | Status |
|---|---|
| `brochure-text-reveal.css` | `/* stylelint-disable */` |
| `brochure-footer.css` | `/* stylelint-disable */` |

Plus global files:
| File | Status |
|---|---|
| `styles.css` | `/* stylelint-disable */` |
| `shared-components.css` | `/* stylelint-disable */` |

**Impact:** Suppresses all lint warnings, hiding potential issues.

### Recommendation
Replace blanket disables with targeted per-rule disables only where genuinely needed (e.g. `/* stylelint-disable selector-max-specificity */`). Investigate what rules are being violated and fix where possible.

---

## 7. Selector Scoping Issues

### AGENTS.md Rule
> Ensure all selectors are scoped to the block: `.{blockname} .item-list` (Good) vs `.item-list` (Bad)

### Violations

**`cards-about.css`** — Styles the section container directly:
```css
main > .section.cards-about-container {
  background-color: var(--color-background-grey, #f5f5f5);
}
```

**`cards-car-locator.css`** — Full-width breakout via section container:
```css
main > .section.cards-car-locator-container {
  width: 100vw;
  max-width: none;
  position: relative;
  left: 50%;
  margin-left: -50vw;
}
```

**`columns-model-showcase.css`** — Styles wrapper and container outside block:
```css
.columns-model-showcase-wrapper { ... }
main > .section.columns-model-showcase-container { ... }
main > .section > .columns-model-showcase-wrapper { ... }
```

**`carousel-models.css`** – Section container styling:
```css
.section.carousel-models-container { padding: 0; }
```

**`carousel-offers.css`** — Multiple section/wrapper selectors:
```css
main > .section.carousel-offers-container:has(.carousel-offers.mini) { ... }
```

**`cards-promo.css`** — Uses `-wrapper` and `-container` class names:
```css
.cards-promo-wrapper { ... }
.cards-promo-container:has(.mini) { ... }
```

### AGENTS.md `-container`/`-wrapper` Warning
> Avoid classes `{blockname}-container` and `{blockname}-wrapper` as those are used on sections and could be confusing.

The following blocks style these AEM-generated section classes directly, which is a known pattern in AEM EDS but should be documented when used:
- `cards-about.css`
- `cards-car-locator.css`  
- `cards-promo.css`
- `carousel-models.css`
- `carousel-offers.css`
- `columns-feature.css`
- `columns-model-showcase.css`
- `hero-dealership.css`

### Recommendation
Where section-level styling is necessary (full-width breakouts, background colours), document it clearly with a comment explaining why. For blocks that create their own `-container` classes via JS (e.g. `hotspot-image-container`, `brochure-hotspot-image-container`), rename these to avoid confusion with AEM's auto-generated section classes.

---

## 8. Duplicate / Near-Duplicate Blocks

### `brochure-hero-cards` vs `hero-brochure`

These two blocks are nearly identical in structure and styling:

| Property | `brochure-hero-cards.css` | `hero-brochure.css` |
|---|---|---|
| Hero min-height | `100vh` | `100vh` |
| Heading font-size | `clamp(2rem, 5vw, 3.5rem)` | `clamp(2rem, 5vw, 3.5rem)` |
| CTA label font-size | `0.6875rem` | `0.6875rem` |
| CTA icon size | `32px → 40px` | `32px → 40px` |
| Heading padding mobile | `80px 32px 0` | `80px 32px 0` |

**Impact:** Code duplication increases maintenance burden. A change in one must be mirrored in the other.

### `brochure-cta-cards` vs `cta-bar`

Nearly identical grid of icon+label cards:

| Property | `brochure-cta-cards.css` | `cta-bar.css` |
|---|---|---|
| Background | `#666` | `#666` |
| Grid | `repeat(2, 1fr)` → `repeat(4, 1fr)` | `repeat(2, 1fr)` → `repeat(4, 1fr)` |
| Icon height | `48px → 56px → 64px` | `48px → 56px → 64px` |
| Label font-size | `0.6875rem` | `0.6875rem` |

### Recommendation
Consider consolidating duplicate blocks or extracting shared styles into `shared-components.css`.

---

## 9. Inconsistent Font Family References

The project uses three font families but references them inconsistently:

### BMW Font
| Reference | Used In |
|---|---|
| `var(--body-font-family)` | `styles.css`, `footer.css` (correct) |
| `var(--heading-font-family)` | Motorrad variants (correct) |
| `var(--brochure-font)` | `brochure-theme.css` blocks (correct) |
| `BMWTypeNextLatin, bmw-fallback, sans-serif` | Hardcoded in 0 block files (good) |
| `var(--brochure-font, BMWTypeNextLatin, sans-serif)` | Several brochure blocks — redundant fallback |

### MINI Fonts
- `MINISerif-Regular, serif` — some files
- `MINISerif-Bold, serif` — some files
- `MINISerif-Bold, sans-serif` — **inconsistent fallback** in `columns-feature.css` (serif font with sans-serif fallback)
- `MINISansSerif-Regular, sans-serif` — consistent
- `MINISansSerif-Bold, MINISansSerif-Regular, sans-serif` — only in `footer.css`

**Issue:** `MINISerif-Bold` is declared in `fonts.css` as a separate `font-family` name rather than as a bold weight of `MINISerif-Regular`. This means you can't just set `font-weight: bold` on `MINISerif-Regular` — you must explicitly switch font-family names.

**Issue:** `columns-feature.css` line 474 uses `MINISerif-Bold, sans-serif` — a serif design font should fall back to `serif`, not `sans-serif`.

### Recommendation
1. Create MINI font CSS custom properties: `--mini-font-serif`, `--mini-font-sans`
2. Fix `MINISerif-Bold, sans-serif` → `MINISerif-Bold, serif`
3. Remove redundant fallback stacks from `var()` references (e.g. `var(--brochure-font, BMWTypeNextLatin, sans-serif)` → `var(--brochure-font)`)

---

## 10. Inconsistent Spacing Values

The design system defines spacing tokens:
```css
--spacing-xs: 8px;   --spacing-s: 16px;   --spacing-m: 24px;
--spacing-l: 32px;    --spacing-xl: 48px;  --spacing-xxl: 64px;
```

But many blocks use arbitrary hardcoded values:

| Hardcoded Value | Closest Token | Example Files |
|---|---|---|
| `7px` | — (no token) | `banner-terms.css` |
| `12px` | `--spacing-xs` (8px) | Multiple blocks |
| `14px` | — (no token) | `tiles-contact.css`, `cards-promo.css` |
| `20px` | — (between s/m) | Many blocks |
| `22px` | — (no token) | `carousel-offers.css`, `footer.css` |
| `28px` | — (no token) | `cards-about.css`, `tiles-contact.css` |
| `35px` | — (no token) | `cards-about.css`, `cards-news.css` |
| `40px` | — (between l/xl) | Many brochure blocks |
| `56px` | — (no token) | `hero-dealership.css` |
| `60px` | — (no token) | Many brochure blocks |
| `80px` | `--spacing-section` (80px) | Brochure blocks (but hardcoded) |
| `100px` | — (no token) | Brochure blocks |
| `120px` | — (no token) | Brochure blocks |

**Impact:** No single place to adjust spacing rhythm across the site. Similar components may have slightly different padding/margins.

### Recommendation
Either use the existing tokens or extend the spacing scale to cover commonly used gaps (e.g. add `--spacing-2xl: 80px`, `--spacing-3xl: 100px`).

---

## 11. Brochure Theme vs Main Theme Disconnect

The codebase has two parallel design systems:

1. **Main Theme** (`styles.css`): `--color-*`, `--heading-font-size-*`, `--spacing-*`, `--button-*`
2. **Brochure Theme** (`brochure-theme.css`): `--brochure-*`

These overlap significantly but use different naming and sometimes different values:

| Concept | Main Token | Brochure Token | Same Value? |
|---|---|---|---|
| Text colour | `--color-text: #262626` | `--brochure-text: #262626` | Yes |
| Background | `--color-background: #fff` | `--brochure-bg: #fff` | Yes |
| Grey BG | `--color-background-grey: #f5f5f5` | `--brochure-bg-alt: #f5f5f5` | Yes |
| Blue accent | `--color-bmw-blue: #1c69d4` | `--brochure-accent: #1c69d4` | Yes |
| Content width | `--content-width: 1200px` | `--brochure-content-width: 1200px` | Yes |
| Section padding | `--section-padding: 64px 24px` | `--brochure-section-padding: 60px 20px` | **No** |
| Nav height | (hardcoded `64px`) | `--brochure-nav-height: 57px` | **No** |
| Narrow width | `--content-width-narrow: 900px` | `--brochure-content-narrow: 800px` | **No** |

**Impact:** Developers must remember which token set to use in which context. Brochure pages have subtly different padding and widths than dealer pages.

### Recommendation
Determine whether the brochure theme intentionally diverges or should align. If intentional, document the differences. If not, consolidate into one token set.

---

## 12. Accessibility Concerns

### Missing Focus Styles
The following interactive elements suppress or lack adequate focus styles:

- **`carousel-models.css`**: Thumbnails use `outline: none; box-shadow: none;` on `:focus-visible`
- **`brochure-nav.css`**: No custom `:focus-visible` styles on nav tabs or hamburger
- **`tabs-dealer-locator.css`**: Tab buttons and map toggle use `outline: none; box-shadow: none;` on `:focus`
- **`shared-components.css`**: `.carousel-nav-btn:focus` has `outline: none; box-shadow: none;`

**Impact:** Keyboard users cannot see which element is focused, violating WCAG 2.1 AA (2.4.7 Focus Visible).

### Recommendation
Replace `outline: none` with `outline: var(--focus-outline)` and `outline-offset: var(--focus-outline-offset)` as already defined in the global tokens, or use a custom focus ring that matches the design.

---

## 13. `!important` Usage

No `!important` declarations were found — this is excellent and should be maintained.

---

## 14. Content Width Inconsistencies

Multiple different max-width values are used across blocks:

| Max Width | Token | Used In |
|---|---|---|
| `1440px` | — | `footer.css`, `columns-feature.css` |
| `1400px` | — | `brochure-dual-image.css` |
| `1280px` | — | `styles.css` (Motorrad), `banner-terms.css`, `carousel-offers.css`, `tiles-cta.css`, `tiles-contact.css`, `carousel-models.css` (MINI sections) |
| `1200px` | `--content-width` | Many blocks (correct) |
| `1152px` | — | `banner-terms.css`, `columns-model-showcase.css` |
| `1024px` | — | `cards-about.css` (MINI), `brochure-text-reveal.css`, `columns-feature.css` |
| `936px` | — | `tabs-dealer-locator.css` |
| `900px` | `--content-width-narrow` | `brochure-stats.css` |
| `800px` | `--brochure-content-narrow` | `brochure-body.css`, `brochure-locked.css`, `text-media.css` |
| `772px` | — | `header.css` (MINI expanded) |
| `700px` | — | `brochure-dimensions.css`, `brochure-overlay.css`, `tiles-contact.css` |

**Impact:** Inconsistent content widths create unaligned content edges between adjacent sections.

### Recommendation
Define a content width scale with tokens and use them consistently:
```css
--content-width-xs: 700px;
--content-width-s: 900px;
--content-width-m: 1200px;
--content-width-l: 1280px;
--content-width-xl: 1440px;
```

---

## 15. Indentation Inconsistency

Most block CSS files use **4-space indentation** (brochure blocks), while some use **2-space indentation** (dealer site blocks like `cards-about.css`, `cards-team.css`, `header.css`, `footer.css`).

| Indentation | Files |
|---|---|
| 4-space | All `brochure-*` blocks, `cta-bar.css`, `hotspot-image.css` |
| 2-space | `cards-about.css`, `cards-team.css`, `cards-video.css`, `cards-news.css`, `cards-promo.css`, `cards-car-locator.css`, `columns-feature.css`, `columns-model-showcase.css`, `header.css`, `footer.css`, `tabs-dealer-locator.css`, `text-media.css`, `tiles-cta.css`, `tiles-contact.css`, `banner-terms.css`, `hero-dealership.css`, `carousel-models.css`, `carousel-offers.css` |

**Impact:** Mixed formatting across the codebase.

### Recommendation
Pick one standard (2-space is more common in the project) and enforce via `.editorconfig` or Stylelint.

---

## 16. Summary of Priority Issues

| Priority | Issue | Count of Files Affected |
|---|---|---|
| **High** | Non-standard breakpoints (768px, 1024px) | 15 blocks |
| **High** | Accessibility — suppressed focus outlines | 4 blocks + shared |
| **High** | `px` font-sizes (accessibility impact) | 7 blocks |
| **Medium** | Hardcoded colours bypassing tokens | 20+ blocks |
| **Medium** | Two parallel design token systems | All brochure blocks |
| **Medium** | `max-width` (desktop-first) media queries | 8 files |
| **Medium** | Content width inconsistencies (10+ values) | 15+ blocks |
| **Low** | Duplicate blocks (hero-brochure/brochure-hero-cards, cta-bar/brochure-cta-cards) | 4 blocks |
| **Low** | blanket `stylelint-disable` | 4 files |
| **Low** | Mixed 2/4 space indentation | All files |
| **Low** | Hardcoded spacing values | 20+ blocks |
| **Low** | MINI font fallback inconsistency (serif → sans-serif) | 1 block |
