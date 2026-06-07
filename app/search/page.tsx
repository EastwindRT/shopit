import { Suspense } from 'react'
import { searchCatalogSmart } from '@/lib/ucp/client'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'
import { AiSearchBar } from '@/components/search/AiSearchBar'
import { SearchFilters, type SortKey } from '@/components/search/SearchFilters'
import { COUNTRY_TO_CURRENCY } from '@/lib/search/facets'
import type { UcpProduct } from '@/lib/ucp/types'

export const runtime = 'edge'

type Props = {
  searchParams: Promise<{
    q?: string
    country?: string
    category?: string
    sort?: SortKey
  }>
}

export async function generateMetadata({ searchParams }: Props) {
  const { q } = await searchParams
  if (!q) {
    return {
      title: 'Search every Shopify store',
      description:
        'SHOPIT searches the entire Shopify catalog at once — find products across thousands of independent merchants.',
      alternates: { canonical: '/search' },
    }
  }
  return {
    title: `${q} — search results`,
    description: `Products matching "${q}" across every Shopify store, ranked by relevance. Filter by country, category, sort by price or rating.`,
    alternates: { canonical: `/search?q=${encodeURIComponent(q)}` },
    // Allow indexing of search results — useful for long-tail discovery.
    robots: { index: true, follow: true },
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, country = '', category = '', sort = 'relevance' } = await searchParams
  const key = `${q ?? ''}|${country}|${category}|${sort}`

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-2xl mx-auto mb-8">
        <AiSearchBar initialQuery={q} />
      </div>

      {q ? (
        <>
          <SearchFilters country={country} category={category} sort={sort} />
          <Suspense
            key={key}
            fallback={
              <>
                {/* Google-style status line — paints with the page chrome,
                    before UCP returns. Replaced by SearchResults' own count
                    when data resolves. */}
                <p className="text-xs text-ink-tertiary mb-4 tabular-nums">
                  Searching for &ldquo;<span className="text-ink">{q}</span>&rdquo;…
                </p>
                <div
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4"
                  aria-busy="true"
                  aria-live="polite"
                >
                  {Array.from({ length: 15 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              </>
            }
          >
            <SearchResults query={q} country={country} category={category} sort={sort} />
          </Suspense>
        </>
      ) : (
        <p className="text-center text-ink-secondary py-24 text-sm">
          Search across every Shopify store — try &ldquo;minimalist desk setup under $500&rdquo;
        </p>
      )}
    </div>
  )
}

async function SearchResults({
  query,
  country,
  category,
  sort,
}: {
  query: string
  country: string
  category: string
  sort: SortKey
}) {
  const products = await searchCatalogSmart(query, {
    category,
    context:
      country
        ? {
            address_country: country,
            currency: COUNTRY_TO_CURRENCY[country] ?? 'USD',
          }
        : undefined,
    limit: 120,
    // SWR caching: instantaneous for repeat searches, refreshes in background.
    revalidate: 300,
  }).catch(() => [] as UcpProduct[])

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-ink-secondary text-sm mb-2">No results for &ldquo;{query}&rdquo;</p>
        <p className="text-ink-tertiary text-xs">Try rephrasing or use broader terms</p>
      </div>
    )
  }

  const sorted = applySort(products, sort)

  return (
    <>
      {/* Resolved status — replaces the pre-fetch placeholder. */}
      <p className="text-xs text-ink-tertiary mb-4 tabular-nums">
        {sorted.length.toLocaleString()} results for &ldquo;
        <span className="text-ink">{query}</span>&rdquo;
      </p>
      <ProductGrid products={sorted} />
    </>
  )
}

function applySort(products: UcpProduct[], sort: SortKey): UcpProduct[] {
  if (sort === 'relevance') return products
  const copy = [...products]
  if (sort === 'price-asc') {
    return copy.sort(
      (a, b) => (a.price_range?.min?.amount ?? Infinity) - (b.price_range?.min?.amount ?? Infinity),
    )
  }
  if (sort === 'price-desc') {
    return copy.sort(
      (a, b) => (b.price_range?.min?.amount ?? -Infinity) - (a.price_range?.min?.amount ?? -Infinity),
    )
  }
  if (sort === 'rating') {
    return copy.sort((a, b) => (b.rating?.value ?? 0) - (a.rating?.value ?? 0))
  }
  return products
}
