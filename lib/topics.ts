// Curated topic landing pages. Each becomes a static URL — `/topics/{slug}` —
// optimized for SEO long-tail. These rank far better than `/search?q=…` because
// Google sees them as unique editorial pages, not query-string variants.

export type Topic = {
  slug: string
  title: string
  /** Plural noun phrase for headings. */
  heading: string
  /** UCP search query string. */
  query: string
  /** Optional category augment passed to searchCatalogSmart. */
  category?: string
  /** Editorial intro, ~30–50 words. Becomes the meta description + on-page copy. */
  intro: string
  /** Slugs of related topics for internal linking. */
  related: string[]
}

export const TOPICS: Topic[] = [
  {
    slug: 'running-shoes',
    title: 'Running Shoes',
    heading: 'Running Shoes on Shopify',
    query: 'running shoes',
    category: 'Footwear',
    intro:
      'The best running shoes from independent Shopify brands — road, trail, and clearance picks across every major running brand, ranked by relevance and rating.',
    related: ['sneakers', 'athletic-wear', 'yoga-gear'],
  },
  {
    slug: 'sneakers',
    title: 'Sneakers',
    heading: 'Sneakers on Shopify',
    query: 'sneakers',
    category: 'Footwear',
    intro:
      'White sneakers, leather sneakers, vintage and limited drops from indie Shopify stores. Compare prices and merchants in one place.',
    related: ['running-shoes', 'leather-boots'],
  },
  {
    slug: 'leather-wallets',
    title: 'Leather Wallets',
    heading: 'Leather Wallets on Shopify',
    query: 'leather wallet',
    category: 'Accessories',
    intro:
      'Full-grain, slim, RFID, bifold — handmade and small-batch leather wallets from independent Shopify makers around the world.',
    related: ['leather-bags', 'card-holders'],
  },
  {
    slug: 'leather-bags',
    title: 'Leather Bags',
    heading: 'Leather Bags on Shopify',
    query: 'leather bag',
    category: 'Accessories',
    intro:
      'Tote, messenger, weekender, briefcase — premium leather bags from independent leatherworkers, all on Shopify, all delivered direct from the maker.',
    related: ['leather-wallets', 'backpacks'],
  },
  {
    slug: 'card-holders',
    title: 'Card Holders',
    heading: 'Slim Card Holders on Shopify',
    query: 'card holder slim',
    category: 'Accessories',
    intro:
      'Minimalist card holders and money clips from indie Shopify stores. Leather, aluminum, carbon — the cleanest takes on everyday-carry.',
    related: ['leather-wallets'],
  },
  {
    slug: 'wireless-headphones',
    title: 'Wireless Headphones',
    heading: 'Wireless Headphones on Shopify',
    query: 'wireless headphones',
    category: 'Electronics',
    intro:
      'Over-ear and earbuds from boutique audio brands selling on Shopify. Noise-cancelling, hi-fi, and budget picks ranked by rating.',
    related: ['speakers', 'desk-accessories'],
  },
  {
    slug: 'speakers',
    title: 'Bluetooth Speakers',
    heading: 'Bluetooth Speakers on Shopify',
    query: 'bluetooth speaker',
    category: 'Electronics',
    intro:
      'Portable speakers from small Shopify-based audio brands. Compact picks for travel, home, and outdoor use.',
    related: ['wireless-headphones'],
  },
  {
    slug: 'minimalist-desk-setup',
    title: 'Minimalist Desk Setup',
    heading: 'Minimalist Desk Setup Essentials',
    query: 'minimalist desk',
    category: 'Home',
    intro:
      'Build a clean, functional workspace with curated finds from indie Shopify stores. Lamps, mats, organizers, and accessories that earn their place.',
    related: ['desk-lamps', 'desk-accessories', 'notebooks'],
  },
  {
    slug: 'desk-lamps',
    title: 'Desk Lamps',
    heading: 'Desk Lamps on Shopify',
    query: 'desk lamp',
    category: 'Home',
    intro:
      'Architect lamps, brass desk lights, Japanese-inspired lighting, and modern LED picks from independent Shopify lighting brands.',
    related: ['minimalist-desk-setup', 'home-decor'],
  },
  {
    slug: 'desk-accessories',
    title: 'Desk Accessories',
    heading: 'Desk Accessories on Shopify',
    query: 'desk accessories',
    category: 'Home',
    intro:
      'Mouse pads, monitor arms, cable organizers, desk mats — the small upgrades from small Shopify brands that make a workspace work.',
    related: ['minimalist-desk-setup', 'desk-lamps'],
  },
  {
    slug: 'notebooks',
    title: 'Notebooks & Journals',
    heading: 'Notebooks and Journals on Shopify',
    query: 'notebook journal',
    category: 'Accessories',
    intro:
      'Hardback journals, dot-grid notebooks, planners, and bullet-journals from indie stationery brands. Discover the best paper from small makers.',
    related: ['minimalist-desk-setup', 'pens'],
  },
  {
    slug: 'pens',
    title: 'Pens',
    heading: 'Premium Pens on Shopify',
    query: 'pen fountain rollerball',
    category: 'Accessories',
    intro:
      'Fountain pens, rollerballs, and machined-aluminum daily-drivers from independent Shopify pen makers.',
    related: ['notebooks', 'desk-accessories'],
  },
  {
    slug: 'coffee',
    title: 'Coffee Beans',
    heading: 'Coffee Beans on Shopify',
    query: 'coffee beans roaster',
    category: 'Food & Drink',
    intro:
      'Specialty coffee roasted by indie Shopify roasters. Single-origin, espresso, decaf, and subscriptions — direct from the roaster.',
    related: ['coffee-gear', 'tea'],
  },
  {
    slug: 'coffee-gear',
    title: 'Coffee Gear',
    heading: 'Coffee Gear on Shopify',
    query: 'coffee mug grinder espresso',
    category: 'Home',
    intro:
      'Mugs, grinders, hand-pour kettles, espresso accessories. The tools small Shopify coffee brands stake their reputation on.',
    related: ['coffee', 'kitchen'],
  },
  {
    slug: 'tea',
    title: 'Tea',
    heading: 'Tea on Shopify',
    query: 'tea loose leaf',
    category: 'Food & Drink',
    intro:
      'Loose-leaf, matcha, herbal blends, and brewing gear from indie Shopify tea purveyors.',
    related: ['coffee', 'kitchen'],
  },
  {
    slug: 'skincare',
    title: 'Skincare',
    heading: 'Skincare on Shopify',
    query: 'skincare serum moisturizer',
    category: 'Beauty',
    intro:
      'Cleansers, serums, retinoids, and sunscreens from independent Shopify skincare brands. Clean formulas, real reviews.',
    related: ['beauty', 'haircare'],
  },
  {
    slug: 'beauty',
    title: 'Beauty',
    heading: 'Beauty on Shopify',
    query: 'beauty makeup',
    category: 'Beauty',
    intro:
      'Indie cosmetics, fragrance, and color from small Shopify beauty brands. Find what big-box retailers don’t carry.',
    related: ['skincare', 'haircare'],
  },
  {
    slug: 'haircare',
    title: 'Haircare',
    heading: 'Haircare on Shopify',
    query: 'haircare shampoo',
    category: 'Beauty',
    intro:
      'Shampoo, conditioner, oils, and styling from indie Shopify haircare brands — including formulations for curls, color-treated, and fine hair.',
    related: ['skincare', 'beauty'],
  },
  {
    slug: 'candles',
    title: 'Candles',
    heading: 'Candles on Shopify',
    query: 'candle soy beeswax',
    category: 'Home',
    intro:
      'Hand-poured soy and beeswax candles from small Shopify-based candle makers. Discover scents big retailers don’t stock.',
    related: ['home-decor', 'gifts'],
  },
  {
    slug: 'home-decor',
    title: 'Home Decor',
    heading: 'Home Decor on Shopify',
    query: 'home decor',
    category: 'Home',
    intro:
      'Wall art, vases, throw pillows, and decor pieces from independent Shopify home brands. Refresh a space without going to a big-box store.',
    related: ['candles', 'desk-lamps'],
  },
  {
    slug: 'kitchen',
    title: 'Kitchen',
    heading: 'Kitchen on Shopify',
    query: 'kitchen utensil tool',
    category: 'Home',
    intro:
      'Knives, cookware, utensils, and small appliances from boutique Shopify kitchenware brands.',
    related: ['coffee-gear', 'tea'],
  },
  {
    slug: 'backpacks',
    title: 'Backpacks',
    heading: 'Backpacks on Shopify',
    query: 'backpack daypack',
    category: 'Accessories',
    intro:
      'Daypacks, travel backpacks, and work bags from independent Shopify outdoor and EDC brands.',
    related: ['leather-bags', 'outdoor'],
  },
  {
    slug: 'outdoor',
    title: 'Outdoor Gear',
    heading: 'Outdoor Gear on Shopify',
    query: 'outdoor camping hiking',
    category: 'Outdoor',
    intro:
      'Camping, hiking, climbing, and adventure gear from independent Shopify outdoor brands.',
    related: ['backpacks', 'yoga-gear'],
  },
  {
    slug: 'yoga-gear',
    title: 'Yoga Gear',
    heading: 'Yoga Gear on Shopify',
    query: 'yoga mat blocks',
    category: 'Outdoor',
    intro:
      'Mats, blocks, straps, and apparel from indie Shopify yoga brands — better quality than mass-market alternatives.',
    related: ['athletic-wear', 'running-shoes'],
  },
  {
    slug: 'athletic-wear',
    title: 'Athletic Wear',
    heading: 'Athletic Wear on Shopify',
    query: 'athletic wear performance',
    category: 'Apparel',
    intro:
      'Running, training, and yoga apparel from independent Shopify performance brands.',
    related: ['running-shoes', 'yoga-gear'],
  },
  {
    slug: 'vintage-denim',
    title: 'Vintage Denim',
    heading: 'Vintage Denim on Shopify',
    query: 'vintage denim jeans',
    category: 'Apparel',
    intro:
      'Selvedge, raw, and vintage-wash denim from small-batch Shopify denim brands.',
    related: ['athletic-wear', 'leather-boots'],
  },
  {
    slug: 'leather-boots',
    title: 'Leather Boots',
    heading: 'Leather Boots on Shopify',
    query: 'leather boots',
    category: 'Footwear',
    intro:
      'Goodyear-welted, chukka, work, and Chelsea boots from independent Shopify boot makers.',
    related: ['vintage-denim', 'leather-bags'],
  },
  {
    slug: 'gifts',
    title: 'Gifts',
    heading: 'Gift Ideas on Shopify',
    query: 'gift unique',
    intro:
      'Unique gifts from independent Shopify stores. Curated picks across categories — better than another gift card.',
    related: ['candles', 'leather-wallets', 'coffee'],
  },
]

export const TOPIC_BY_SLUG: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.slug, t]),
)

export function topicBySlug(slug: string): Topic | undefined {
  return TOPIC_BY_SLUG[slug]
}
