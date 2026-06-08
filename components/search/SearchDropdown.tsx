'use client'

import Link from 'next/link'
import { ShopifyImage } from '@/components/ShopifyImage'
import { formatMoney } from '@/lib/utils'
import type { SlashCommand } from '@/lib/search/commands'

export type SlimProduct = {
  slug: string
  title: string
  image: string | null
  price: { amount: number; currency: string } | null
  seller: string | null
}

type Props = {
  query: string
  suggestions: string[]
  products: SlimProduct[]
  loading: boolean
  commandHints?: SlashCommand[]
  onPickCommand?: (cmd: SlashCommand) => void
  onPickSuggestion: (suggestion: string) => void
  onClose: () => void
}

export function SearchDropdown({
  query,
  suggestions,
  products,
  loading,
  commandHints = [],
  onPickCommand,
  onPickSuggestion,
  onClose,
}: Props) {
  const hasCommands = commandHints.length > 0
  const hasSuggestions = !hasCommands && suggestions.length > 0
  const hasProducts = !hasCommands && products.length > 0

  if (!hasSuggestions && !hasProducts && !hasCommands && !loading) return null

  return (
    <div
      className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-surface-3 rounded-xl shadow-lg overflow-hidden z-50 animate-slide-up"
      role="listbox"
    >
      {/* No internal spinner — the input row shows a small spinner instead, so
          the dropdown content doesn't reflow while a new query is fetching. */}

      {hasCommands && (
        <div className="px-2 py-2 border-b border-surface-2/60">
          <p className="text-[10px] font-medium text-ink-tertiary uppercase tracking-widest px-3 pb-1.5">
            Commands
          </p>
          {commandHints.map((cmd) => (
            <button
              key={cmd.name}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onPickCommand?.(cmd)}
              className="w-full text-left px-3 py-1.5 hover:bg-surface-1 rounded-lg transition-colors flex items-baseline gap-3"
              role="option"
            >
              <code className="text-xs font-mono text-ink bg-surface-2 px-1.5 py-0.5 rounded">
                /{cmd.name}
              </code>
              <span className="text-xs text-ink-secondary truncate flex-1">
                {cmd.description}
              </span>
              <span className="text-[10px] text-ink-tertiary uppercase tracking-wider flex-shrink-0">
                {cmd.group}
              </span>
            </button>
          ))}
        </div>
      )}

      {hasSuggestions && (
        <div className="px-2 py-2 border-b border-surface-2/60">
          <p className="text-[10px] font-medium text-ink-tertiary uppercase tracking-widest px-3 pb-1.5">
            Suggestions
          </p>
          {suggestions.slice(0, 4).map((suggestion) => (
            <button
              key={suggestion}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onPickSuggestion(suggestion)}
              className="w-full text-left px-3 py-1.5 hover:bg-surface-1 rounded-lg transition-colors flex items-center gap-2"
              role="option"
            >
              <svg
                className="w-3 h-3 text-ink-tertiary flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-ink truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {hasProducts && (
        <div className="px-2 py-2">
          <p className="text-[10px] font-medium text-ink-tertiary uppercase tracking-widest px-3 pb-1.5">
            Products
          </p>
          {products.slice(0, 5).map((product) => (
            <Link
              key={product.slug}
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 hover:bg-surface-1 rounded-lg transition-colors"
              role="option"
              prefetch
            >
              <div className="w-10 h-10 skeleton rounded-md overflow-hidden flex-shrink-0">
                {product.image && (
                  <ShopifyImage
                    src={product.image}
                    alt={product.title}
                    width={40}
                    height={40}
                    quality={50}
                    sizes="40px"
                    className="object-cover w-full h-full"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink truncate">{product.title}</p>
                <p className="text-xs text-ink-tertiary truncate tabular-nums">
                  {product.price ? formatMoney(product.price) : ''}
                  {product.price && product.seller ? ' · ' : ''}
                  {product.seller ?? ''}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {(hasSuggestions || hasProducts) && (
        <button
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPickSuggestion(query)}
          className="w-full text-left px-5 py-2.5 text-xs text-ink-secondary hover:bg-surface-1 border-t border-surface-2/60 transition-colors"
        >
          See all results for <span className="font-medium text-ink">&ldquo;{query}&rdquo;</span> →
        </button>
      )}
    </div>
  )
}
