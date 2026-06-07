# Latest Update

**Status:** Phase 7 shipped (rebrand to Scoppa + agent-friendly schema + SEO). Phase 6 (perf + UX) and prior phases below.

## Phase 7 — Scoppa rebrand + SEO + agent surface

### Brand
- Site is now **Scoppa — The front page of Shopify**. Renamed throughout:
  - `package.json` name: `shopit`
  - Navbar wordmark: `Scoppa` (bold)
  - HeroSection: small uppercase tracker "THE FRONT PAGE OF SHOPIFY" + `Scoppa` h1 + sub-headline
  - Default title: `Scoppa — The front page of Shopify`
  - Title template: `%s · Scoppa`

### SEO foundation
- Full Metadata API in `app/layout.tsx`: `metadataBase`, `keywords`, `applicationName`, `alternates.canonical`, full `openGraph` + `twitter` cards, expansive `robots.googleBot` directives.
- Per-page metadata: home keeps brand front; `/search` allows indexing of results pages (long-tail discovery); PDP includes price in title (`Name · $X.XX · Scoppa`), product summary as description, OG `article` type with image.
- `viewport` export with `themeColor` for light/dark.
- Search page `/search?q=...` is now indexable (was `robots: { index: false }`) — these are the long-tail SEO pages.

### JSON-LD structured data
- **Global (layout):** `WebSite` with `potentialAction: SearchAction` (gets Google's sitelinks search box) + `Organization`.
- **PDP (per product):** `Product` with `name`, `description`, `image[]`, `brand`, `aggregateRating` (when `rating.count > 0`), `offers` (single `Offer` when `min == max`, `AggregateOffer` with low/high otherwise), `seller`, `availability: InStock`, canonical URL.
- **PDP:** `BreadcrumbList` (Scoppa → product name).
- Verified live: offers `{price: "30.00", priceCurrency: "USD"}`, `AggregateRating {4.9, 1592}`.

### Agent discovery
- `public/llms.txt` — emerging standard ([llmstxt.org](https://llmstxt.org)). Describes Scoppa to LLM agents: what it is, how to use it programmatically (`/api/ucp/search?q=...`), URL parameter conventions (`country`, `category`, `sort`), supported countries/categories, query language ("under $X" → price filter).
- `app/robots.ts` — explicitly **welcomes** AI bots (GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, ClaudeBot, Claude-Web, anthropic-ai, Google-Extended, CCBot, cohere-ai, Applebot-Extended, meta-externalagent). `/api/` disallowed by default rule (consumed only via UI/agent direct path).
- `app/sitemap.ts` — home + `/search` + 10 seed queries (the catalog is too large/churny to enumerate; the rest is discoverable via search).

### Semantic structure
- PDP wrapped in `<article>` (was `<div>`); related section gets `aria-labelledby`.
- Hero `<section>` gets `aria-labelledby="shopit-heading"`.
- `<main id="main">` for skip-link compatibility.
- All section headings have proper id/`aria-labelledby` pairing.

### Verified
- `/robots.txt` → 200, lists all 12 AI bots
- `/sitemap.xml` → 200, 12 URLs
- `/llms.txt` → 200, served from `public/`
- Home renders WebSite + Organization JSON-LD with SearchAction
- PDP renders Product + BreadcrumbList JSON-LD with valid Offer + AggregateRating

## Phase 6 — Perf + UX overhaul (prior session)

## Phase 6 — Perf + UX overhaul (this session)

### Framework
- `next.config.ts`: `experimental.staleTimes = { dynamic: 30, static: 180 }` (RSC client cache held 5× longer for instant back/forward), `optimizeCss` (critical CSS inlined into initial HTML), `optimizePackageImports` for `clsx`/`tailwind-merge`/`geist`, `compiler.removeConsole` in prod.
- `package.json`: `build` now uses `--turbopack` (Next 15.3 stable).
- `app/layout.tsx`: speculation rules (`prerender /products/*` moderate, `prefetch /search*` moderate) — Chromium pre-renders product detail pages on hover/focus, ignored cleanly by Safari/Firefox.

### Latency
- **AiSearchBar prefetch-on-type.** 180ms debounced `router.prefetch('/search?q=...')` as the user types. By the time they hit Enter, the RSC payload is in cache. (Biggest single perceived-latency win.)
- **`/search` is now Edge runtime.** Drops ~100–200ms cold-start tax.
- **Planner memoization.** `buildCatalogSearchPlan` is now LRU-cached (256 entries) — pure-CPU plan output is reused across the 8 fan-out calls and across repeated keystrokes.
- **Fixed `revalidate: 0, cache: 'no-store'` on search.** That setting was killing all caching. Now uses default Next SWR (`revalidate: 300`). **Measured: cold 7.3s → warm 0.8s (9× faster).**
- **Image priority bumped 4→5** to cover the xl 5-col grid's top row.

### UX
- **Deleted `MoreSearchResults` + `/api/ucp/more` route.** The two-stage stitch caused a layout jolt and added a second round-trip. Now `/search` calls `searchCatalogSmart` once (server-side fan-out + dedupe + rerank) inside one Suspense — the smart fan-out's full breadth lands in one paint. **126 unique products per search verified.**
- **Products restored in the typeahead dropdown.** Dropdown now shows: 4 suggestions + 5 product previews + "See all results" CTA. Side-by-side, single mouse path.

### Relevance
- **Sort filter.** Relevance (default), Price asc/desc, Top Rated. URL-synced. Verified: `?sort=price-asc` → $3.99 floor, `?sort=price-desc` → $1,799 ceiling, both sort cleanly.
- **Smarter ranking signals:**
  - +12 for exact phrase title match (was per-term only)
  - +6 when query word matches seller name (handles brand queries like "Nike running shoes")
  - +5 if price within extracted budget cap, −5 if >20% over
- **Price extraction verified working end-to-end:** "running shoes under $100" → UCP price filter applied → re-sorted: top result is $100, ceiling is $107.

## Removed
- `components/search/MoreSearchResults.tsx`
- `app/api/ucp/more/route.ts`

## Image weight reduction (this turn)
- **Capped `deviceSizes` at 1920** (Next default tops at 3840). Priority images were fetching the 3840 bucket — ~2× over-fetch. Saves ~50KB per priority image.
- **Whitelisted `qualities: [50, 60, 75, 80]`** (Next 15 default allow-list is q=75 only).
- **Grid cards: `quality={60}`** + tighter `sizes` (added `xl:20vw`). Saves ~15% per breakpoint vs default q=75.
- **PDP hero: `quality={80}`** (user is examining, keep high).
- **PDP thumbnails: `quality={50}`** at 64px.
- **Typeahead 40px thumbs: `quality={50}`** + explicit `sizes="40px"`.
- **Replaced `bg-surface-1`/`bg-surface-2` placeholders with the existing `.skeleton` shimmer class.** Free visual upgrade — same byte count, but now while images load the user sees a soft pulsing gradient in the right aspect ratio.

## Next concrete actions
1. View Transitions API for list→detail crossfade
2. Self-host `geist/font` weight subset to drop the bytes further
3. SellerBadge + populate `seller` on slim typeahead payload
4. Accessibility pass + production Lighthouse audit
5. Vercel deployment

## This session
1. **Price accuracy fixed.**
   - Added `formatMoneyRange` — products with `min !== max` now render `"$69 – $77"` instead of just `"$69"`.
   - `formatMoney` now uses 0 fraction digits for whole-dollar amounts (`$89`) and 2 for fractional (`$12.50` not `$12.5`).
   - PDP shows the **exact selected variant's** price (existing logic) and falls back to the **range** when no variant matched (previously fell back to min only).
2. **Country filter (UCP `context.address_country` + `context.currency`).**
   - 9-country picker on the search page (US, CA, GB, AU, DE, FR, JP, IN, plus Any).
   - URL-synced via `?country=GB`. UCP returns localized prices where merchants support it (verified: DE returns several products in **€**).
3. **Category filter.**
   - 9 curated categories (Apparel, Footwear, Accessories, Beauty, Home, Electronics, Outdoor, Food & Drink, Toys).
   - UCP's keyless global tier **ignores `filters.categories`** (verified — Apparel/Footwear/Sneakers all return 0). Switched to **query augmentation** ("Footwear" + "running" → "footwear running") which reliably narrows results.
   - URL-synced via `?category=Footwear`.
4. **Flysoar-style tightening.**
   - HeroSection: shorter, tighter type ramp ("Every Shopify store. One search.").
   - Search bar: pill (rounded-full), tighter padding, softer shadow.
   - Grid: 5 columns at xl, gap-3 → gap-4 (was 4/6).
   - Cards: hover-prefetch enabled (`prefetch={null}`) for instant nav feel.
   - `SearchFilters` strip: small pill selects, inline "Clear", live result count with `useTransition` "Updating…" indicator.

## Verification
- `/search?q=running+shoes`: HTTP 200, Brooks Trace 2 renders `$69 – $77` ✓
- `/search?q=running&category=Footwear`: HTTP 200, real results ✓
- `/search?q=coffee&country=DE`: returns prices in €15.95, €17.95, €21.95 — country context honored ✓
- Homepage: HTTP 200, multiple range prices render correctly (e.g. `$48.58 – $52.47`, `$45 – $260`)
- Dev server on http://localhost:3003

## Catalog breadth fix (this turn)
- **Root cause of the "not searching whole DB" feeling:** UCP defaults to `pagination.limit=10`. We were silently capped to ~10 products per query.
- **Fix:** `searchCatalog` now defaults to `pagination.limit: 50` (the keyless-tier max). Typeahead route uses `limit: 10`. Homepage Trending uses `limit: 20`.
- **Verified:** `/search?q=running+shoes` now renders 50 unique product links (was 10). `/search?q=running+shoes&country=DE` returns 50+, `/search?q=running&category=Footwear` returns 50+.

## Flysoar tightening (this turn)
- Suggested chips → minimal tertiary-text pills (no border/fill, hover-only background).
- Trending header demoted to small tracked-uppercase label with "See all →" link.
- Trending grid now 5-col @ xl, shows 20 products.
- Navbar: bottom border removed, height 14→12, softer backdrop blur.

## Next concrete actions
1. SellerBadge + populate seller on slim/typeahead payload
2. Accessibility pass + Lighthouse audit (target 95+)
3. Vercel deployment configuration
