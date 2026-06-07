'use client'

import { useState, useMemo } from 'react'
import { formatMoney, formatMoneyRange, cn } from '@/lib/utils'
import { affiliateActive } from '@/lib/affiliate'
import type { UcpProduct, UcpVariant } from '@/lib/ucp/types'

type Props = { product: UcpProduct }

export function ProductInfo({ product }: Props) {
  const options = product.options ?? []
  const variants = product.variants ?? []

  // default selection: first label of each option
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((o) => [o.name, o.values[0]?.label]).filter(([, v]) => v)),
  )

  const matchedVariant = useMemo<UcpVariant | undefined>(() => {
    if (variants.length === 0) return undefined
    return (
      variants.find((v) =>
        (v.selected_options ?? []).every((so) => selected[so.name] === so.label),
      ) ?? variants[0]
    )
  }, [variants, selected])

  const variantPrice = matchedVariant?.price
  const rangeLabel = formatMoneyRange(product.price_range)
  const priceLabel = variantPrice ? formatMoney(variantPrice) : rangeLabel
  // Skimlinks JS (loaded in layout) rewrites outbound checkout URLs at click
  // time. We just need the original URL here.
  const checkoutUrl =
    matchedVariant?.checkout_url ?? variants.find((v) => v.checkout_url)?.checkout_url ?? product.url
  const showAffiliateDisclosure = affiliateActive()
  const sellerName = product.seller?.name

  return (
    <div className="flex flex-col">
      {sellerName && (
        <a
          href={product.seller?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-ink-tertiary uppercase tracking-widest mb-3 hover:text-ink transition-colors w-fit"
        >
          {sellerName}
        </a>
      )}
      <h1 className="text-2xl font-semibold text-ink mb-3">{product.title}</h1>

      <div className="flex items-center gap-3 mb-2">
        {priceLabel && <span className="text-xl font-medium tabular-nums">{priceLabel}</span>}
        {product.rating && product.rating.count > 0 && (
          <span className="text-sm text-ink-tertiary">
            ★ {product.rating.value.toFixed(1)} ({product.rating.count.toLocaleString()})
          </span>
        )}
      </div>

      <div className="mt-4 space-y-5">
        {options.map((option) => (
          <div key={option.name}>
            <p className="text-xs font-medium text-ink-secondary uppercase tracking-wide mb-2">
              {option.name}
            </p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isActive = selected[option.name] === value.label
                return (
                  <button
                    key={value.label}
                    onClick={() =>
                      setSelected((prev) => ({ ...prev, [option.name]: value.label }))
                    }
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                      isActive
                        ? 'border-ink bg-ink text-white'
                        : 'border-surface-3 text-ink hover:border-ink/50',
                    )}
                  >
                    {value.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {checkoutUrl ? (
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mt-8 py-3 rounded-xl text-sm font-medium text-center bg-ink text-white hover:bg-ink/90 active:scale-[0.99] transition-all"
        >
          {sellerName ? `Buy on ${sellerName}` : 'Buy now'}
        </a>
      ) : (
        <div className="w-full mt-8 py-3 rounded-xl text-sm font-medium text-center bg-surface-2 text-ink-tertiary">
          Unavailable
        </div>
      )}

      <p className="mt-3 text-xs text-ink-tertiary text-center">
        Secure checkout on the merchant&rsquo;s Shopify store
        {showAffiliateDisclosure && (
          <span className="block mt-1 text-[10px]">
            Scoppa may earn a commission on this purchase.
          </span>
        )}
      </p>

      {product.description?.plain && (
        <div className="mt-8 pt-8 border-t border-surface-2">
          <p className="text-sm text-ink-secondary leading-relaxed">{product.description.plain}</p>
        </div>
      )}

      {product.metadata?.top_features && (
        <div className="mt-6">
          <p className="text-xs font-medium text-ink-secondary uppercase tracking-wide mb-2">
            Features
          </p>
          <ul className="space-y-1">
            {product.metadata.top_features.split('\n').filter(Boolean).map((line, i) => (
              <li key={i} className="text-sm text-ink-secondary flex gap-2">
                <span className="text-ink-tertiary">·</span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
