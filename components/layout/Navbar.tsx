import Link from 'next/link'
import { SearchTrigger } from '@/components/search/SearchTrigger'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            aria-label="Scoppa — the front page of Shopify"
            className="text-sm font-bold tracking-tight hover:opacity-70 transition-opacity"
          >
            Scoppa
          </Link>
          <Link
            href="/topics"
            className="hidden sm:inline-block text-xs text-ink-secondary hover:text-ink transition-colors"
          >
            Topics
          </Link>
          <Link
            href="/articles"
            className="hidden sm:inline-block text-xs text-ink-secondary hover:text-ink transition-colors"
          >
            Articles
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <SearchTrigger />
        </div>
      </nav>
    </header>
  )
}
