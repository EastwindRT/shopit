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
    ]
  },
}

export default nextConfig
