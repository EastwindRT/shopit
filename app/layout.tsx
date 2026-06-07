import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { skimlinksScriptUrl } from '@/lib/affiliate'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://scoppa.shop'
const SITE_NAME = 'Scoppa'
const TAGLINE = 'The front page of Shopify'
const DESCRIPTION =
  'Scoppa is the front page of Shopify — search every Shopify store at once. Discover products across thousands of independent merchants in plain language, with prices, ratings and direct checkout. Powered by Shopify Universal Commerce Protocol.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s · Scoppa',
    default: `Scoppa — ${TAGLINE}`,
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
    title: `Scoppa — ${TAGLINE}`,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Scoppa — ${TAGLINE}`,
    description: DESCRIPTION,
    creator: '@scoppashop',
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
  alternateName: ['SCOPPA', 'Scoppa Shop'],
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
        {/* Preconnect to origins we hit on every page. Warming the DNS + TLS
            handshake here saves ~100–200ms on the first image / first UCP
            call after the page paints. */}
        <link rel="preconnect" href="https://cdn.shopify.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.shopify.com" />
        <link rel="preconnect" href="https://catalog.shopify.com" />
        <link rel="dns-prefetch" href="https://s.skimresources.com" />
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
        {/* Skimlinks: auto-rewrites outbound merchant links at click time.
            Only loaded when NEXT_PUBLIC_AFFILIATE_PROVIDER=skimlinks +
            NEXT_PUBLIC_SKIMLINKS_ID are set. */}
        {skimlinksScriptUrl() && (
          <Script
            src={skimlinksScriptUrl()!}
            strategy="lazyOnload"
            id="skimlinks"
          />
        )}
      </body>
    </html>
  )
}
