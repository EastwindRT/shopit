// Affiliate monetization config.
//
// Scoppa sends users to thousands of independent Shopify merchants' checkout
// URLs. Per-merchant affiliate signups don't scale. Skimlinks is a universal
// affiliate network with pre-negotiated commissions across most Shopify
// merchants — they auto-rewrite outbound product/checkout links at click time
// via a single JS snippet.
//
// Enable by setting both in env:
//   NEXT_PUBLIC_AFFILIATE_PROVIDER=skimlinks
//   NEXT_PUBLIC_SKIMLINKS_ID=304358X1792528     # the compound publisherId X siteId
//
// FTC disclosure is shown automatically when the provider is active.

type Provider = 'none' | 'skimlinks'

const PROVIDER = (process.env.NEXT_PUBLIC_AFFILIATE_PROVIDER ?? 'none') as Provider
const SKIMLINKS_ID = process.env.NEXT_PUBLIC_SKIMLINKS_ID ?? ''

/** URL of the Skimlinks JS to inject, or null if affiliate is disabled. */
export function skimlinksScriptUrl(): string | null {
  if (PROVIDER !== 'skimlinks' || !SKIMLINKS_ID) return null
  return `https://s.skimresources.com/js/${SKIMLINKS_ID}.skimlinks.js`
}

/** True when affiliate tracking is live — used to render the FTC disclosure. */
export function affiliateActive(): boolean {
  return PROVIDER !== 'none' && (PROVIDER !== 'skimlinks' || Boolean(SKIMLINKS_ID))
}
