import Link from 'next/link'
import type { Metadata } from 'next'
import { ARTICLES } from '@/lib/articles'

export const metadata: Metadata = {
  title: 'Articles — Long-form picks from Shopify',
  description:
    'Editorial guides to the best products on Shopify. Curated picks, real products, direct-to-merchant checkout.',
  alternates: { canonical: '/articles' },
}

export default function ArticlesIndexPage() {
  return (
    <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-[10px] font-medium text-ink-tertiary uppercase tracking-[0.25em] mb-4">
        Articles
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        Long-form picks from Shopify
      </h1>
      <p className="text-base text-ink-secondary mb-12 leading-relaxed">
        Editorial guides covering the best products from indie Shopify merchants.
        Every pick is a real product, live from the catalog. We may earn a commission.
      </p>

      <div className="space-y-8">
        {ARTICLES.map((article) => (
          <article key={article.slug} className="border-b border-surface-2 pb-8 last:border-b-0">
            <Link href={`/articles/${article.slug}`} className="group block">
              <time
                dateTime={article.published}
                className="text-xs text-ink-tertiary tabular-nums"
              >
                {new Date(article.published).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {' · '}
                {article.readingTime}
              </time>
              <h2 className="text-xl font-semibold tracking-tight mt-2 mb-2 group-hover:text-accent transition-colors">
                {article.title}
              </h2>
              <p className="text-sm text-ink-secondary leading-relaxed">{article.dek}</p>
            </Link>
          </article>
        ))}
      </div>
    </article>
  )
}
