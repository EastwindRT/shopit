import { NextRequest, NextResponse } from 'next/server'
import { searchCatalogFirstPage, productIdToSlug } from '@/lib/ucp/client'

export const runtime = 'nodejs'

// Slim typeahead payload — only what the dropdown renders.
export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ products: [] })
  }

  try {
    const signal =
      typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(4500) : undefined
    const products = await searchCatalogFirstPage(query, {
      limit: 10,
      revalidate: 0,
      cache: 'no-store',
      signal,
    })

    const slim = products.slice(0, 6).map((p) => ({
      slug: productIdToSlug(p.id),
      title: p.title,
      image: p.media?.find((m) => m.type === 'image')?.url ?? null,
      price: p.price_range?.min ?? null,
      seller: p.seller?.name ?? null,
    }))

    return NextResponse.json(
      { products: slim },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch {
    return NextResponse.json({ products: [] }, { status: 200 })
  }
}
