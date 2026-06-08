import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {
  /** Path without query string, e.g. "/search" or "/topics/running-shoes" */
  basePath: string
  /** Existing query params (excluding `page`) that should be preserved. */
  params?: Record<string, string | undefined>
  currentPage: number
  totalPages: number
}

/**
 * Server-rendered pagination — emits real `<a href>` links so every page is
 * crawlable and shareable. Shows max 7 visible page slots with ellipsis when
 * there are gaps; Prev/Next are disabled on the boundaries.
 */
export function Pagination({ basePath, params = {}, currentPage, totalPages }: Props) {
  if (totalPages <= 1) return null

  const pages = pageRange(currentPage, totalPages)

  function urlFor(page: number): string {
    const usp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v) usp.set(k, v)
    }
    if (page > 1) usp.set('page', String(page))
    const qs = usp.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const prev = currentPage > 1 ? urlFor(currentPage - 1) : null
  const next = currentPage < totalPages ? urlFor(currentPage + 1) : null

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-1 text-sm"
      aria-label="Pagination"
    >
      {/* Prev */}
      {prev ? (
        <Link
          href={prev}
          rel="prev"
          className="px-3 py-1.5 text-ink-secondary hover:text-ink hover:bg-surface-1 rounded-md transition-colors"
        >
          ← Prev
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-ink-tertiary cursor-not-allowed">← Prev</span>
      )}

      {/* Page numbers + ellipsis */}
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-ink-tertiary select-none">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={urlFor(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={cn(
              'min-w-8 px-2 py-1.5 text-center rounded-md transition-colors tabular-nums',
              p === currentPage
                ? 'bg-ink text-white'
                : 'text-ink-secondary hover:text-ink hover:bg-surface-1',
            )}
          >
            {p}
          </Link>
        ),
      )}

      {/* Next */}
      {next ? (
        <Link
          href={next}
          rel="next"
          className="px-3 py-1.5 text-ink-secondary hover:text-ink hover:bg-surface-1 rounded-md transition-colors"
        >
          Next →
        </Link>
      ) : (
        <span className="px-3 py-1.5 text-ink-tertiary cursor-not-allowed">Next →</span>
      )}
    </nav>
  )
}

/**
 * Returns a compact range like [1, '…', 4, 5, 6, '…', 12] with at most ~7
 * visible slots. Always includes the first + last page; pads around current.
 */
function pageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const out: (number | '…')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) out.push('…')
  for (let p = start; p <= end; p++) out.push(p)
  if (end < total - 1) out.push('…')
  out.push(total)
  return out
}
