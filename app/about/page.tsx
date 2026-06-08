import Link from 'next/link'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scoppa.shop'

export const metadata = {
  title: 'About — How Scoppa works',
  description:
    'Scoppa is a universal search interface over every Shopify merchant. Powered by Shopify Universal Commerce Protocol. No signup, no cart, no platform tax.',
  alternates: { canonical: '/about' },
}

const FAQ: { q: string; a: string }[] = [
  {
    q: 'What is Scoppa?',
    a: 'Scoppa is a search engine for every Shopify store. Type what you want in plain language and we surface real products from thousands of independent Shopify merchants — with prices, ratings, and direct-to-merchant checkout.',
  },
  {
    q: 'Is Scoppa free to use?',
    a: 'Yes. There is no signup, no subscription, no cart, and no platform fee. You search, you click a product, you check out directly on the merchant’s own Shopify store.',
  },
  {
    q: 'How does Scoppa make money?',
    a: 'When you click a product and buy it, the originating merchant pays Scoppa a small affiliate commission via Skimlinks. You pay the same price you would have paid going directly to the store.',
  },
  {
    q: 'How is Scoppa different from Google Shopping or Amazon?',
    a: 'Google Shopping aggregates paid listings from many sources, including Amazon and big-box retailers. Amazon is a single marketplace. Scoppa indexes only Shopify’s universal catalog — independent brands and direct-to-consumer merchants, not resellers. Every checkout happens on the brand’s own store.',
  },
  {
    q: 'How does the search work?',
    a: 'Your query is normalized, expanded with synonyms and intent (e.g. "running shoes under $100" extracts the price cap), then fanned out across the Shopify Universal Commerce Protocol catalog. Results from up to twelve parallel queries are deduplicated and locally re-ranked by relevance.',
  },
  {
    q: 'Are there any keyboard shortcuts or commands?',
    a: 'Yes — type "/" in the search bar to see a list. Examples: /canada to limit to Canadian merchants, /freeshipping for free shipping items, /under50 for items under $50, /clearance for clearance, /handmade for artisan goods, /vintage for retro, /toprated to sort by rating. Commands chain: "/canada /freeshipping leather wallet" works.',
  },
  {
    q: 'Can I filter by country or category?',
    a: 'Yes. Use the country, category, and sort filters on the search page, or pass ?country=US&category=Footwear&sort=price-asc in the URL.',
  },
  {
    q: 'Can AI agents and LLMs use Scoppa?',
    a: 'Yes — Scoppa is designed agent-first. See llms.txt for the LLM guide, and /api/openapi.json for the machine-readable OpenAPI 3.1 spec. The robots policy explicitly welcomes GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and others.',
  },
  {
    q: 'Where do checkout and shipping happen?',
    a: 'Every "Buy" link sends you directly to that merchant’s own Shopify checkout. Shipping, returns, customer service, and order tracking all happen with the merchant, not Scoppa.',
  },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: a,
    },
  })),
}

export default function AboutPage() {
  return (
    <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <p className="text-[10px] font-medium text-ink-tertiary uppercase tracking-[0.25em] mb-4">
        About
      </p>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-8">
        How Scoppa works
      </h1>
      <p className="text-base text-ink-secondary mb-12 leading-relaxed">
        Scoppa is a search engine for the entire Shopify catalog. Type what you want in plain
        language — &ldquo;running shoes under $100&rdquo;, &ldquo;japanese desk lamp&rdquo;,
        &ldquo;organic coffee from a small roaster&rdquo; — and we surface real products from
        thousands of independent Shopify merchants. Checkout happens on the brand&rsquo;s own
        store. No signup, no cart, no platform tax.
      </p>

      <section className="space-y-2" aria-labelledby="faq-heading">
        <h2
          id="faq-heading"
          className="text-xs font-medium text-ink-tertiary uppercase tracking-widest mb-4"
        >
          Frequently asked
        </h2>
        {FAQ.map(({ q, a }) => (
          <details
            key={q}
            className="group border-b border-surface-2 py-4"
          >
            <summary className="cursor-pointer text-sm font-medium text-ink list-none flex items-center justify-between hover:text-accent transition-colors">
              {q}
              <span className="text-ink-tertiary group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-ink-secondary leading-relaxed">{a}</p>
          </details>
        ))}
      </section>

      <div className="mt-16 pt-8 border-t border-surface-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-tertiary">
        <Link href="/" className="hover:text-ink transition-colors">← Back to search</Link>
        <Link href="/llms.txt" className="hover:text-ink transition-colors">llms.txt</Link>
        <Link href="/api/openapi.json" className="hover:text-ink transition-colors">OpenAPI spec</Link>
        <Link href="/sitemap.xml" className="hover:text-ink transition-colors">Sitemap</Link>
        <a
          href={`${SITE_URL}/robots.txt`}
          className="hover:text-ink transition-colors"
        >
          robots.txt
        </a>
      </div>
    </article>
  )
}
