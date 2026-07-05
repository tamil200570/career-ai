import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'
import { TrendingUp, MapPin, DollarSign, ArrowRight, Trash2 } from 'lucide-react'

/**
 * Card component for a single career recommendation summary.
 * Used in Dashboard and History pages.
 */
export default function CareerCard({ rec, onDelete, compact = false }) {
  const navigate = useNavigate()
  const careers  = rec?.recommendation?.careers || []
  const topMatch = careers[0] || null

  const handleView = () => navigate(`/recommendation/${rec.id}`, { state: { rec } })

  return (
    <div className="glass p-5 hover:border-brand-500/40 hover:bg-white/8 transition-all duration-300 group">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate group-hover:text-brand-300 transition-colors">
            {rec.career_goal || 'Career Analysis'}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {rec.preferred_location}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> {rec.expected_salary}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold gradient-text">
            {topMatch?.matchPercentage ?? '--'}%
          </div>
          <div className="text-xs text-gray-500">top match</div>
        </div>
      </div>

      {topMatch && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            <span className="text-sm font-medium text-gray-200">{topMatch.careerTitle}</span>
          </div>
          <ProgressBar value={topMatch.matchPercentage} showLabel={false} />
        </div>
      )}

      {!compact && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(rec.skills || []).slice(0, 4).map((skill) => (
            <span key={skill} className="chip text-xs py-0.5">{skill}</span>
          ))}
          {(rec.skills || []).length > 4 && (
            <span className="chip text-xs py-0.5">+{rec.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          id={`view-rec-${rec.id}`}
          onClick={handleView}
          className="btn-primary py-2 px-4 text-sm flex-1"
        >
          View Details <ArrowRight className="w-3.5 h-3.5" />
        </button>
        {onDelete && (
          <button
            id={`delete-rec-${rec.id}`}
            onClick={() => onDelete(rec.id)}
            className="btn-danger py-2 px-3"
            title="Delete recommendation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
