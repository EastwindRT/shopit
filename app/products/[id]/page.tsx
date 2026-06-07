import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getProduct, searchCatalog } from '@/lib/ucp/client'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'

type Props = { params: Promise<{ id: string }> }

export const revalidate = 300

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scoppa.shop'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return {}
  const image = product.media?.find((m) => m.type === 'image')?.url
  const price = product.price_range?.min
  const seller = product.seller?.name
  const summary =
    product.description?.plain?.slice(0, 155) ??
    `${product.title}${seller ? ` from ${seller}` : ''} — on Scoppa, the front page of Shopify.`
  const priceLabel = price ? ` · $${(price.amount / 100).toFixed(2)}` : ''

  return {
    title: `${product.title}${priceLabel}`,
    description: summary,
    alternates: { canonical: `/products/${id}` },
    openGraph: {
      type: 'article',
      title: product.title,
      description: summary,
      url: `${SITE_URL}/products/${id}`,
      images: image ? [{ url: image, alt: product.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: summary,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()

  // JSON-LD Product schema — Google rich results + AI agent extraction.
  const price = product.price_range?.min
  const priceMax = product.price_range?.max
  const images = (product.media ?? []).filter((m) => m.type === 'image').map((m) => m.url)
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description?.plain ?? undefined,
    image: images.length > 0 ? images : undefined,
    url: `${SITE_URL}/products/${id}`,
    sku: product.variants?.[0]?.sku || undefined,
    brand: product.seller?.name
      ? { '@type': 'Brand', name: product.seller.name }
      : undefined,
    aggregateRating:
      product.rating && product.rating.count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating.value,
            ratingCount: product.rating.count,
            bestRating: product.rating.scale_max,
            worstRating: product.rating.scale_min,
          }
        : undefined,
    offers:
      price && priceMax && price.amount !== priceMax.amount
        ? {
            '@type': 'AggregateOffer',
            priceCurrency: price.currency,
            lowPrice: (price.amount / 100).toFixed(2),
            highPrice: (priceMax.amount / 100).toFixed(2),
            offerCount: product.variants?.length ?? 1,
            availability: 'https://schema.org/InStock',
            url: product.url ?? `${SITE_URL}/products/${id}`,
          }
        : price
          ? {
              '@type': 'Offer',
              priceCurrency: price.currency,
              price: (price.amount / 100).toFixed(2),
              availability: 'https://schema.org/InStock',
              url: product.url ?? `${SITE_URL}/products/${id}`,
              seller: product.seller?.name
                ? { '@type': 'Organization', name: product.seller.name }
                : undefined,
            }
          : undefined,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Scoppa', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.title,
        item: `${SITE_URL}/products/${id}`,
      },
    ],
  }

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        <ProductGallery media={product.media ?? []} />
        <ProductInfo product={product} />
      </div>

      <section className="mt-24" aria-labelledby="related-heading">
        <h2
          id="related-heading"
          className="text-sm font-medium text-ink-secondary uppercase tracking-widest mb-8"
        >
          Similar across Shopify
        </h2>
        <Suspense
          fallback={
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }
        >
          <RelatedProducts title={product.title} excludeId={product.id} />
        </Suspense>
      </section>
    </article>
  )
}

async function RelatedProducts({ title, excludeId }: { title: string; excludeId: string }) {
  // Use the first few words of the title as a semantic seed.
  const seed = title.split(' ').slice(0, 3).join(' ')
  const products = await searchCatalog(seed, {
    filters: { available: true },
    revalidate: 600,
  }).catch(() => [])
  const related = products.filter((p) => p.id !== excludeId).slice(0, 4)
  if (related.length === 0) return null
  return <ProductGrid products={related} />
}
