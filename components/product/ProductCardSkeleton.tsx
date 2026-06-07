export function ProductCardSkeleton() {
  return (
    <div className="block" aria-hidden="true">
      <div className="aspect-square bg-surface-1 rounded-xl overflow-hidden mb-3 skeleton" />
      <div className="space-y-1.5 px-0.5">
        <div className="h-4 w-4/5 skeleton rounded" />
        <div className="h-4 w-2/5 skeleton rounded" />
      </div>
    </div>
  )
}
