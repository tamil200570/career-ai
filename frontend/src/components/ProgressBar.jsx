/**
 * Animated progress bar with gradient fill and percentage label.
 */
export default function ProgressBar({ value = 0, label = '', showLabel = true, colorClass = '' }) {
  const clamped = Math.max(0, Math.min(100, value))

  // Pick color based on value if not overridden
  const defaultColor =
    clamped >= 80 ? 'from-emerald-500 to-teal-500'
    : clamped >= 60 ? 'from-brand-500 to-accent-500'
    : clamped >= 40 ? 'from-amber-500 to-orange-500'
    : 'from-red-500 to-rose-500'

  const gradient = colorClass || defaultColor

  return (
    <div className="w-full">
      {(label || showLabel) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-gray-300">{label}</span>}
          {showLabel && (
            <span className="text-sm font-bold text-white">{clamped}%</span>
          )}
        </div>
      )}
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
