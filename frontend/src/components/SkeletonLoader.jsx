/**
 * Skeleton loader blocks for content placeholders while data fetches.
 */
export function SkeletonBlock({ className = '' }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-xl ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="glass p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-3/4" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonBlock className="h-3 w-full" />
      <SkeletonBlock className="h-3 w-4/5" />
      <SkeletonBlock className="h-3 w-2/3" />
      <div className="flex gap-2">
        <SkeletonBlock className="h-6 w-16 rounded-full" />
        <SkeletonBlock className="h-6 w-20 rounded-full" />
        <SkeletonBlock className="h-6 w-14 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <SkeletonBlock className="h-8 w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array(count).fill(0).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
