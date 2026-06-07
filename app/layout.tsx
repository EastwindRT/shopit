import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://shopit.onrender.com'
const SITE_NAME = 'SHOPIT'
const TAGLINE = 'The front page of Shopify'
const DESCRIPTION =
  'SHOPIT is the front page of Shopify — search every Shopify store at once. Discover products across thousands of independent merchants in plain language, with prices, ratings and direct checkout. Powered by Shopify Universal Commerce Protocol.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s · SHOPIT',
    default: `SHOPIT — ${TAGLINE}`,
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'shopify',
    'universal catalog',
    'shopify search',
    'product search',
    'every shopify store',
    'shopify ucp',
    'cross-merchant shopping',
    'shopit',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `SHOPIT — ${TAGLINE}`,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `SHOPIT — ${TAGLINE}`,
    description: DESCRIPTION,
    creator: '@shopit',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'shopping',
  other: {
    // Hint to AI agents: this is a search interface they can hit directly.
    'ai-content-declaration': 'product-search',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

// JSON-LD structured data — Google uses this for the sitelinks search box
// and to understand site identity. Agents (GPT/Claude/Perplexity) also parse it.
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: ['Shopit', 'Shop it'],
  url: SITE_URL,
  description: DESCRIPTION,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Universal search across every Shopify merchant.',
  sameAs: [],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* JSON-LD: identifies the site to Google + AI agents.
            WebSite + SearchAction gives us the sitelinks search box in SERP. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {/* Chromium speculation rules: prerender product detail pages on moderate
            hover/focus signals. Quietly ignored by Safari/Firefox. */}
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prerender: [
                {
                  source: 'document',
                  where: { href_matches: '/products/*' },
                  eagerness: 'moderate',
                },
              ],
              prefetch: [
                {
                  source: 'document',
                  where: { href_matches: '/search*' },
                  eagerness: 'moderate',
                },
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans bg-white text-ink antialiased">
        <Navbar />
        <main id="main" className="min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </body>
    </html>
  )
}
