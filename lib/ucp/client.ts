import type {
  UcpProduct,
  UcpSearchResult,
  UcpContext,
  UcpSearchFilters,
} from './types'
import { buildCatalogSearchPlan, rankProducts } from '@/lib/search/query'

const UCP_ENDPOINT =
  process.env.UCP_ENDPOINT ?? 'https://catalog.shopify.com/api/ucp/mcp'

// Keyless access only requires an agent profile URL. Shopify hosts valid ones.
const UCP_AGENT_PROFILE =
  process.env.UCP_AGENT_PROFILE ??
  'https://shopify.dev/ucp/agent-profiles/2026-04-08/valid-with-capabilities.json'

type ToolName = 'search_catalog' | 'lookup_catalog' | 'get_product'

type JsonRpcResponse<T> = {
  jsonrpc: '2.0'
  id: number
  result?: { structuredContent?: T; content?: { type: string; text: string }[] }
  error?: { code: number; message: string }
}

type FetchOpts = { revalidate?: number; cache?: RequestCache; signal?: AbortSignal }
const DEFAULT_TIMEOUT_MS = 8000

// UCP's keyless tier silently switches to a slim payload (no media, no variants)
// when pagination.limit exceeds 30. Above this threshold, products come back
// imageless — useless for a visual grid. Stay at-or-under 30 per call.
const UCP_FULL_PAYLOAD_MAX = 30

async function ucpCall<T>(
  name: ToolName,
  catalog: Record<string, unknown>,
  opts: FetchOpts = {},
): Promise<T> {
  const payload = {
    jsonrpc: '2.0' as const,
    method: 'tools/call',
    id: 1,
    params: {
      name,
      arguments: {
        catalog,
        meta: { 'ucp-agent': { profile: UCP_AGENT_PROFILE } },
      },
    },
  }

  // Keyless tier intermittently 422s on agent-profile revalidation / rate limits.
  // Retry transient failures with a short backoff.
  let res: Response | undefined
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(UCP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: opts.signal ?? timeoutSignal(DEFAULT_TIMEOUT_MS),
      cache: opts.cache ?? 'force-cache',
      next: opts.revalidate !== undefined ? { revalidate: opts.revalidate } : undefined,
    })
    if (res.ok) break
    const transient = res.status === 422 || res.status === 429 || res.status >= 500
    if (!transient || attempt === 2) break
    await new Promise((r) => setTimeout(r, 250 * (attempt + 1)))
  }

  if (!res || !res.ok) {
    throw new Error(`UCP request failed: ${res?.status} ${res?.statusText}`)
  }

  const json: JsonRpcResponse<T> = await res.json()

  if (json.error) {
    throw new Error(`UCP error ${json.error.code}: ${json.error.message}`)
  }

  // Prefer structured content; fall back to parsing text content.
  const sc = json.result?.structuredContent
  if (sc) return sc

  const text = json.result?.content?.find((c) => c.type === 'text')?.text
  if (text) return JSON.parse(text) as T

  throw new Error('UCP response missing result payload')
}

function timeoutSignal(ms: number): AbortSignal | undefined {
  return typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(ms) : undefined
}

/** ---- id <-> url slug helpers (gid://shopify/p/TOKEN <-> TOKEN) ---- */
export function productIdToSlug(id: string): string {
  return id.split('/').pop() ?? id
}
export function slugToProductId(slug: string): string {
  return slug.startsWith('gid://') ? slug : `gid://shopify/p/${slug}`
}

/**
 * Search the global catalog across all eligible Shopify merchants.
 *
 * UCP defaults to a tiny `limit: 10` page — without this we'd only ever see ~10
 * products per query. Keyless tier caps at 50; we request the max by default.
 */
export async function searchCatalog(
  query: string,
  opts: {
    filters?: UcpSearchFilters
    context?: UcpContext
    limit?: number
    revalidate?: number
    cache?: RequestCache
    signal?: AbortSignal
  } = {},
): Promise<UcpProduct[]> {
  if (!query.trim()) return []

  const catalog: Record<string, unknown> = {
    query,
    pagination: { limit: Math.min(opts.limit ?? UCP_FULL_PAYLOAD_MAX, UCP_FULL_PAYLOAD_MAX) },
  }
  if (opts.filters) catalog.filters = opts.filters
  if (opts.context) catalog.context = opts.context

  const result = await ucpCall<UcpSearchResult>('search_catalog', catalog, {
    revalidate: opts.revalidate ?? 300,
    cache: opts.cache,
    signal: opts.signal,
  })
  return result.products ?? []
}

/**
 * Broader product search for user-facing result pages.
 *
 * UCP caps each keyless search to 50 products. Fan out across a few normalized
 * query variants, dedupe, then rank locally so the first page feels both broad
 * and relevant.
 */
export async function searchCatalogSmart(
  query: string,
  opts: {
    category?: string
    context?: UcpContext
    limit?: number
    revalidate?: number
    cache?: RequestCache
    signal?: AbortSignal
  } = {},
): Promise<UcpProduct[]> {
  const plan = buildCatalogSearchPlan(query, opts.category)
  if (plan.queries.length === 0) return []

  const perQueryLimit = UCP_FULL_PAYLOAD_MAX
  const settled = await Promise.allSettled(
    plan.queries.map((plannedQuery) =>
      searchCatalog(plannedQuery, {
        filters: plan.filters,
        context: opts.context,
        limit: perQueryLimit,
        revalidate: opts.revalidate,
        cache: opts.cache,
        signal: opts.signal,
      }),
    ),
  )

  const byId = new Map<string, UcpProduct>()
  for (const result of settled) {
    if (result.status !== 'fulfilled') continue
    for (const product of result.value) {
      if (!byId.has(product.id)) byId.set(product.id, product)
    }
  }

  return rankProducts([...byId.values()], query).slice(0, opts.limit ?? 120)
}

export async function searchCatalogFirstPage(
  query: string,
  opts: {
    category?: string
    context?: UcpContext
    limit?: number
    revalidate?: number
    cache?: RequestCache
    signal?: AbortSignal
  } = {},
): Promise<UcpProduct[]> {
  const plan = buildCatalogSearchPlan(query, opts.category)
  const primaryQuery = plan.queries[0]
  if (!primaryQuery) return []

  const products = await searchCatalog(primaryQuery, {
    filters: plan.filters,
    context: opts.context,
    limit: Math.min(opts.limit ?? UCP_FULL_PAYLOAD_MAX, UCP_FULL_PAYLOAD_MAX),
    revalidate: opts.revalidate,
    cache: opts.cache,
    signal: opts.signal,
  })

  return rankProducts(products, query)
}

export async function searchCatalogExpanded(
  query: string,
  opts: {
    category?: string
    context?: UcpContext
    excludeIds?: string[]
    limit?: number
    revalidate?: number
    cache?: RequestCache
    signal?: AbortSignal
  } = {},
): Promise<UcpProduct[]> {
  const plan = buildCatalogSearchPlan(query, opts.category)
  const alternateQueries = plan.queries.slice(1)
  if (alternateQueries.length === 0) return []

  const exclude = new Set(opts.excludeIds ?? [])
  const perQueryLimit = UCP_FULL_PAYLOAD_MAX
  const settled = await Promise.allSettled(
    alternateQueries.map((plannedQuery) =>
      searchCatalog(plannedQuery, {
        filters: plan.filters,
        context: opts.context,
        limit: perQueryLimit,
        revalidate: opts.revalidate,
        cache: opts.cache,
        signal: opts.signal,
      }),
    ),
  )

  const byId = new Map<string, UcpProduct>()
  for (const result of settled) {
    if (result.status !== 'fulfilled') continue
    for (const product of result.value) {
      if (!exclude.has(product.id) && !byId.has(product.id)) byId.set(product.id, product)
    }
  }

  return rankProducts([...byId.values()], query).slice(0, opts.limit ?? 80)
}

/** Fetch full detail for one product (optionally a specific variant selection). */
export async function getProduct(
  id: string,
  opts: {
    selected?: { name: string; label: string }[]
    preferences?: string[]
    context?: UcpContext
  } = {},
): Promise<UcpProduct | null> {
  const catalog: Record<string, unknown> = { id: slugToProductId(id) }
  if (opts.selected) catalog.selected = opts.selected
  if (opts.preferences) catalog.preferences = opts.preferences
  if (opts.context) catalog.context = opts.context

  try {
    const result = await ucpCall<{ product?: UcpProduct; products?: UcpProduct[] }>(
      'get_product',
      catalog,
      { revalidate: 300 },
    )
    return result.product ?? result.products?.[0] ?? null
  } catch {
    return null
  }
}

/** Batch lookup products by id (≤50). */
export async function lookupCatalog(
  ids: string[],
  opts: { context?: UcpContext } = {},
): Promise<UcpProduct[]> {
  if (ids.length === 0) return []
  const catalog: Record<string, unknown> = {
    ids: ids.slice(0, 50).map(slugToProductId),
  }
  if (opts.context) catalog.context = opts.context

  const result = await ucpCall<UcpSearchResult>('lookup_catalog', catalog, {
    revalidate: 300,
  })
  return result.products ?? []
}
