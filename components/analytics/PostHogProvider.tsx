'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

// PostHog client analytics. Activates only when NEXT_PUBLIC_POSTHOG_KEY is set
// — local/dev runs without it stay clean (no network calls, no SDK loaded).
//
// What we capture by default:
//   - page views (with full URL including query params)
//   - sessions
//   - referrer + utm tags
//   - device + browser + OS
//   - rough geo (city/country)
//
// Custom events can be tracked later via `posthog.capture('event_name', {...})`.

let initialized = false

function initPostHog() {
  if (initialized || !KEY || typeof window === 'undefined') return
  posthog.init(KEY, {
    api_host: HOST,
    // We manage page views manually below so they fire on App Router nav too.
    capture_pageview: false,
    // Keep page leaves accurate for session duration metrics.
    capture_pageleave: true,
    // Respect Do Not Track.
    respect_dnt: true,
    // Privacy: don't record password/email inputs by default.
    autocapture: {
      dom_event_allowlist: ['click', 'submit'],
      url_allowlist: [/^https?:\/\/(?:www\.)?scoppa\.shop/],
    },
    // Lighter cookie footprint.
    persistence: 'localStorage+cookie',
  })
  initialized = true
}

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!KEY) return
    initPostHog()
    if (!initialized || !pathname) return
    const qs = searchParams?.toString()
    const url = qs ? `${pathname}?${qs}` : pathname
    posthog.capture('$pageview', { $current_url: window.location.origin + url })
  }, [pathname, searchParams])

  return null
}

/**
 * Wrap children in a Suspense boundary — useSearchParams requires it during
 * static rendering. The provider itself renders nothing visible.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  )
}
