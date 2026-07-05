export default function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
    xl: 'w-16 h-16 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-label={label}>
      <div
        className={`${sizes[size]} rounded-full border-brand-600 border-t-transparent animate-spin`}
      />
      {label && <p className="text-sm text-gray-400 animate-pulse">{label}</p>}
    </div>
  )
}

export function FullPageSpinner({ label = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 backdrop-blur-sm">
      <LoadingSpinner size="xl" label={label} />
    </div>
  )
}
