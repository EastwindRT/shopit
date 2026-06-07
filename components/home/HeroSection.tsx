export function HeroSection() {
  return (
    <section
      className="px-4 sm:px-6 lg:px-8 pt-16 pb-6 max-w-3xl mx-auto text-center"
      aria-labelledby="scoppa-heading"
    >
      <p className="text-[10px] font-medium text-ink-tertiary uppercase tracking-[0.2em] mb-4 animate-fade-in">
        The front page of Shopify
      </p>
      <h1
        id="scoppa-heading"
        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.02] mb-4 animate-slide-up"
      >
        Scoppa
        <span className="block text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink-secondary mt-3">
          Every Shopify store. One search.
        </span>
      </h1>
      <p className="text-sm text-ink-secondary max-w-md mx-auto animate-slide-up text-balance">
        Search the entire Shopify catalog in plain language — thousands of independent
        merchants, one place to find what you want.
      </p>
    </section>
  )
}
