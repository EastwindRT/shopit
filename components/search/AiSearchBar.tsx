'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getSearchSuggestions } from '@/lib/search/suggestions'
import { SearchDropdown, type SlimProduct } from './SearchDropdown'

type Props = {
  initialQuery?: string
}

export function AiSearchBar({ initialQuery }: Props) {
  const [query, setQuery] = useState(initialQuery ?? '')
  const [open, setOpen] = useState(false)
  // Keep the last successfully-fetched products visible while a new query is
  // in flight — eliminates the "empty dropdown flash" between keystrokes.
  const [products, setProducts] = useState<SlimProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastPrefetchRef = useRef<string>('')
  const router = useRouter()
  const suggestions = useMemo(() => getSearchSuggestions(query), [query])

  // Pre-warm the /search RSC payload + the typeahead API. By the time the user
  // hits Enter, both are cached.
  const prefetchSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim()
      if (trimmed.length < 2 || lastPrefetchRef.current === trimmed) return
      lastPrefetchRef.current = trimmed
      router.prefetch(`/search?q=${encodeURIComponent(trimmed)}`)
    },
    [router],
  )

  const fetchProducts = useCallback(async (q: string) => {
    if (q.length < 2) {
      setProducts([])
      setLoading(false)
      return
    }
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    try {
      const res = await fetch(`/api/ucp/search?q=${encodeURIComponent(q)}`, {
        signal: controller.signal,
      })
      if (res.ok) {
        const data = await res.json()
        // Replace stale list only on success — never wipe to [] mid-typing.
        setProducts(data.products ?? [])
      }
    } catch {
      // aborted or network error — keep showing the prior products
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (val.trim().length >= 2) setOpen(true)
    else setOpen(false)

    // Eager prefetch on first character past threshold — primes the Next.js
    // RSC cache for this query immediately, debounced fetch follows.
    if (val.trim().length >= 2 && lastPrefetchRef.current !== val.trim()) {
      router.prefetch(`/search?q=${encodeURIComponent(val.trim())}`)
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchProducts(val)
      prefetchSearch(val)
    }, 120)
  }

  // Outside-click closes the dropdown — Google does this and most apps don't.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  // Clean up any pending debounce on unmount.
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      abortRef.current?.abort()
    },
    [],
  )

  function submit(q: string) {
    const trimmed = q.trim()
    if (!trimmed) return
    setOpen(false)
    startTransition(() => router.push(`/search?q=${encodeURIComponent(trimmed)}`))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') submit(query)
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={cn(
          'flex items-center gap-2 px-3.5 py-2.5 bg-surface-1 border rounded-full transition-colors duration-150',
          open
            ? 'border-ink/30 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
            : 'border-surface-3 hover:border-surface-2',
        )}
      >
        <svg
          className="w-4 h-4 text-ink-tertiary flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2) setOpen(true)
          }}
          placeholder="Search every Shopify store"
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-tertiary outline-none min-w-0"
          autoComplete="off"
          aria-label="Search products across Shopify"
          aria-expanded={open}
          aria-haspopup="listbox"
        />

        {/* Inline spinner — replaces the dropdown spinner. Stays in the input
            row so the dropdown content (suggestions/products) doesn't reflow. */}
        {loading && query.length >= 2 && (
          <div
            className="w-3.5 h-3.5 border-2 border-ink/15 border-t-ink/60 rounded-full animate-spin flex-shrink-0"
            aria-hidden="true"
          />
        )}

        {query && !loading && (
          <button
            onClick={() => {
              setQuery('')
              setProducts([])
              setOpen(false)
              inputRef.current?.focus()
            }}
            className="text-ink-tertiary hover:text-ink transition-colors"
            aria-label="Clear search"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && query.length >= 2 && (
        <SearchDropdown
          query={query}
          suggestions={suggestions}
          products={products}
          loading={loading}
          onPickSuggestion={(suggestion) => {
            setQuery(suggestion)
            submit(suggestion)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
