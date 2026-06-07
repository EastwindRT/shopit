const POPULAR_SUFFIXES = [
  'under $50',
  'under $100',
  'for gifts',
  'best sellers',
  'made in USA',
]

const INTENT_SUGGESTIONS: Record<string, string[]> = {
  shoe: ['running shoes under $100', 'trail running shoes', 'white sneakers'],
  shoes: ['running shoes under $100', 'trail running shoes', 'white sneakers'],
  sneaker: ['white sneakers', 'leather sneakers', 'running sneakers'],
  desk: ['minimalist desk setup', 'ergonomic desk accessories', 'desk lamp'],
  coffee: ['organic coffee beans', 'espresso beans', 'cold brew coffee'],
  skincare: ['organic skincare', 'vitamin c serum', 'daily moisturizer'],
  headphone: ['wireless headphones under $100', 'noise cancelling headphones', 'earbuds'],
  headphones: ['wireless headphones under $100', 'noise cancelling headphones', 'earbuds'],
  wallet: ['leather wallet', 'slim card holder', 'wallet gift'],
}

export function getSearchSuggestions(query: string): string[] {
  const cleaned = query.trim().replace(/\s+/g, ' ')
  if (!cleaned) return []

  const lower = cleaned.toLowerCase()
  const words = lower.split(' ')
  const matched = words.flatMap((word) => INTENT_SUGGESTIONS[word] ?? [])
  const suffixes = POPULAR_SUFFIXES.map((suffix) => `${cleaned} ${suffix}`)

  return unique([cleaned, ...matched, ...suffixes])
    .filter((suggestion) => suggestion.toLowerCase() !== lower || matched.length === 0)
    .slice(0, 6)
}

function unique(values: string[]): string[] {
  return [...new Set(values)]
}
