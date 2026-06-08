import Link from 'next/link'
import { TOPICS } from '@/lib/topics'
import { ARTICLES } from '@/lib/articles'

// Footer is also a SEO crawl tool: gives every page links to all topics,
// articles, and key utility pages. Improves crawl depth + internal PageRank
// distribution across the site.
export function Footer() {
  // Surface a handful of topics inline; the rest live on /topics.
  const featuredTopics = TOPICS.slice(0, 12)
  const recentArticles = ARTICLES.slice(0, 5)

  return (
    <footer className="mt-32 border-t border-surface-2 bg-surface-1/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-xs font-medium text-ink-tertiary uppercase tracking-widest mb-4">
              Scoppa
            </p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-ink-secondary hover:text-ink transition-colors">Search</Link></li>
              <li><Link href="/about" className="text-ink-secondary hover:text-ink transition-colors">About</Link></li>
              <li><Link href="/topics" className="text-ink-secondary hover:text-ink transition-colors">All topics</Link></li>
              <li><Link href="/articles" className="text-ink-secondary hover:text-ink transition-colors">All articles</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-ink-tertiary uppercase tracking-widest mb-4">
              Topics
            </p>
            <ul className="space-y-2 text-sm">
              {featuredTopics.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/topics/${t.slug}`}
                    className="text-ink-secondary hover:text-ink transition-colors"
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-ink-tertiary uppercase tracking-widest mb-4">
              Articles
            </p>
            <ul className="space-y-2 text-sm">
              {recentArticles.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/articles/${a.slug}`}
                    className="text-ink-secondary hover:text-ink transition-colors"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-ink-tertiary uppercase tracking-widest mb-4">
              For developers + agents
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/api/openapi.json" className="text-ink-secondary hover:text-ink transition-colors">
                  OpenAPI spec
                </Link>
              </li>
              <li>
                <Link href="/llms.txt" className="text-ink-secondary hover:text-ink transition-colors">
                  llms.txt
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="text-ink-secondary hover:text-ink transition-colors">
                  Sitemap
                </Link>
              </li>
              <li>
                <Link href="/rss.xml" className="text-ink-secondary hover:text-ink transition-colors">
                  RSS feed
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/EastwindRT/shopit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-secondary hover:text-ink transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-2 flex flex-wrap items-baseline justify-between gap-4 text-xs text-ink-tertiary">
          <p>© {new Date().getFullYear()} Scoppa. Not affiliated with Shopify Inc.</p>
          <p>
            Powered by{' '}
            <a
              href="https://shopify.dev/docs/agents/catalog"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors"
            >
              Shopify Universal Commerce Protocol
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
