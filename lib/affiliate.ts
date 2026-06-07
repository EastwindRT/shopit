// Pluggable affiliate-link rewriter.
//
// SHOPIT sends users to thousands of independent Shopify merchants' checkout
// URLs. Per-merchant affiliate signups don't scale. The right pattern for an
// aggregator is a universal affiliate network (Skimlinks, Sovrn) that has
// pre-negotiated commissions with most Shopify merchants and rewrites outbound
// URLs on the fly.
//
// Today this module is a no-op (AFFILIATE_PROVIDER unset or 'none'). Once you
// have a Skimlinks site_id, set:
//
//   AFFILIATE_PROVIDER=skimlinks
//   SKIMLINKS_SITE_ID=<numeric id>
//
// All outbound merchant URLs get rewritten through Skimlinks automatically.

type Provider = 'none' | 'skimlinks'

// NEXT_PUBLIC_ so client components can rewrite URLs at render time. The
// site_id isn't a secret — it appears in every outbound affiliate URL.
const PROVIDER = (process.env.NEXT_PUBLIC_AFFILIATE_PROVIDER ?? 'none') as Provider
const SKIMLINKS_SITE_ID = process.env.NEXT_PUBLIC_SKIMLINKS_SITE_ID ?? ''

/**
 * Wrap an outbound merchant URL so commissions are tracked.
 * Returns the original URL unchanged when no provider is configured.
 */
export function affiliateUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return ''

  switch (PROVIDER) {
    case 'skimlinks':
      return skimlinksRewrite(rawUrl)
    case 'none':
    default:
      return rawUrl
  }
}

// Skimlinks server-side URL rewriting via their redirect endpoint.
// Pattern: https://go.skimresources.com/?id={site_id}&url={encoded_destination}
//
// (Their click endpoint also accepts an `xs=1` param for server-side opt-in
// tracking, and a `sref` for attribution source.)
function skimlinksRewrite(url: string): string {
  if (!SKIMLINKS_SITE_ID) return url
  const encoded = encodeURIComponent(url)
  return `https://go.skimresources.com/?id=${SKIMLINKS_SITE_ID}&xs=1&url=${encoded}&sref=shopit`
}

/** True when affiliate tracking is live — useful for disclosure UI. */
export function affiliateActive(): boolean {
  return PROVIDER !== 'none' && (PROVIDER !== 'skimlinks' || Boolean(SKIMLINKS_SITE_ID))
}
