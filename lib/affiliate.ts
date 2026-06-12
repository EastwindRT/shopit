// Affiliate monetization — provider-agnostic.
//
// Scoppa is an aggregator that sends users to thousands of independent Shopify
// merchants' checkout pages. Per-merchant affiliate signups don't scale, so we
// rely on universal affiliate networks that pre-negotiate commissions across
// many merchants and rewrite outbound product/checkout links via a single JS
// snippet.
//
// Supported providers:
//   - skimlinks   (https://skimlinks.com)        Strict approval, premium merchants
//   - sovrn       (https://commerce.sovrn.com)   VigLink-era, mid-tier approval
//   - cuelinks    (https://www.cuelinks.com)     Most permissive, India-friendly
//   - custom      arbitrary <script src> URL — for any provider not natively
//                 supported (use NEXT_PUBLIC_AFFILIATE_SCRIPT_URL)
//
// To enable, set both:
//   NEXT_PUBLIC_AFFILIATE_PROVIDER=<provider>
//   NEXT_PUBLIC_AFFILIATE_ID=<your account id from the provider>
//   (or NEXT_PUBLIC_AFFILIATE_SCRIPT_URL=<full url> for custom)

export type Provider = 'none' | 'skimlinks' | 'sovrn' | 'cuelinks' | 'custom'

const PROVIDER = (process.env.NEXT_PUBLIC_AFFILIATE_PROVIDER ?? 'none') as Provider
const ID = process.env.NEXT_PUBLIC_AFFILIATE_ID ?? ''
const CUSTOM_URL = process.env.NEXT_PUBLIC_AFFILIATE_SCRIPT_URL ?? ''

/** Active provider name, or 'none'. */
export function affiliateProvider(): Provider {
  return PROVIDER
}

/** Returns the affiliate ID configured for the active provider, if any. */
export function affiliateId(): string {
  return ID
}

/**
 * URL of the third-party JS to inject into <body>. Returns null when affiliate
 * is disabled (env unset or provider has no ID).
 */
export function affiliateScriptUrl(): string | null {
  switch (PROVIDER) {
    case 'skimlinks':
      // Format: 304358X1792528 (publisherId × siteId, dot-separated upstream).
      return ID ? `https://s.skimresources.com/js/${ID}.skimlinks.js` : null
    case 'sovrn':
      // VigLink-era endpoint — Sovrn still serves it. ID is the publisher key.
      return ID ? `https://www.viglink.com/api/vglnk.js?key=${ID}` : null
    case 'cuelinks':
      // Cuelinks needs config in window.clksCfg before the script loads — see
      // <AffiliateScripts /> which emits both pieces in the right order.
      return ID ? 'https://cdn0.cuelinks.com/js/cuelinks.min.js' : null
    case 'custom':
      return CUSTOM_URL || null
    case 'none':
    default:
      return null
  }
}

/** True when affiliate tracking is live — drives the FTC disclosure UI. */
export function affiliateActive(): boolean {
  return Boolean(affiliateScriptUrl())
}

/**
 * Inline JS string to render *before* the main script tag, for providers that
 * need a global config object set up first. Returns null for providers that
 * don't need a pre-script.
 */
export function affiliatePreScript(): string | null {
  if (PROVIDER === 'cuelinks' && ID) {
    return `window.clksCfg = { cid: ${JSON.stringify(ID)} };`
  }
  return null
}
