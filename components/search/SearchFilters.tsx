'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { CATEGORIES, COUNTRIES } from '@/lib/search/facets'

export type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'rating'

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

type Props = {
  country: string
  category: string
  sort?: SortKey
  resultCount?: number
}

export function SearchFilters({ country, category, sort = 'relevance', resultCount }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const update = useCallback(
    (key: 'country' | 'category' | 'sort', value: string) => {
      const next = new URLSearchParams(params.toString())
      const isDefault = key === 'sort' && value === 'relevance'
      if (value && !isDefault) next.set(key, value)
      else next.delete(key)
      startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }))
    },
    [router, pathname, params],
  )

  const hasFilters = Boolean(country || category || (sort && sort !== 'relevance'))

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <Select
        label="Country"
        value={country}
        onChange={(v) => update('country', v)}
        options={COUNTRIES.map((c) => ({ value: c.code, label: c.label }))}
      />
      <Select
        label="Category"
        value={category}
        onChange={(v) => update('category', v)}
        options={CATEGORIES.map((c) => ({ value: c, label: c || 'Any category' }))}
      />
      <Select
        label="Sort"
        value={sort}
        onChange={(v) => update('sort', v)}
        options={SORTS.map((s) => ({ value: s.value, label: s.label }))}
      />
      {hasFilters && (
        <button
          onClick={() => {
            const next = new URLSearchParams(params.toString())
            next.delete('country')
            next.delete('category')
            next.delete('sort')
            startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }))
          }}
          className="text-xs text-ink-tertiary hover:text-ink transition-colors px-2"
        >
          Clear
        </button>
      )}
      <span
        className={cn(
          'ml-auto text-xs text-ink-tertiary tabular-nums transition-opacity',
          pending && 'opacity-50',
        )}
      >
        {pending ? 'Updating…' : resultCount != null ? `${resultCount} results` : ''}
      </span>
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className="relative inline-flex items-center group">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none text-xs font-medium pl-3 pr-8 py-1.5 rounded-full border border-surface-3 bg-surface-1 text-ink hover:border-ink/30 focus:outline-none focus:border-ink/50 transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-2 w-3 h-3 text-ink-tertiary pointer-events-none"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5l3 3 3-3" />
      </svg>
    </label>
  )
}
