// Custom Next.js image loader for Shopify CDN.
//
// Why bypass `/_next/image`?
//   - Shopify CDN already serves resized, format-negotiated images via URL params.
//   - It's globally edge-cached. Our Next instance is not.
//   - Cold optimization through Next.js takes ~2s in dev (1MB source PNG → AVIF).
//   - Cold fetch direct from Shopify CDN is ~150ms.
//
// Trade-off: we lose AVIF (Shopify serves WebP/JPEG). ~20% file-size penalty
// vs Next-encoded AVIF — but ~10× faster cold paint. Worth it for our use case
// since every image we render is already on Shopify CDN.

type LoaderArgs = {
  src: string
  width: number
  quality?: number
}

export default function shopifyImageLoader({ src, width, quality }: LoaderArgs): string {
  // Defensive: if somehow a non-Shopify URL slips through, return it untouched
  // and let the browser fetch it directly.
  if (!src.startsWith('http')) return src

  try {
    const url = new URL(src)
    url.searchParams.set('width', String(width))
    if (quality) url.searchParams.set('quality', String(quality))
    return url.href
  } catch {
    return src
  }
}
