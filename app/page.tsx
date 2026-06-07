import { AiSearchBar } from '@/components/search/AiSearchBar'

export const metadata = {
  title: 'Scoppa — The front page of Shopify',
  alternates: { canonical: '/' },
}

// Google-style minimal home: brand + tagline + search. Nothing else.
// The whole catalog is one keystroke away.
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-48px-2rem)] px-4 sm:px-6 lg:px-8 -mt-12">
      <div className="w-full max-w-xl flex flex-col items-center">
        <h1 className="text-6xl sm:text-7xl font-bold tracking-tight text-ink mb-3 animate-fade-in">
          Scoppa
        </h1>
        <p className="text-xs text-ink-tertiary uppercase tracking-[0.25em] mb-10 animate-fade-in">
          The front page of Shopify
        </p>
        <div className="w-full animate-slide-up">
          <AiSearchBar />
        </div>
      </div>
    </div>
  )
}
