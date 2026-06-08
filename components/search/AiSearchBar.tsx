'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getSearchSuggestions } from '@/lib/search/suggestions'
import { parseSearch, buildSearchUrl, searchCommands, type SlashCommand } from '@/lib/search/commands'
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

  // Slash-command autocomplete: detect the *current* token under the cursor
  // (the last whitespace-delimited word) and, if it starts with "/", match
  // it against the command registry.
  const commandHints = useMemo<SlashCommand[]>(() => {
    const lastToken = query.split(/\s+/).pop() ?? ''
    if (!lastToken.startsWith('/')) return []
    return searchCommands(lastToken, 6)
  }, [query])

  // Pre-warm the /search RSC payload + the typeahead API. By the time the user
  // hits Enter, both are cached.
  const prefetchSearch = useCallback(
    (q: string) => {
      const trimmed = q.trim()
      if (trimmed.length < 2 || lastPrefetchRef.current === trimmed) return
      lastPrefetchRef.current = trimmed
      router.prefetch(buildSearchUrl(parseSearch(trimmed)))
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
      router.prefetch(buildSearchUrl(parseSearch(val.trim())))
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
    // Parse slash commands first — they expand to URL params (country,
    // maxPrice, sort) and may augment the query with extra keywords.
    const parsed = parseSearch(trimmed)
    if (!parsed.query) return
    startTransition(() => router.push(buildSearchUrl(parsed)))
  }

  /** Replace the current `/foo` token (last word) with `/cmd ` and keep typing. */
  function applyCommand(cmd: SlashCommand) {
    const tokens = query.split(/\s+/)
    tokens[tokens.length - 1] = `/${cmd.name}`
    const next = tokens.join(' ') + ' '
    setQuery(next)
    inputRef.current?.focus()
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
      {/* DOS-style terminal input. Black bg, amber text, monospace, sharp
          corners, branded `scoppa>` prompt. CSS-only — zero perf cost. */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 font-mono bg-ink border transition-colors duration-150',
          open
            ? 'border-amber-400/60 shadow-[0_0_0_1px_rgba(251,191,36,0.15)]'
            : 'border-amber-400/30 hover:border-amber-400/50',
        )}
      >
        <span
          className="text-amber-400 text-sm flex-shrink-0 select-none tracking-tight"
          aria-hidden="true"
        >
          scoppa&gt;
        </span>

        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 2) setOpen(true)
          }}
          placeholder="_"
          className="flex-1 bg-transparent text-sm text-amber-400 caret-amber-400 placeholder:text-amber-400/40 outline-none min-w-0 font-mono"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Search products across Shopify"
          aria-expanded={open}
          aria-haspopup="listbox"
        />

        {/* Inline spinner — replaces the dropdown spinner. Stays in the input
            row so the dropdown content (suggestions/products) doesn't reflow. */}
        {loading && query.length >= 2 && (
          <div
            className="w-3.5 h-3.5 border-2 border-amber-400/20 border-t-amber-400 rounded-full animate-spin flex-shrink-0"
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
            className="text-amber-400/60 hover:text-amber-400 transition-colors"
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
          commandHints={commandHints}
          onPickCommand={applyCommand}
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
