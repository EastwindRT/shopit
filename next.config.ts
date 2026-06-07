import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Strip dev-only console calls from the prod bundle (keeps error/warn).
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Hold the client-side RSC cache longer so back/forward and re-search feel instant.
  // dynamic: 30s (was 0) — repeating a recent search paints from cache.
  // static: 180s (was 300) — prefetched static segments stay warm.
  experimental: {
    staleTimes: { dynamic: 30, static: 180 },
    // Inline critical CSS into the initial HTML for first-paint speed.
    optimizeCss: true,
    // Tree-shake named imports for these libs.
    optimizePackageImports: ['clsx', 'tailwind-merge', 'geist'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // deviceSizes still controls which `w` values srcset uses (loader receives them).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [50, 60, 75, 80],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
    minimumCacheTTL: 31536000,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Hashed static assets — immutable, cache for a year.
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // LLM discovery file — short TTL so agents pick up changes quickly.
        source: '/llms.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=3600' },
        ],
      },
      {
        // Search results: cache at the CDN edge for 5 minutes, serve stale
        // for an hour. CDN-Cache-Control is the modern CDN-specific
        // directive — overrides Cloudflare's default of skipping HTML.
        source: '/search',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=3600',
          },
          // Surrogate-Control: legacy header still honored by some CDNs.
          {
            key: 'Surrogate-Control',
            value: 'max-age=300, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/products/:id*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=600, stale-while-revalidate=86400',
          },
          {
            key: 'Surrogate-Control',
            value: 'max-age=600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/api/ucp/search',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=120, stale-while-revalidate=600',
          },
          {
            key: 'CDN-Cache-Control',
            value: 'public, s-maxage=120, stale-while-revalidate=600',
          },
        ],
      },
    ]
  },
}

export default nextConfig
