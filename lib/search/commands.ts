// Slash commands — power-user shortcuts that translate to search URL params
// or augment the query. Multiple commands chain in one query:
//
//   "/canada /freeshipping leather wallet"
//   → /search?q=leather+wallet+free+shipping&country=CA
//
// Commands not in the registry pass through untouched (no error).

export type SlashCommand = {
  /** The token after the slash, lowercase. */
  name: string
  /** Alternative spellings that resolve to the same command. */
  aliases?: string[]
  /** What it does in the UI dropdown. */
  description: string
  /** Group label for the dropdown. */
  group: 'Where' | 'Price & sale' | 'Sort' | 'Style & quality' | 'Audience'
  /** Words appended to the query string before submission. */
  augment?: string
  /** ISO 3166-1 alpha-2 country code → sets ?country=… */
  country?: string
  /** Sets ?maxPrice=… (USD dollars) */
  maxPrice?: number
  /** Sets ?sort=… */
  sort?: 'price-asc' | 'price-desc' | 'rating'
}

export const COMMANDS: SlashCommand[] = [
  // ─── Where ────────────────────────────────────────────────────────────────
  { name: 'us',        group: 'Where', country: 'US', description: 'Show U.S. merchants' },
  { name: 'canada',    aliases: ['ca'], group: 'Where', country: 'CA', description: 'Show Canadian merchants' },
  { name: 'uk',        aliases: ['gb', 'britain'], group: 'Where', country: 'GB', description: 'Show U.K. merchants' },
  { name: 'australia', aliases: ['aus', 'au'], group: 'Where', country: 'AU', description: 'Show Australian merchants' },
  { name: 'germany',   aliases: ['de'], group: 'Where', country: 'DE', description: 'Show German merchants' },
  { name: 'france',    aliases: ['fr'], group: 'Where', country: 'FR', description: 'Show French merchants' },
  { name: 'japan',     aliases: ['jp'], group: 'Where', country: 'JP', description: 'Show Japanese merchants' },
  { name: 'india',     aliases: ['in'], group: 'Where', country: 'IN', description: 'Show Indian merchants' },

  // ─── Shipping & origin (augments) ────────────────────────────────────────
  { name: 'freeshipping', aliases: ['freeship', 'shipfree'], group: 'Where', augment: 'free shipping', description: 'Free shipping' },
  { name: 'madeinusa',    aliases: ['madeinamerica'],        group: 'Where', augment: 'made in usa', description: 'Made in the USA' },
  { name: 'madeincanada',                                     group: 'Where', augment: 'made in canada', description: 'Made in Canada' },
  { name: 'shipsfast',    aliases: ['fastship', 'sameday'],  group: 'Where', augment: 'ships fast', description: 'Quick ship' },

  // ─── Price & sale ────────────────────────────────────────────────────────
  { name: 'sale',       group: 'Price & sale', augment: 'sale',       description: 'On sale right now' },
  { name: 'clearance',  group: 'Price & sale', augment: 'clearance',  description: 'Clearance items' },
  { name: 'discount',   aliases: ['onsale'], group: 'Price & sale', augment: 'discount', description: 'Discounted' },
  { name: 'deal',       aliases: ['deals'], group: 'Price & sale', augment: 'deal', description: 'Best deals' },
  { name: '50off',      aliases: ['half', 'halfoff'], group: 'Price & sale', augment: '50% off', description: 'Half off' },
  { name: 'budget',     group: 'Price & sale', augment: 'budget', maxPrice: 50, description: 'Budget picks (≤ $50)' },
  { name: 'under25',    group: 'Price & sale', maxPrice: 25,  description: 'Under $25' },
  { name: 'under50',    group: 'Price & sale', maxPrice: 50,  description: 'Under $50' },
  { name: 'under100',   group: 'Price & sale', maxPrice: 100, description: 'Under $100' },
  { name: 'under200',   group: 'Price & sale', maxPrice: 200, description: 'Under $200' },
  { name: 'under500',   group: 'Price & sale', maxPrice: 500, description: 'Under $500' },
  { name: 'luxury',     aliases: ['highend'], group: 'Price & sale', augment: 'luxury', description: 'High-end picks' },

  // ─── Sort ────────────────────────────────────────────────────────────────
  { name: 'cheapest',   aliases: ['cheap', 'lowtohigh'], group: 'Sort', sort: 'price-asc',  description: 'Lowest price first' },
  { name: 'priciest',   aliases: ['expensive', 'hightolow'], group: 'Sort', sort: 'price-desc', description: 'Highest price first' },
  { name: 'toprated',   aliases: ['bestrated', 'highrated'], group: 'Sort', sort: 'rating', description: 'Best-rated first' },

  // ─── Style & quality ─────────────────────────────────────────────────────
  { name: 'handmade',     aliases: ['handcrafted', 'artisan'], group: 'Style & quality', augment: 'handmade', description: 'Handmade / artisan' },
  { name: 'organic',                                            group: 'Style & quality', augment: 'organic', description: 'Organic' },
  { name: 'sustainable',  aliases: ['eco', 'ecofriendly'],      group: 'Style & quality', augment: 'sustainable', description: 'Sustainable / eco' },
  { name: 'vegan',                                              group: 'Style & quality', augment: 'vegan', description: 'Vegan' },
  { name: 'vintage',      aliases: ['retro', 'antique'],        group: 'Style & quality', augment: 'vintage', description: 'Vintage / retro' },
  { name: 'new',          aliases: ['newarrival', 'newin'],     group: 'Style & quality', augment: 'new arrival', description: 'New arrivals' },
  { name: 'bestseller',   aliases: ['popular'],                 group: 'Style & quality', augment: 'bestseller', description: 'Bestsellers' },
  { name: 'trending',                                           group: 'Style & quality', augment: 'trending', description: 'Trending now' },
  { name: 'minimalist',   aliases: ['minimal'],                 group: 'Style & quality', augment: 'minimalist', description: 'Minimalist style' },
  { name: 'modern',                                             group: 'Style & quality', augment: 'modern', description: 'Modern style' },
  { name: 'premium',                                            group: 'Style & quality', augment: 'premium', description: 'Premium quality' },

  // ─── Audience ────────────────────────────────────────────────────────────
  { name: 'mens',  aliases: ['men'],   group: 'Audience', augment: 'men', description: "Men's" },
  { name: 'womens', aliases: ['women'], group: 'Audience', augment: 'women', description: "Women's" },
  { name: 'kids',  aliases: ['child', 'children'], group: 'Audience', augment: 'kids', description: "Kids'" },
  { name: 'unisex',                                 group: 'Audience', augment: 'unisex', description: 'Unisex' },
  { name: 'gift',  aliases: ['gifts'],              group: 'Audience', augment: 'gift', description: 'Gift ideas' },
]

// Build a fast lookup of name+aliases → command
const COMMAND_INDEX: Map<string, SlashCommand> = (() => {
  const m = new Map<string, SlashCommand>()
  for (const cmd of COMMANDS) {
    m.set(cmd.name, cmd)
    for (const alias of cmd.aliases ?? []) m.set(alias, cmd)
  }
  return m
})()

export function findCommand(token: string): SlashCommand | undefined {
  return COMMAND_INDEX.get(token.toLowerCase().replace(/^\/+/, ''))
}

/** Match commands by prefix for autocomplete. */
export function searchCommands(prefix: string, max = 8): SlashCommand[] {
  const clean = prefix.toLowerCase().replace(/^\/+/, '')
  if (!clean) return COMMANDS.slice(0, max)
  const out: SlashCommand[] = []
  for (const cmd of COMMANDS) {
    const names = [cmd.name, ...(cmd.aliases ?? [])]
    if (names.some((n) => n.startsWith(clean))) {
      out.push(cmd)
      if (out.length >= max) break
    }
  }
  return out
}

export type ParsedSearch = {
  query: string
  country?: string
  maxPrice?: string
  sort?: 'price-asc' | 'price-desc' | 'rating'
}

/**
 * Parse a raw search string with optional slash commands. Returns the cleaned
 * query plus URL params extracted from the commands. Unknown tokens are
 * left in the query as-is.
 *
 * Example:
 *   parseSearch("/canada /freeshipping leather wallet /under100")
 *   → { query: "leather wallet free shipping", country: "CA", maxPrice: "100" }
 */
export function parseSearch(input: string): ParsedSearch {
  const out: ParsedSearch = { query: '' }
  const remaining: string[] = []
  const augments: string[] = []

  for (const token of input.trim().split(/\s+/).filter(Boolean)) {
    if (!token.startsWith('/')) {
      remaining.push(token)
      continue
    }
    const cmd = findCommand(token)
    if (!cmd) {
      // Unknown slash token — keep it visible so the user sees their typo.
      remaining.push(token)
      continue
    }
    if (cmd.country) out.country = cmd.country
    if (cmd.maxPrice != null) out.maxPrice = String(cmd.maxPrice)
    if (cmd.sort) out.sort = cmd.sort
    if (cmd.augment) augments.push(cmd.augment)
  }

  out.query = [...remaining, ...augments].join(' ').trim()
  return out
}

/** Build the canonical /search URL from a parsed search. */
export function buildSearchUrl(parsed: ParsedSearch): string {
  const params = new URLSearchParams()
  if (parsed.query) params.set('q', parsed.query)
  if (parsed.country) params.set('country', parsed.country)
  if (parsed.maxPrice) params.set('maxPrice', parsed.maxPrice)
  if (parsed.sort) params.set('sort', parsed.sort)
  return `/search?${params.toString()}`
}
