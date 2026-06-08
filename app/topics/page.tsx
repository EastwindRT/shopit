import Link from 'next/link'
import type { Metadata } from 'next'
import { TOPICS } from '@/lib/topics'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scoppa.shop'

export const metadata: Metadata = {
  title: 'Topics — Browse every Shopify category',
  description:
    'Curated topics across the Shopify universe — running shoes, leather wallets, coffee, skincare, and more. Each topic surfaces real products from independent Shopify merchants.',
  alternates: { canonical: '/topics' },
}

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'All Scoppa topics',
  url: `${SITE_URL}/topics`,
  description:
    'Curated topic landing pages aggregating products across every Shopify merchant.',
  hasPart: TOPICS.map((t) => ({
    '@type': 'WebPage',
    name: t.title,
    url: `${SITE_URL}/topics/${t.slug}`,
    description: t.intro,
  })),
}

export default function TopicsIndexPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <p className="text-[10px] font-medium text-ink-tertiary uppercase tracking-[0.25em] mb-4">
        Topics
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        Browse every Shopify category
      </h1>
      <p className="text-base text-ink-secondary mb-12 leading-relaxed">
        Curated landing pages across the Shopify universe. Each topic surfaces real
        products from independent merchants. {TOPICS.length} topics and growing.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {TOPICS.map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="block px-4 py-3 rounded-lg border border-surface-2 hover:border-ink/30 hover:bg-surface-1 transition-colors"
          >
            <p className="text-sm font-medium text-ink">{topic.title}</p>
          </Link>
        ))}
      </div>
    </article>
  )
}
