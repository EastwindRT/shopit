# Scoppa

> The front page of Shopify. Search every Shopify store at once.

Scoppa is a unified search interface over Shopify's [Universal Commerce Protocol](https://shopify.dev/docs/agents/catalog) (UCP) — type a query in plain language and get products from thousands of independent Shopify merchants, with prices, ratings, and direct-to-merchant checkout. No signup, no cart, no platform tax.

Live at **[scoppa.shop](https://scoppa.shop)**.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/EastwindRT/shopit)

## Stack

- **Next.js 15** App Router · **React 19** · **TypeScript** · **Tailwind CSS**
- **Edge runtime** for `/search` and `/api/ucp/search`
- **Shopify UCP global catalog** (keyless) — `https://catalog.shopify.com/api/ucp/mcp`
- Custom Shopify CDN image loader — bypasses `/next/image` for direct edge-cached delivery
- JSON-LD `WebSite` / `Organization` / `Product` / `ItemList` / `BreadcrumbList` · `llms.txt` · `robots.ts` with AI-bot allowlist · `sitemap.ts` · OpenAPI 3.1 at `/api/openapi.json`

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

All env vars are optional — the defaults work out of the box.

| Var | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://scoppa.shop` | Used for canonical URLs, sitemap, OG, JSON-LD |
| `UCP_ENDPOINT` | `https://catalog.shopify.com/api/ucp/mcp` | Shopify universal catalog MCP endpoint |
| `UCP_AGENT_PROFILE` | `https://shopify.dev/ucp/agent-profiles/2026-04-08/valid-with-capabilities.json` | UCP keyless agent profile |
| `NEXT_PUBLIC_AFFILIATE_PROVIDER` | `none` | Set to `skimlinks` to enable affiliate URL rewriting |
| `NEXT_PUBLIC_SKIMLINKS_SITE_ID` | _(empty)_ | Numeric site_id from Skimlinks; rendered into outbound URLs |

## How it works

```
User types → AiSearchBar (180ms debounce)
                ├─ prefetch /search?q=… (RSC warm-up)
                ├─ /api/ucp/search → typeahead products
                └─ local suggestion generator

Enter / click "See all" → /search?q=…
                ├─ buildCatalogSearchPlan(q, category)  # tokenize → synonyms → 8 variants
                ├─ Promise.allSettled([searchCatalog × 8])  # parallel UCP fan-out
                ├─ dedupe + rankProducts(local re-ranker)
                └─ ProductGrid (with custom Shopify CDN image loader)

Card click → /products/[id]
                ├─ getProduct(id) via UCP
                ├─ JSON-LD: Product + Offer + AggregateRating + BreadcrumbList
                └─ "Buy on {merchant}" → affiliateUrl() → direct Shopify checkout
```

## File layout

```
app/                # Next.js routes + metadata + robots/sitemap
  layout.tsx        # Site-wide JSON-LD, OG, theme color, speculation rules
  page.tsx          # Minimalist home (logo + tagline + search)
  search/page.tsx   # Edge-runtime search results with filters + sort
  products/[id]/    # PDP with Product JSON-LD
  api/ucp/search/   # Edge typeahead
  api/openapi.json/ # OpenAPI 3.1 spec for agent discovery
  robots.ts · sitemap.ts

components/
  ShopifyImage.tsx  # Server-Component-safe Shopify CDN image
  product/          # Card, Grid, Gallery, Info, Skeleton
  search/           # AiSearchBar, Dropdown, Filters, Trigger
  layout/Navbar.tsx

lib/
  ucp/              # client.ts (JSON-RPC), types.ts
  search/           # query.ts (planner + ranker), suggestions.ts, facets.ts
  affiliate.ts      # Pluggable outbound URL rewriter (Skimlinks ready)
  shopify-image-loader.ts
  utils.ts          # formatMoney, formatMoneyRange, cn, …

public/llms.txt     # LLM-agent discovery
```

## Deploy

[`render.yaml`](./render.yaml) is a Render Blueprint — point your Render account at this repo and it provisions automatically.

For Vercel / Cloudflare, point at the same repo; the framework auto-detects.

## License

MIT.
