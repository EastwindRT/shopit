// UCP (Universal Commerce Protocol) types — global Shopify catalog
// Endpoint: https://catalog.shopify.com/api/ucp/mcp
// Spec: dev.ucp.shopping + dev.shopify.catalog.global (2026-04-08)

export type UcpMoney = {
  /** Integer minor units (cents). 8999 => $89.99 */
  amount: number
  currency: string
}

export type UcpMedia = {
  type: 'image' | 'video' | string
  url: string
  alt_text: string | null
}

export type UcpOptionValue = { label: string }

export type UcpOption = {
  name: string
  values: UcpOptionValue[]
}

export type UcpVariant = {
  id: string
  sku?: string
  title: string
  price?: UcpMoney
  /** Direct handoff to the owning merchant's Shopify checkout */
  checkout_url?: string
  available?: boolean
  selected_options?: { name: string; label: string }[]
  media?: UcpMedia[]
}

export type UcpSellerLink = { type: string; url: string }

export type UcpSeller = {
  name: string
  id: string
  domain: string
  url: string
  links?: UcpSellerLink[]
}

export type UcpRating = {
  value: number
  scale_min: number
  scale_max: number
  count: number
}

export type UcpProductMetadata = {
  unique_selling_points?: string[]
  top_features?: string
  tech_specs?: string
}

export type UcpProduct = {
  id: string
  title: string
  description?: { plain?: string; html?: string }
  url?: string
  rating?: UcpRating
  price_range?: { min: UcpMoney; max: UcpMoney }
  media?: UcpMedia[]
  options?: UcpOption[]
  variants?: UcpVariant[]
  seller?: UcpSeller
  metadata?: UcpProductMetadata
}

export type UcpSearchResult = {
  products: UcpProduct[]
}

export type UcpProductResult = {
  product: UcpProduct
}

export type UcpContext = {
  address_country?: string
  address_region?: string
  postal_code?: string
  language?: string
  currency?: string
  intent?: string
}

export type UcpSearchFilters = {
  ships_to?: { country: string }
  available?: boolean
  price?: { min?: number; max?: number }
  shops?: string[]
  /** Free-form category labels (OR logic). UCP recognizes Shopify-aligned taxonomy terms. */
  categories?: string[]
}
