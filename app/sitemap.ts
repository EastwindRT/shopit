import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scoppa.shop'

// Scoppa is a search interface over a universe of products that's too large
// (and too churny) to enumerate in a static sitemap. We sitemap the canonical
// entry points + the most useful pre-seeded queries; everything else is
// discoverable via the site search.
const SEED_QUERIES = [
  'bestsellers',
  'running shoes',
  'wireless headphones',
  'coffee',
  'leather wallet',
  'skincare',
  'vintage denim',
  'desk setup',
  'home decor',
  'kitchen',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...SEED_QUERIES.map((query) => ({
      url: `${SITE_URL}/search?q=${encodeURIComponent(query)}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    })),
  ]
}
