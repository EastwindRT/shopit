'use client'

import { useState } from 'react'
import { ShopifyImage } from '@/components/ShopifyImage'
import type { UcpMedia } from '@/lib/ucp/types'
import { cn } from '@/lib/utils'

type Props = { media: UcpMedia[] }

export function ProductGallery({ media }: Props) {
  const images = media.filter((m) => m.type === 'image' && m.url)
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return <div className="aspect-square bg-surface-1 rounded-2xl" />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square skeleton rounded-2xl overflow-hidden">
        <ShopifyImage
          src={images[active].url}
          alt={images[active].alt_text ?? ''}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          quality={80}
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActive(i)}
              className={cn(
                'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                i === active ? 'border-ink' : 'border-transparent hover:border-surface-3',
              )}
              aria-label={`View image ${i + 1}`}
            >
              <ShopifyImage src={img.url} alt={img.alt_text ?? ''} fill sizes="64px" quality={50} className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
