import { Suspense } from 'react'
import { searchCatalogSmart, productIdToSlug } from '@/lib/ucp/client'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'
import { AiSearchBar } from '@/components/search/AiSearchBar'
import { SearchFilters, type SortKey } from '@/components/search/SearchFilters'
import { Pagination } from '@/components/search/Pagination'
import { COUNTRY_TO_CURRENCY } from '@/lib/search/facets'
import type { UcpProduct } from '@/lib/ucp/types'

export const runtime = 'edge'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scoppa.shop'
const PAGE_SIZE = 20

type Props = {
  searchParams: Promise<{
    q?: string
    country?: string
    category?: string
    sort?: SortKey
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: Props) {
  const { q, page } = await searchParams
  const pageNum = Math.max(1, parseInt(page ?? '1', 10))
  if (!q) {
    return {
      title: 'Search every Shopify store',
      description:
        'Scoppa searches the entire Shopify catalog at once — find products across thousands of independent merchants.',
      alternates: { canonical: '/search' },
    }
  }
  const pageSuffix = pageNum > 1 ? ` (page ${pageNum})` : ''
  const canonical = pageNum > 1
    ? `/search?q=${encodeURIComponent(q)}&page=${pageNum}`
    : `/search?q=${encodeURIComponent(q)}`
  return {
    title: `${q}${pageSuffix} — search results`,
    description: `Products matching "${q}" across every Shopify store, ranked by relevance. Filter by country, category, sort by price or rating.`,
    alternates: { canonical },
    robots: { index: true, follow: true },
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, country = '', category = '', sort = 'relevance', page: pageRaw } = await searchParams
  const page = Math.max(1, parseInt(pageRaw ?? '1', 10))
  const key = `${q ?? ''}|${country}|${category}|${sort}|${page}`

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
            <SearchResults
              query={q}
              country={country}
              category={category}
              sort={sort}
              page={page}
            />
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
  page,
}: {
  query: string
  country: string
  category: string
  sort: SortKey
  page: number
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
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const pageResults = sorted.slice(start, start + PAGE_SIZE)

  // JSON-LD ItemList — describes ONLY this page's slice but reports the total.
  // Each paginated URL is independently indexable for long-tail SEO.
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Search results for "${query}" on Scoppa${currentPage > 1 ? ` (page ${currentPage})` : ''}`,
    numberOfItems: sorted.length,
    itemListOrder:
      sort === 'price-asc'
        ? 'https://schema.org/ItemListOrderAscending'
        : sort === 'price-desc'
          ? 'https://schema.org/ItemListOrderDescending'
          : 'https://schema.org/ItemListOrderAscending',
    itemListElement: pageResults.map((product, i) => ({
      '@type': 'ListItem',
      position: start + i + 1,
      url: `${SITE_URL}/products/${productIdToSlug(product.id)}`,
      name: product.title,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <p className="text-xs text-ink-tertiary mb-4 tabular-nums">
        {sorted.length.toLocaleString()} results for &ldquo;
        <span className="text-ink">{query}</span>&rdquo;
        {totalPages > 1 && (
          <span className="text-ink-tertiary">
            {' · showing '}
            {start + 1}–{start + pageResults.length} of {sorted.length}
          </span>
        )}
      </p>
      <ProductGrid products={pageResults} />
      <Pagination
        basePath="/search"
        params={{ q: query, country, category, sort: sort === 'relevance' ? undefined : sort }}
        currentPage={currentPage}
        totalPages={totalPages}
      />
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
