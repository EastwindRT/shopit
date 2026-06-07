// Server-Component-safe Shopify CDN image.
//
// Skips `next/image` entirely so the loader function doesn't need to cross the
// RSC boundary. Builds a srcset directly against Shopify's CDN resize params,
// which means:
//   - Bypasses the 2s `/next/image` cold-encode cliff in dev
//   - Uses Shopify's globally edge-cached image service (~150ms cold, ms warm)
//   - Saves Vercel image-optimization quota in production
//
// Trade-off vs next/image: no AVIF (Shopify CDN serves WebP/JPEG). About 20%
// larger file than Next-encoded AVIF, but ~10× faster cold paint. Net win.

import shopifyImageLoader from '@/lib/shopify-image-loader'

// Buckets used in srcset. Mirror next.config.ts deviceSizes for parity.
const WIDTHS = [128, 256, 384, 640, 750, 828, 1080, 1200, 1920]

type Props = {
  src: string
  alt: string
  /** Forwarded to the rendered `<img>` `sizes` attribute. */
  sizes: string
  quality?: number
  /** "fill" container (parent must be `position: relative`). */
  fill?: boolean
  /** Explicit dimensions (alternative to fill). */
  width?: number
  height?: number
  className?: string
  /** Eager-load above-the-fold images. */
  priority?: boolean
  /** Add native browser lazy loading. */
  loading?: 'lazy' | 'eager'
  decoding?: 'sync' | 'async' | 'auto'
  fetchPriority?: 'high' | 'low' | 'auto'
}

export function ShopifyImage({
  src,
  alt,
  sizes,
  quality = 75,
  fill = false,
  width,
  height,
  className,
  priority = false,
  loading,
  decoding = 'async',
  fetchPriority,
}: Props) {
  const srcSet = WIDTHS.map(
    (w) => `${shopifyImageLoader({ src, width: w, quality })} ${w}w`,
  ).join(', ')

  // Pick a sensible single-src fallback for browsers without srcset support
  // and for the LCP image's first byte. Use a mid-bucket.
  const fallback = shopifyImageLoader({ src, width: 1080, quality })

  // Priority images load eagerly + high fetch priority; others lazy-load.
  const resolvedLoading = loading ?? (priority ? 'eager' : 'lazy')
  const resolvedFetchPriority = fetchPriority ?? (priority ? 'high' : 'auto')

  const style: React.CSSProperties = fill
    ? {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }
    : {}

  return (
    <img
      src={fallback}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={resolvedLoading}
      decoding={decoding}
      fetchPriority={resolvedFetchPriority}
      className={className}
      style={style}
    />
  )
}
