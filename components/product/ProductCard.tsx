import Link from 'next/link'
import { ShopifyImage } from '@/components/ShopifyImage'
import { formatMoneyRange } from '@/lib/utils'
import { productIdToSlug } from '@/lib/ucp/client'
import type { UcpProduct } from '@/lib/ucp/types'

type Props = {
  product: UcpProduct
  priority?: boolean
}

export function ProductCard({ product, priority = false }: Props) {
  const slug = productIdToSlug(product.id)
  const image = product.media?.find((m) => m.type === 'image')
  const priceLabel = formatMoneyRange(product.price_range)

  return (
    <Link href={`/products/${slug}`} className="group block" prefetch={null}>
      <div className="relative aspect-square skeleton rounded-xl overflow-hidden mb-3">
        {image ? (
          <ShopifyImage
            src={image.url}
            alt={image.alt_text ?? product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            quality={60}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 bg-surface-2" />
        )}
      </div>
      <div className="space-y-1 px-0.5">
        <p className="text-sm font-medium text-ink line-clamp-2 group-hover:text-accent transition-colors">
          {product.title}
        </p>
        <div className="flex items-center justify-between gap-2">
          {priceLabel && <span className="text-sm text-ink tabular-nums">{priceLabel}</span>}
          {product.rating && product.rating.count > 0 && (
            <span className="text-xs text-ink-tertiary tabular-nums">
              ★ {product.rating.value.toFixed(1)}
            </span>
          )}
        </div>
        {product.seller?.name && (
          <p className="text-xs text-ink-tertiary truncate">{product.seller.name}</p>
        )}
      </div>
    </Link>
  )
}
