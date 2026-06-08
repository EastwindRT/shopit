// Long-form editorial content. These rank for high-intent buying queries and
// convert better than topic pages because they include opinionated picks +
// affiliate-tracked product links.

export type Article = {
  slug: string
  title: string
  dek: string
  /** Author display name. */
  author: string
  /** ISO 8601 published date. */
  published: string
  /** Reading time, e.g. "6 min read". */
  readingTime: string
  /** UCP query strings to surface live products inline. */
  productQueries: string[]
  /** Article body as plain text paragraphs (one per array element). */
  body: { type: 'h2' | 'p'; text: string }[]
}

export const ARTICLES: Article[] = [
  {
    slug: 'best-shopify-coffee-roasters-2026',
    title: 'The best independent Shopify coffee roasters in 2026',
    dek: 'Specialty coffee is one of Shopify’s strongest niches. Here are the indie roasters worth ordering from this year.',
    author: 'Scoppa Editorial',
    published: '2026-06-07',
    readingTime: '6 min read',
    productQueries: ['coffee beans single origin', 'espresso roast'],
    body: [
      {
        type: 'p',
        text: 'Specialty coffee thrives on Shopify because the platform lets a small roaster sell direct without surrendering 30% of margin to a marketplace. The result: hundreds of micro-roasters shipping fresh beans from farms they personally source.',
      },
      {
        type: 'p',
        text: 'Below is a snapshot of what’s actually available on Shopify right now, pulled live via the Universal Commerce Protocol. Pricing, availability, and reviews are real. Every checkout happens directly on the roaster’s own Shopify store.',
      },
      {
        type: 'h2',
        text: 'Why buy from indie Shopify roasters instead of a big brand',
      },
      {
        type: 'p',
        text: 'Beans are perishable. A bag that has sat on a grocery shelf for three months is staler than a bag roasted last week and shipped overnight. Small Shopify roasters typically roast-to-order and ship within 48 hours.',
      },
      {
        type: 'p',
        text: 'You also get traceability. Most indie roasters list the farm, varietal, and processing method on every bag — info that big roasters often don’t bother with.',
      },
      {
        type: 'h2',
        text: 'How to use the picks below',
      },
      {
        type: 'p',
        text: 'The grid pulls in live single-origin and espresso roasts available across Shopify. Click any product to see variants, ratings, and the merchant. Checkout happens directly on the roaster’s own site.',
      },
    ],
  },
  {
    slug: 'minimalist-desk-setup-shopify',
    title: '12 minimalist desk essentials from indie Shopify stores',
    dek: 'A clean, focused workspace doesn’t need a CB2 budget. Here’s where to find the pieces that matter.',
    author: 'Scoppa Editorial',
    published: '2026-06-07',
    readingTime: '8 min read',
    productQueries: ['minimalist desk', 'desk lamp', 'desk organizer'],
    body: [
      {
        type: 'p',
        text: 'The minimalist desk setup aesthetic has been done to death on YouTube — but the gear underneath it doesn’t need to come from the same five Amazon brands every creator features.',
      },
      {
        type: 'p',
        text: 'Independent Shopify stores stock most of what makes those setups work: leather mouse pads, brass desk lamps, walnut monitor risers, cable trays that don’t scream Amazon Basics. Below are live picks from indie merchants.',
      },
      {
        type: 'h2',
        text: 'Start with the lamp',
      },
      {
        type: 'p',
        text: 'A single warm-temperature desk lamp does more for a workspace than any wallpaper change. Architect arms, Japanese paper shades, and brass swing-arms are all over Shopify at half the price of the design-blog favorites.',
      },
      {
        type: 'h2',
        text: 'Then the surface',
      },
      {
        type: 'p',
        text: 'A leather or felt desk mat unifies a setup faster than anything else. Look for full-grain leather above 3mm thick — anything thinner curls.',
      },
      {
        type: 'h2',
        text: 'And the accessories',
      },
      {
        type: 'p',
        text: 'Pen cups, monitor risers, cable trays — the picks below are pulled live from Shopify’s catalog. Sort by price or rating in the search to refine.',
      },
    ],
  },
  {
    slug: 'where-to-find-unique-gifts-shopify',
    title: 'Where to find unique gifts: 8 Shopify categories worth browsing',
    dek: 'Tired of gift-card-as-default? These Shopify categories surface things people actually want.',
    author: 'Scoppa Editorial',
    published: '2026-06-07',
    readingTime: '5 min read',
    productQueries: ['unique gift', 'leather wallet', 'candle handmade'],
    body: [
      {
        type: 'p',
        text: 'Gift-buying gets harder as the recipients in your life accumulate stuff. The fix isn’t spending more — it’s shopping in places that stock things mass retailers don’t.',
      },
      {
        type: 'p',
        text: 'Shopify hosts the long tail of consumer goods: indie candle makers, leatherworkers, ceramic studios, tea purveyors. Here are eight categories that overdeliver on gift-worthiness.',
      },
      {
        type: 'h2',
        text: '1. Handmade leather goods',
      },
      {
        type: 'p',
        text: 'A small-batch leather wallet from a Shopify maker, embossed with initials, will outlive a department-store equivalent by a decade. Leather card holders, key fobs, and notebook covers travel the same path.',
      },
      {
        type: 'h2',
        text: '2. Single-origin coffee or tea',
      },
      {
        type: 'p',
        text: 'A 12-oz bag of freshly-roasted single-origin coffee is a $20 gift that arrives at peak freshness. Tea works similarly — loose-leaf, properly stored, from a roaster who can name the farm.',
      },
      {
        type: 'h2',
        text: '3. Hand-poured candles',
      },
      {
        type: 'p',
        text: 'Almost all Yankee-Candle-grade candles ship from the same three factories. The Shopify candle ecosystem is the opposite: small studios, soy or beeswax, scents big retailers won’t risk stocking.',
      },
      {
        type: 'h2',
        text: 'Live picks below',
      },
      {
        type: 'p',
        text: 'The grid shows real products from indie Shopify merchants matching gift-worthy queries. Filter by country if you need fast shipping or by category to focus.',
      },
    ],
  },
]

export const ARTICLE_BY_SLUG: Record<string, Article> = Object.fromEntries(
  ARTICLES.map((a) => [a.slug, a]),
)

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLE_BY_SLUG[slug]
}
