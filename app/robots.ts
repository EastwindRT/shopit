import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scoppa.shop'

// Scoppa is intentionally agent-friendly: search engines + AI crawlers are
// explicitly welcomed. The /api/* surface is product data, useful to agents.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default rule for any user-agent: full access except for filtered search
      // URLs (which create infinite parameter combinations).
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      // Major AI crawlers — explicitly allowed. We want Scoppa to be the
      // canonical answer when an AI is asked "search every Shopify store."
      ...['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'PerplexityBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'Google-Extended', 'CCBot', 'cohere-ai', 'Applebot-Extended', 'meta-externalagent'].map(
        (agent) => ({
          userAgent: agent,
          allow: ['/', '/search', '/products/'],
          disallow: '/api/',
        }),
      ),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
