import type { MetadataRoute } from 'next'
import { TOPICS } from '@/lib/topics'
import { ARTICLES } from '@/lib/articles'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scoppa.shop'

// Scoppa is a search interface over a universe of products that's too large
// (and too churny) to enumerate in a static sitemap. We sitemap the canonical
// entry points + every topic page + every article + seed search queries;
// individual products are discoverable via internal links from topic pages.
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
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/topics`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...TOPICS.map((t) => ({
      url: `${SITE_URL}/topics/${t.slug}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    })),
    ...ARTICLES.map((a) => ({
      url: `${SITE_URL}/articles/${a.slug}`,
      lastModified: new Date(a.published),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...SEED_QUERIES.map((query) => ({
      url: `${SITE_URL}/search?q=${encodeURIComponent(query)}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
  ]
}
