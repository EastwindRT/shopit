'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-lg font-semibold mb-3">Something went wrong</h2>
      <p className="text-sm text-ink-secondary mb-6 max-w-sm">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-ink text-white text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
