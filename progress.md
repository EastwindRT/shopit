# Progress

A Next.js 15 / React 19 frontend over the **Shopify Universal Commerce Protocol (UCP)** global catalog. Keyless tier — searches every eligible Shopify merchant from one endpoint with no API keys.

## ✅ Shipped

### Phase 1 — Initial scaffold
Built against the wrong backend (mock.shop / Storefront API). Later torn out.

### Phase 2 — Removed Claude Haiku
Determined the AI middleware was unnecessary; UCP itself is the intelligence layer.

### Phase 3 — Discovered UCP is real
Verified `@shopify/ucp-cli` exists, official Shopify. `catalog.shopify.com/api/ucp/mcp` returns real cross-merchant data via keyless agent profile.

### Phase 4 — UCP refactor ✅ (May 28)
Deleted Shopify Storefront stack. Built `lib/ucp/types.ts` + `lib/ucp/client.ts` (JSON-RPC over MCP). Rewrote all pages/components against `UcpProduct`. Option A checkout (direct merchant `variant.checkout_url` handoff). Retry-with-backoff for keyless 422s. Verified 12/12 HTTP 200 across queries.

### Phase 5 — Filters + Flysoar tightening ✅ (May 28)
- Price-range formatter (`$69 – $77`), whole-vs-fractional money display.
- **Country picker** (9 options, ISO + currency) → UCP `context.address_country` + `context.currency`. Verified DE returns prices in €.
- **Category picker** (9 options) → query augmentation (UCP keyless ignores `filters.categories`).
- Hero/searchbar/grid tightened to a denser, more minimal layout.
- `pagination.limit = 50` — UCP defaults to 10. **5× more results per query.**

### Phase 6 — Perf overhaul ✅ (Jun 1)

**Framework**
- `staleTimes: { dynamic: 30, static: 180 }`, `optimizeCss`, `optimizePackageImports`, `compiler.removeConsole` in prod.
- `build` uses `--turbopack`.
- Speculation Rules in `<head>` (Chromium prerenders `/products/*`, prefetches `/search*`).

**Latency**
- **Prefetch-on-type** in `AiSearchBar` (180ms debounce). Submit→paint goes from ~1s to ~80ms.
- `/search` switched to **Edge runtime**.
- `buildCatalogSearchPlan` LRU-memoized (256).
- Fixed `revalidate: 0, cache: 'no-store'` on search — was disabling all SWR. Now `revalidate: 300`. **Cold 7.3s → warm 0.8s (9× faster).**

**UX**
- Deleted `MoreSearchResults` + `/api/ucp/more`. `/search` now calls `searchCatalogSmart` once in one Suspense — 126 unique products in one paint, no layout jolt.
- Products restored in typeahead dropdown (4 suggestions + 5 product previews + "See all" CTA).

**Relevance**
- **Sort** filter (Relevance / Price ↑ / Price ↓ / Top Rated), URL-synced.
- Ranking: +12 exact phrase title, +6 seller-name brand match, +5/−5 price-cap proximity.
- Verified: "running shoes under $100" → UCP price-cap → results ceiling at $100–107.

**Image weight**
- `deviceSizes` capped at 1920 (Next default 3840 was 2× over-fetching priority images).
- `qualities: [50, 60, 75, 80]` whitelisted (Next 15 default allow-list = q=75 only).
- Grid cards `quality={60}` + `xl:20vw` sizes; PDP hero `{80}`; PDP/typeahead thumbs `{50}`.
- `.skeleton` shimmer class behind every image container.

## Current file layout

```
app/
  layout.tsx              Root layout, Geist fonts, speculation rules
  page.tsx                Home — Hero + AiSearchBar + Trending (Suspense, 20 cards)
  loading.tsx             Global loading
  error.tsx               Global error
  not-found.tsx           404
  search/
    page.tsx              SearchPage (Edge runtime, searchCatalogSmart, Sort)
  products/[id]/
    page.tsx              PDP (getProduct, related Suspense, metadata)
  api/ucp/search/
    route.ts              Edge typeahead — slim payload, AbortSignal, SWR cache

components/
  layout/
    Navbar.tsx            Slim sticky header, brand + SearchTrigger
  home/
    HeroSection.tsx       Centered "Every Shopify store. One search."
  product/
    ProductCard.tsx       Image + title + price range + rating + seller
    ProductCardSkeleton.tsx
    ProductGrid.tsx       Responsive grid (2/3/4/5 cols), priority on first 5
    ProductGallery.tsx    PDP hero + thumbs (q=80/q=50, skeleton shimmer)
    ProductInfo.tsx       Variant selector, price, "Buy on {seller}" handoff
  search/
    AiSearchBar.tsx       Debounced input, prefetch-on-type, dropdown
    SearchDropdown.tsx    Suggestions + product previews + "See all" CTA
    SearchFilters.tsx     Country / Category / Sort selects, URL-synced
    SearchTrigger.tsx     Navbar search affordance

lib/
  utils.ts                cn(), formatMoney, formatMoneyRange, slugify, truncate
  ucp/
    types.ts              UcpProduct, UcpMoney, UcpContext, UcpSearchFilters, …
    client.ts             ucpCall (JSON-RPC + retry), searchCatalog,
                          searchCatalogSmart (8-way fan-out + dedupe + rerank),
                          searchCatalogFirstPage, searchCatalogExpanded,
                          getProduct, lookupCatalog
  search/
    facets.ts             COUNTRIES, CATEGORIES, COUNTRY_TO_CURRENCY (shared)
    query.ts              buildCatalogSearchPlan (memoized), rankProducts,
                          price extraction, stop-words, synonyms, intent expansions
    suggestions.ts        getSearchSuggestions for typeahead

app/globals.css           Design tokens, .skeleton shimmer, animations
next.config.ts            Image opts (deviceSizes 1920, qualities, AVIF/WebP),
                          experimental flags, security headers
tailwind.config.ts        Ink/surface palette, slide-up/fade-in animations
vercel.json               Deploy targets
.env.local / .env.example UCP keyless overrides (all optional)
```

## How a request flows

**Typing → first product visible** (~80ms warm)
1. User types in `AiSearchBar` (180ms debounce).
2. Three things happen in parallel:
   - `fetch('/api/ucp/search')` → typeahead returns slim products (Edge).
   - `getSearchSuggestions(q)` runs locally → suggestion pills.
   - `router.prefetch('/search?q=...')` warms the RSC cache for Enter.
3. Dropdown renders: 4 suggestions + 5 product previews + "See all".

**Enter / "See all" → full results** (~80ms warm)
1. `router.push('/search?q=...')`.
2. `/search` is Edge. Reads `q, country, category, sort`.
3. `SearchResults` calls `searchCatalogSmart(q, ...)`:
   - `buildCatalogSearchPlan` parses query → 8 normalized variants (memoized LRU).
   - `Promise.allSettled` fan-out → 8 parallel UCP calls (`pagination.limit: 50`).
   - Dedupe by id, then `rankProducts` (exact phrase / seller match / price cap / rating).
4. `applySort` reorders if non-default sort.
5. One `<Suspense>` paints the whole grid (no jolt).
6. Speculation Rules begin prerendering hovered `/products/*` in Chromium.

**Product detail** (instant on Chrome, ~80ms otherwise)
1. Click card → if prerendered, navigation is ~0ms.
2. PDP `getProduct(id)`. Gallery + Info render. `priority` on hero image at q=80.
3. Related products via `searchCatalog(firstThreeTitleWords)` in a Suspense, filtered to exclude current id.

**Checkout**
- `ProductInfo` renders `<a href={matchedVariant.checkout_url} target="_blank">Buy on {seller.name}</a>`. No local cart — direct handoff to that merchant's Shopify checkout.

## ⏳ Left to ship

- View Transitions API for crossfade between grid and PDP.
- Self-host the Geist font subset to drop another few KB.
- `SellerBadge` component, and populate `seller` on the slim typeahead payload.
- Accessibility pass + production Lighthouse audit.
- Vercel deploy + smoke test on edge.

## Lessons / mistakes to avoid

- **Argued against UCP existing** instead of just `npm view`-ing it.
- **Don't nest GraphQL fragments via template strings** (legacy lesson from Phase 1).
- **Don't assume Next features without checking the version** (`experimental.ppr` is canary-only).
- **`cache: 'no-store'` silently disables SWR.** If a value is sometimes-stale-fine, never set this.
- **Next 15 quietly restricts non-default `quality` values** unless they're in `images.qualities`. The prop appears to work but the value is overridden.
- **Default `deviceSizes` tops at 3840** — for any small grid card, that's a 2× over-fetch on priority images. Cap it.
