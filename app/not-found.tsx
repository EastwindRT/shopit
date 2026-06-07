import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-xs font-medium text-ink-tertiary uppercase tracking-widest mb-4">404</p>
      <h1 className="text-2xl font-semibold mb-3">Page not found</h1>
      <p className="text-sm text-ink-secondary mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-ink text-white text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors"
      >
        Go home
      </Link>
    </div>
  )
}
