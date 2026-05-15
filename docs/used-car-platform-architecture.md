# Used Car Platform — EDS + AWS Architecture

> Discovery notes — May 2026

## Executive Summary

We're exploring whether Adobe Edge Delivery Services (EDS) can serve as the customer-facing experience layer for a used car platform. The backend API layer already exists — GraphQL via AWS AppSync + Lambda.

**Short answer: yes.** EDS handles the marketing/content/UX layer. AWS handles data, business logic, and dealer tooling. The two connect via client-side GraphQL queries from EDS blocks.

---

## Architecture Overview

```
┌───────────────────────────────────────────────────────────────┐
│  CUSTOMER-FACING — Adobe Edge Delivery Services (aem.live)    │
│                                                               │
│  Authored pages (DA Live)                                     │
│  ├── Marketing pages (homepage, why buy used, financing)      │
│  ├── /inventory — Product List Page (PLP)                     │
│  │     └── vehicle-search block → fetches AWS API             │
│  ├── /vehicle?vin=X — Product Detail Page (PDP)               │
│  │     └── vehicle-detail block → fetches AWS API             │
│  ├── /dealers — Dealer locator                                │
│  │     └── dealer-locator block → fetches AWS API             │
│  ├── Lead capture forms → POST to AWS                         │
│  └── Header, footer, nav, branding (authored once)            │
│                                                               │
│  Tech: Vanilla JS, CSS, no build step, no framework           │
│  Performance: Targets Lighthouse 100                          │
│  CDN: aem.live edge network                                   │
└───────────────────────┬───────────────────────────────────────┘
                        │ client-side fetch()
                        ▼
┌───────────────────────────────────────────────────────────────┐
│  BACKEND — AWS (existing)                                     │
│                                                               │
│  GraphQL API (AppSync + Lambda)                               │
│  ├── Query: searchVehicles(make, year, ...)                   │
│  ├── Query: getVehicle(vin)                                   │
│  ├── Query: searchDealers(lat, lng, radius)                   │
│  ├── Mutation: submitLead(...)                                │
│  └── Mutation: bookTestDrive(...)                             │
│                                                               │
│  Dealer Portal + Data Layer (existing)                        │
└───────────────────────────────────────────────────────────────┘
```

---

## The Two-Page Pattern (PLP + PDP)

This is the core UX pattern for browsing and viewing vehicles.

### Product List Page (PLP) — `/inventory`

**What the author creates:** One page, authored once, containing:
- Editorial content: hero banner, promotional sections, financing CTAs
- A `vehicle-search` block (possibly with authored config like default location or filters)
- Any additional authored sections below (promos, disclaimers)

**What the block does at runtime:**
1. Reads URL search params for active filters (`?make=BMW&year=2024&location=...`)
2. Builds filter/facet UI (make, model, year, price range, mileage, etc.)
3. Executes GraphQL query against AppSync (`searchVehicles`)
4. Renders a grid of vehicle cards
5. Each card links to `/vehicle?vin=ABC123`
6. Filter changes update the URL via `history.pushState` (shareable, bookmarkable)
7. Supports pagination or infinite scroll

**Author never touches vehicle data.** They control the page wrapper — hero image, promo banners, CTAs — and publish once.

### Product Detail Page (PDP) — `/vehicle?vin=ABC123`

**What the author creates:** One page, authored once, containing:
- A `vehicle-detail` block (or auto-blocked via `template: vehicle-detail` in metadata)
- Authored sections: financing information, trade-in CTA, dealer contact block, legal disclaimers

**What the block does at runtime:**
1. Reads `?vin=` from the URL query string
2. Executes GraphQL query against AppSync (`getVehicle(vin)`)
3. Renders: image gallery, specs table, pricing, dealer info
4. Updates the page `<title>` dynamically for browser tab/bookmarks
5. If no VIN or vehicle not found → shows appropriate error/redirect

**One authored page serves every vehicle in the inventory.** The VIN in the query string determines what content the block fetches and renders.

### Visual flow

```
 Author creates      Author creates
 /inventory (once)   /vehicle (once)
       │                    │
       ▼                    ▼
┌─────────────┐     ┌─────────────┐
│   PLP Page  │     │  PDP Page   │
│             │     │             │
│  hero       │     │  vehicle-   │
│  vehicle-   │────►│  detail     │
│  search     │link │  block      │
│  block      │     │             │
│  promo CTA  │     │  financing  │
│             │     │  section    │
└─────────────┘     └─────────────┘
       │                    │
       │  GraphQL            │  GraphQL
       ▼                    ▼
   AppSync              AppSync
   searchVehicles       getVehicle
```

---

## Authoring Experience

In DA Live, blocks appear as **plain tables**. Authors see something like:

```
┌──────────────────────┐
│ Vehicle Search       │  ← block name (header row)
├──────────────────────┤
│ default-location     │  Sydney         │
├──────────────────────┤
│ results-per-page     │  12             │
└──────────────────────┘
```

This is workable for blocks with minimal config, and for the vehicle platform most blocks will have little to no authored config — the data comes from the API.

To improve the authoring experience, the **Sidekick Library** provides a visual block picker. Authors see a catalogue of available blocks with descriptions, previews, and copy-paste functionality. This means authors don't need to remember block names or field formats — they pick from a visual menu.

---

## SEO Considerations

| Page type | SEO strategy |
|-----------|-------------|
| Marketing pages (homepage, why buy used, etc.) | Full SEO — authored content, fast static delivery, perfect Lighthouse |
| PLP `/inventory` | SEO target page. URL params (`?make=BMW&location=Sydney`) are indexable. Can generate a sitemap for key filter combinations |
| PDP `/vehicle?vin=X` | Lower SEO priority. Inventory is transient (cars sell). Primarily reached via PLP links, paid traffic, email, ads |
| Dealer pages | Can be individually authored or template-driven — good SEO |

**Query params vs. clean URLs:** We recommend query params (`/vehicle?vin=X`) for the PDP because:
- Vehicles are transient — no value in permanent URLs for items that sell
- One authored page handles all vehicles — no per-vehicle page creation needed
- PLP is the real SEO page — that's where organic search traffic should land
- If specific high-value vehicles need SEO, they can be selectively created as authored pages

---

## What's Feasible vs. What's a Stretch

### Well-suited for EDS

- ✅ Marketing and content pages
- ✅ PLP with search/filter UI fetching from API
- ✅ PDP template rendering API data
- ✅ Dealer locator with map integration
- ✅ Lead capture forms
- ✅ Editorial content around dynamic blocks (financing info, promos, disclaimers)
- ✅ Responsive, accessible, performant by default

### Feasible but needs care

- ⚠️ Complex filter UIs (faceted search with counts) — doable in vanilla JS but more work than with React
- ⚠️ Image galleries with zoom/swipe — vanilla JS carousel, no library, needs thoughtful implementation
- ⚠️ Loading states & skeleton screens — required to maintain Lighthouse scores while fetching API data
- ⚠️ Saved searches / favourites — localStorage + API, no framework state management
- ⚠️ Finance calculator — multi-input with live recalculation, well-suited for a Web Component inside an EDS block
- ⚠️ Service booking tool — multi-step form with date/time selection, feasible as an interactive block (Web Component) with GraphQL mutations
- ⚠️ Trade-in estimator — API-driven valuation, single-page interaction, fits the interactive block pattern

### Better on AWS as a separate app

- ❌ Customer account management (saved vehicles, purchase history, auth)
- ❌ Full credit application with identity verification
- ❌ The dealer portal itself

These link to/from EDS pages — e.g., a "Full Credit Application" CTA on the EDS PDP links to the AWS-hosted flow at `apply.example.com/finance?vin=ABC123`.

---

## Performance Considerations

EDS targets **Lighthouse 100**. API-driven blocks introduce risk:

| Risk | Mitigation |
|------|------------|
| Layout shift from late-loading content | Render skeleton placeholders immediately in `decorate()`, swap when data arrives |
| Slow API responses | AppSync responses need to be fast (< 300ms). Consider AppSync caching or CloudFront in front of the endpoint |
| Large image payloads | Vehicle images served from S3 + CloudFront with responsive sizing. Use `loading="lazy"` for below-fold images |
| JavaScript bundle size | No frameworks. Vanilla JS keeps block code small. Each block loads only when used on the page (automatic code splitting) |
| Cumulative Layout Shift (CLS) | Reserve explicit height/width for image containers and card grids |

---

## Decision Tree: Basic Block vs. Complex Block vs. Interactive Block vs. Standalone App

Use this to determine where a feature should live.

```
                        ┌─────────────────────────┐
                        │  New feature / screen    │
                        └────────────┬────────────┘
                                     │
                        ┌────────────▼────────────┐
                        │ Does it need server-side │
                   ┌─NO─┤ auth, sessions, or       ├─YES─┐
                   │    │ sensitive data handling?  │     │
                   │    └──────────────────────────┘     │
                   │                                     │
          ┌────────▼────────────────┐           ┌────────▼────────┐
          │ Does it stay on a       │           │ STANDALONE APP  │
          │ single page? (no        │           │ (AWS-hosted)    │
     ┌YES─┤ navigation between      ├─NO──┐    └─────────────────┘
     │    │ distinct pages/routes)   │     │
     │    └─────────────────────────┘     │
     │                                    │
     │                           ┌────────▼────────┐
     │                           │ STANDALONE APP  │
     │                           │ (AWS-hosted)    │
     │                           └─────────────────┘
     │
┌────▼──────────────────────────┐
│ How much interactivity?       │
│                               │
├─ None/minimal ──────────────► BASIC BLOCK
│  (layout, styling only)       │
│                               │
├─ Fetches data, renders ─────► COMPLEX BLOCK
│  results, simple controls     │
│                               │
├─ Multi-step form, stateful ─► INTERACTIVE BLOCK
│  UI, calculations, wizards    │  (Web Components)
│  (but still one page)         │
└───────────────────────────────┘
```

### Basic Block (content only)

**What it is:** A block that takes authored HTML cells and applies styling/layout. Minimal or no JavaScript beyond DOM rearrangement.

**Examples in this project context:**
- Hero banners, promo sections, financing info cards
- Dealer info cards, testimonials, FAQs
- Static content with responsive layout

**Characteristics:**
- Author controls all content via DA Live
- Little to no `fetch()` or API interaction
- Fast to build, easy to maintain
- Lighthouse impact: none — renders immediately from server-delivered HTML

### Complex Block (data-driven)

**What it is:** A block that combines authored configuration with client-side data fetching and interactivity. Still vanilla JS, still a single `decorate()` function, but does real work.

**Examples in this project context:**
- `vehicle-search` — filters, GraphQL query, card grid, pagination
- `vehicle-detail` — reads URL params, fetches vehicle data, renders gallery/specs
- `dealer-locator` — map integration, geolocation, dealer search
- Lead capture form — form UI, validation, GraphQL mutation

**Characteristics:**
- Author provides page wrapper content and optional config (defaults, labels)
- Block fetches data from AppSync at runtime
- Needs skeleton/loading states to protect Lighthouse scores
- More JS, but still < 10-15KB per block (no framework)
- State is URL-driven (query params, hash) — no client-side router

### Interactive Block (stateful single-page tools)

**What it is:** A block that manages meaningful client-side state — multi-step forms, calculators, wizards — but stays on a single EDS page. This is where **Web Components** shine. They give you encapsulated state, shadow DOM, lifecycle hooks, and they're native browser technology — no build step, no framework, fully compatible with EDS.

**Examples in this project context:**
- `finance-calculator` — input vehicle price, deposit, term → calculates repayments, shows comparison table. State lives entirely in the component
- `service-booking` — select dealer → pick service type → choose date/time → confirm. Multi-step but all on one page, final step is a GraphQL mutation
- `trade-in-estimator` — enter rego/make/model → get estimate range → feed into finance calculator. API-driven but single-page
- `vehicle-comparator` — select 2-3 vehicles → side-by-side specs comparison

**Why this works in EDS:**
- The block's `decorate()` creates and mounts a Web Component (or a set of them)
- Web Components manage their own internal state — no framework needed
- Steps/views are managed inside the component via internal state, not URL routing
- The outer EDS page still provides authored content around the block (hero, disclaimers, CTAs)
- CSS is scoped via shadow DOM — no style leakage
- JS stays small — a well-built multi-step form is still < 15-20KB

**Pattern:**
```js
// blocks/finance-calculator/finance-calculator.js
class FinanceCalculator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = { step: 1, price: 0, deposit: 0, term: 36 };
  }

  connectedCallback() {
    this.render();
  }

  setState(updates) {
    Object.assign(this.state, updates);
    this.render();
  }

  render() {
    // Render current step based on this.state
  }
}

customElements.define('finance-calculator', FinanceCalculator);

export default async function decorate(block) {
  // Read any authored config from block cells
  const calculator = document.createElement('finance-calculator');
  block.textContent = '';
  block.append(calculator);
}
```

**When it becomes too much for an interactive block:**
- Requires user authentication or session management
- Needs to persist state across page navigations (not just steps within a component)
- Handles sensitive data (PII, credit checks) that shouldn't be client-side
- The JS bundle for the block exceeds ~30KB — you're building a framework at that point

### Standalone App (AWS-hosted)

**What it is:** A separate application hosted on its own subdomain or path. Linked to/from EDS pages. Reserved for features that genuinely can't live on a single page.

**Examples in this project context:**
- Full credit application with identity verification and document upload
- Customer account portal (saved vehicles, purchase history, auth)
- Dealer portal (inventory management, leads, pricing)

**Characteristics:**
- Full framework if needed (React, Next.js, etc.)
- Server-side state, authentication, sessions
- Hosted on AWS (ECS, Amplify, CloudFront + S3)
- Links to/from EDS: `apply.example.com/finance?vin=ABC123`
- Shares design tokens / CSS with EDS for visual consistency

**Note on seamless UX:** The handoff between EDS and a standalone app doesn't have to feel jarring. If the standalone app loads the same fonts, colours, header/footer styles, and shares a design system, the user experience is continuous even across different domains. The key is shared CSS variables and a consistent design language, not a shared runtime.

---

## Can Traditional AEM Components Be Used in EDS / DA Live?

**Short answer: not directly.** EDS and traditional AEM Sites (AEM as a Cloud Service with its component model) are different content delivery architectures. You can't drop an AEM Coral/Granite component or a Sling model-backed component into an EDS page.

Here's what the options actually are:

### AEM Sites as a content source (via Universal Editor)

Adobe does offer a path where **AEM as a Cloud Service** is the content repository and the **Universal Editor** is the authoring interface, with EDS handling delivery. This is the "crosswalk" architecture (`aem-boilerplate-xwalk`).

In this model:
- Content lives in AEM's content repository (JCR)
- Authors use Universal Editor (WYSIWYG) instead of DA Live or Word/Sheets
- EDS blocks still work the same way — vanilla JS, CSS, `decorate()`
- The content source changes, but the delivery and block architecture don't

**However:** This requires an AEM as a Cloud Service instance, adds infrastructure complexity, and the block code still needs to be EDS-style vanilla JS — not traditional AEM HTL/Sling components. The value is in the authoring experience and content management capabilities (workflows, versioning, permissions), not in reusing existing AEM components.

### What you can reuse from AEM

| AEM asset | Reusable in EDS? | How |
|-----------|------------------|-----|
| Design tokens, CSS variables | ✅ Yes | Copy into EDS `styles/` |
| AEM Assets (DAM images, videos) | ✅ Yes | Via the AEM Assets Sidekick plugin — authors pick assets from DAM |
| Content Fragments (as data) | ⚠️ Indirectly | Fetch CF data via AEM's GraphQL API from an EDS block, similar to how you'd call AppSync |
| Experience Fragments | ❌ No | These are AEM-rendered HTML, tied to AEM's rendering pipeline |
| HTL/Sling components | ❌ No | Completely different rendering model |
| AEM workflows / permissions | ⚠️ Only with AEM as content source | Requires the Universal Editor + AEM setup |

### Recommendation for this project

Since the data layer is already on AWS (AppSync + Lambda) and the content is authored in DA Live, **there's no reason to introduce AEM as a Cloud Service** into this stack. It would add complexity without clear benefit.

If in the future there's a need for richer authoring (structured content models, approval workflows, DAM integration), the path is:
1. **AEM Assets Sidekick plugin** — for DAM image/video picking, no AEM Sites needed
2. **AEM as content source + Universal Editor** — for full WYSIWYG authoring with structured components, but this is a significant architecture change

For now, DA Live + Sidekick Library + GraphQL blocks is the right fit.

---

## Key Technical Decisions to Make

| Decision | Options | Recommendation |
|----------|---------|----------------|
| PDP URL strategy | Query params vs. clean paths | Query params (`/vehicle?vin=X`) — simplest, one authored page |
| GraphQL client | Lightweight fetch wrapper vs. full client (Apollo, urql) | Lightweight fetch wrapper — no build step, keeps bundle small |
| Vehicle images | Served from AWS vs. AEM media | AWS — images are dealer-uploaded, not author-managed |
| Filter state | URL params vs. in-memory | URL params — shareable, bookmarkable, back-button friendly |
| Complex flows (finance, trade-in) | EDS blocks vs. separate app | Separate AWS app — too stateful for EDS blocks |

---

## Next Steps

1. **Map the existing GraphQL schema** — Identify which queries/mutations the EDS blocks need, confirm field availability
2. **Build a PLP proof-of-concept** — `vehicle-search` block calling `searchVehicles`, filter UI, card grid
3. **Build a PDP proof-of-concept** — `vehicle-detail` block reading `?vin=` and calling `getVehicle`
4. **Test authoring experience** — Create both pages in DA, verify author workflow
5. **Performance benchmark** — Test Lighthouse scores with GraphQL-fetching blocks, tune loading states

---

## Reference

- [AEM EDS Documentation](https://www.aem.live/docs/)
- [David's Model — Content Modelling Best Practices](https://www.aem.live/docs/davidsmodel)
- [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)
- [Spreadsheets and JSON (for config data)](https://www.aem.live/developer/spreadsheets)
- [Sidekick Library (author tooling)](https://www.aem.live/docs/sidekick-library)
- [Keeping it 100 (performance)](https://www.aem.live/developer/keeping-it-100)
