export const COUNTRIES: { code: string; label: string; currency: string }[] = [
  { code: '', label: 'Any country', currency: 'USD' },
  { code: 'US', label: 'United States', currency: 'USD' },
  { code: 'CA', label: 'Canada', currency: 'CAD' },
  { code: 'GB', label: 'United Kingdom', currency: 'GBP' },
  { code: 'AU', label: 'Australia', currency: 'AUD' },
  { code: 'DE', label: 'Germany', currency: 'EUR' },
  { code: 'FR', label: 'France', currency: 'EUR' },
  { code: 'JP', label: 'Japan', currency: 'JPY' },
  { code: 'IN', label: 'India', currency: 'INR' },
]

export const CATEGORIES = [
  '',
  'Apparel',
  'Footwear',
  'Accessories',
  'Beauty',
  'Home',
  'Electronics',
  'Outdoor',
  'Food & Drink',
  'Toys',
]

export const COUNTRY_TO_CURRENCY: Record<string, string> = Object.fromEntries(
  COUNTRIES.filter((country) => country.code).map((country) => [country.code, country.currency]),
)
