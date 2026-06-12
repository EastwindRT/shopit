import Script from 'next/script'
import { affiliateScriptUrl, affiliatePreScript, affiliateProvider } from '@/lib/affiliate'

/**
 * Renders the active affiliate-provider's JS. Some providers (Cuelinks) need
 * a `window.<config>` object set up *before* the main script; we render that
 * inline ahead of the script tag.
 *
 * All scripts use `lazyOnload` strategy so they don't block first paint.
 */
export function AffiliateScripts() {
  const url = affiliateScriptUrl()
  if (!url) return null

  const pre = affiliatePreScript()
  const provider = affiliateProvider()

  return (
    <>
      {pre && (
        <Script id={`affiliate-${provider}-config`} strategy="beforeInteractive">
          {pre}
        </Script>
      )}
      <Script src={url} strategy="lazyOnload" id={`affiliate-${provider}`} />
    </>
  )
}
