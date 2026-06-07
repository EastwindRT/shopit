import { ProductCard } from './ProductCard'
import type { UcpProduct } from '@/lib/ucp/types'

type Props = {
  products: UcpProduct[]
}

export function ProductGrid({ products }: Props) {
  if (products.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 5} />
      ))}
    </div>
  )
}
