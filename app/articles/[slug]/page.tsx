import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { searchCatalogSmart } from '@/lib/ucp/client'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'
import { ARTICLES, articleBySlug } from '@/lib/articles'
import type { UcpProduct } from '@/lib/ucp/types'

// Node runtime (Edge can't be used with generateStaticParams). Pages are
// fully prerendered at build time + revalidated hourly via ISR.
export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scoppa.shop'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = articleBySlug(slug)
  if (!article) return {}
  return {
    title: article.title,
    description: article.dek,
    alternates: { canonical: `/articles/${slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.dek,
      url: `${SITE_URL}/articles/${slug}`,
      publishedTime: article.published,
      authors: [article.author],
    },
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = articleBySlug(slug)
  if (!article) notFound()

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.dek,
    datePublished: article.published,
    dateModified: article.published,
    author: { '@type': 'Organization', name: article.author },
    publisher: {
      '@type': 'Organization',
      name: 'Scoppa',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon` },
    },
    mainEntityOfPage: `${SITE_URL}/articles/${slug}`,
  }

  return (
    <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-ink-tertiary mb-8" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink transition-colors">Scoppa</Link>
        <span className="mx-2">/</span>
        <Link href="/articles" className="hover:text-ink transition-colors">Articles</Link>
      </nav>

      <header className="mb-12">
        <time dateTime={article.published} className="text-xs text-ink-tertiary tabular-nums">
          {new Date(article.published).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          {' · '}
          {article.readingTime}
        </time>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-4 leading-[1.15]">
          {article.title}
        </h1>
        <p className="text-base text-ink-secondary leading-relaxed">{article.dek}</p>
      </header>

      <div className="prose-scoppa">
        {article.body.map((block, i) =>
          block.type === 'h2' ? (
            <h2
              key={i}
              className="text-xl font-semibold tracking-tight mt-10 mb-3 first:mt-0"
            >
              {block.text}
            </h2>
          ) : (
            <p key={i} className="text-base text-ink-secondary leading-relaxed mb-4">
              {block.text}
            </p>
          ),
        )}
      </div>

      {/* Live products from UCP for each query */}
      {article.productQueries.map((q, i) => (
        <section key={q} className="mt-14" aria-labelledby={`picks-${i}`}>
          <h2
            id={`picks-${i}`}
            className="text-xs font-medium text-ink-tertiary uppercase tracking-widest mb-4"
          >
            Live picks: {q}
          </h2>
          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <ArticlePicks query={q} />
          </Suspense>
        </section>
      ))}

      <footer className="mt-16 pt-8 border-t border-surface-2">
        <p className="text-xs text-ink-tertiary">
          Disclosure: Scoppa earns affiliate commission when you buy through a link
          on this page. You pay the same price either way.
        </p>
      </footer>
    </article>
  )
}

async function ArticlePicks({ query }: { query: string }) {
  const products = await searchCatalogSmart(query, {
    limit: 30,
    revalidate: 600,
  }).catch(() => [] as UcpProduct[])
  if (products.length === 0) return null
  return <ProductGrid products={products.slice(0, 6)} />
}
