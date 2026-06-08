import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { searchCatalogSmart, productIdToSlug } from '@/lib/ucp/client'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'
import { TOPICS, topicBySlug } from '@/lib/topics'
import type { UcpProduct } from '@/lib/ucp/types'

// Node runtime (Edge can't be used with generateStaticParams). Pages are
// fully prerendered at build time + revalidated every 5 minutes via ISR.
export const revalidate = 300

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scoppa.shop'

type Props = { params: Promise<{ slug: string }> }

// Pre-render every topic at build time → static, instant first paint.
export function generateStaticParams() {
  return TOPICS.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const topic = topicBySlug(slug)
  if (!topic) return {}
  return {
    title: `${topic.title} — ${TOPICS.length}+ picks from Shopify merchants`,
    description: topic.intro,
    alternates: { canonical: `/topics/${slug}` },
    openGraph: {
      type: 'article',
      title: topic.heading,
      description: topic.intro,
      url: `${SITE_URL}/topics/${slug}`,
    },
  }
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params
  const topic = topicBySlug(slug)
  if (!topic) notFound()

  const related = topic.related
    .map(topicBySlug)
    .filter((t): t is NonNullable<typeof t> => Boolean(t))

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: topic.heading,
    url: `${SITE_URL}/topics/${slug}`,
    description: topic.intro,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Scoppa',
      url: SITE_URL,
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Scoppa', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Topics', item: `${SITE_URL}/topics` },
      {
        '@type': 'ListItem',
        position: 3,
        name: topic.title,
        item: `${SITE_URL}/topics/${slug}`,
      },
    ],
  }

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-ink-tertiary mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink transition-colors">Scoppa</Link>
        <span className="mx-2">/</span>
        <Link href="/topics" className="hover:text-ink transition-colors">Topics</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{topic.title}</span>
      </nav>

      {/* Editorial header */}
      <header className="max-w-2xl mb-12">
        <p className="text-[10px] font-medium text-ink-tertiary uppercase tracking-[0.25em] mb-3">
          Topic
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          {topic.heading}
        </h1>
        <p className="text-base text-ink-secondary leading-relaxed">
          {topic.intro}
        </p>
      </header>

      {/* Live products from UCP */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <TopicProducts topic={topic} />
      </Suspense>

      {/* Internal linking — related topics */}
      {related.length > 0 && (
        <section className="mt-20 pt-12 border-t border-surface-2" aria-labelledby="related-heading">
          <h2
            id="related-heading"
            className="text-xs font-medium text-ink-tertiary uppercase tracking-widest mb-6"
          >
            Related topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/topics/${r.slug}`}
                className="text-sm px-4 py-2 rounded-full border border-surface-3 hover:border-ink/30 hover:bg-surface-1 transition-colors"
              >
                {r.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Discovery — all other topics */}
      <section className="mt-16" aria-labelledby="all-topics-heading">
        <h2
          id="all-topics-heading"
          className="text-xs font-medium text-ink-tertiary uppercase tracking-widest mb-4"
        >
          Browse all topics
        </h2>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {TOPICS.filter((t) => t.slug !== slug).map((t) => (
            <Link
              key={t.slug}
              href={`/topics/${t.slug}`}
              className="text-ink-tertiary hover:text-ink transition-colors"
            >
              {t.title}
            </Link>
          ))}
        </div>
      </section>
    </article>
  )
}

async function TopicProducts({ topic }: { topic: { query: string; category?: string } }) {
  const products = await searchCatalogSmart(topic.query, {
    category: topic.category,
    limit: 120,
    revalidate: 300,
  }).catch(() => [] as UcpProduct[])

  if (products.length === 0) {
    return <p className="text-sm text-ink-tertiary">No products available right now.</p>
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.slice(0, 20).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/products/${productIdToSlug(p.id)}`,
      name: p.title,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <p className="text-xs text-ink-tertiary mb-4 tabular-nums">
        {products.length.toLocaleString()} matches across Shopify
      </p>
      <ProductGrid products={products} />
    </>
  )
}
