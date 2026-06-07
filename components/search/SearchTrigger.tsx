'use client'

import { useRouter } from 'next/navigation'

export function SearchTrigger() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push('/search')}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-ink-secondary hover:text-ink bg-surface-1 hover:bg-surface-2 border border-surface-3 rounded-lg transition-all"
      aria-label="Search"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden md:inline text-xs bg-surface-2 text-ink-tertiary px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
    </button>
  )
}
