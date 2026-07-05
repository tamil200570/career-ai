import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { recommendationService } from '../services/recommendationService'
import { SkeletonDashboard } from '../components/SkeletonLoader'
import CareerCard from '../components/CareerCard'
import ProgressBar from '../components/ProgressBar'
import { useToast } from '../hooks/useToast'
import {
  Sparkles, History, User, TrendingUp, BookOpen,
  Award, ArrowRight, Briefcase, Target
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { error: toastError } = useToast()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await recommendationService.getHistory({ page: 1, limit: 5 })
        if (res.success) setHistory(res.data.records)
      } catch {
        toastError('Could not load history.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <SkeletonDashboard />

  const latest = history[0] || null
  const topCareers = latest?.recommendation?.careers?.slice(0, 3) || []
  const avgMatch = topCareers.length
    ? Math.round(topCareers.reduce((s, c) => s + c.matchPercentage, 0) / topCareers.length)
    : 0

  const skills = user?.skills?.length ? user.skills : (latest?.skills || [])
  const certs  = topCareers.flatMap(c => c.recommendedCertifications || []).slice(0, 4)

  const STATS = [
    { icon: History,   label: 'Total Analyses',  value: history.length,              color: 'from-brand-500 to-accent-500' },
    { icon: Target,    label: 'Avg Match Score',  value: avgMatch ? `${avgMatch}%` : '—', color: 'from-emerald-500 to-teal-500' },
    { icon: BookOpen,  label: 'Skills Tracked',   value: skills.length,               color: 'from-amber-500 to-orange-500' },
    { icon: Award,     label: 'Cert Suggestions', value: certs.length,                color: 'from-pink-500 to-rose-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-400 mt-1">Here's your career intelligence overview.</p>
        </div>
        <Link to="/career-form" id="dashboard-new-analysis" className="btn-primary">
          <Sparkles className="w-4 h-4" /> New Analysis
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass p-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Recommendation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-400" /> Latest Career Match
            </h2>
            <Link to="/history" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latest ? (
            <div className="glass p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Goal: <span className="text-gray-300">{latest.career_goal}</span></p>
                  <p className="text-sm text-gray-500">Industry: <span className="text-gray-300">{latest.preferred_industry}</span></p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black gradient-text">{topCareers[0]?.matchPercentage ?? '--'}%</div>
                  <div className="text-xs text-gray-500">top match</div>
                </div>
              </div>

              {topCareers.map((career, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300 font-medium">{career.careerTitle}</span>
                    <span className="text-brand-400 font-bold">{career.matchPercentage}%</span>
                  </div>
                  <ProgressBar value={career.matchPercentage} showLabel={false} />
                </div>
              ))}

              <Link
                to={`/recommendation/${latest.id}`}
                state={{ rec: latest }}
                id="dashboard-view-latest"
                className="btn-primary w-full mt-2"
              >
                View Full Report <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="glass p-12 text-center">
              <Sparkles className="w-12 h-12 text-brand-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400 mb-4">No career analysis yet. Generate your first one!</p>
              <Link to="/career-form" id="dashboard-first-analysis" className="btn-primary">
                Start Analysis
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Profile Summary */}
          <div className="glass p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-400" /> Profile Summary
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { label: 'Name',       value: user?.name },
                { label: 'Education',  value: user?.education  || '—' },
                { label: 'Experience', value: user?.experience != null ? `${user.experience} yrs` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-200 font-medium truncate max-w-[60%] text-right">{value}</span>
                </div>
              ))}
            </div>
            <Link to="/profile" id="dashboard-edit-profile" className="btn-secondary w-full mt-4 text-sm py-2">
              Edit Profile
            </Link>
          </div>

          {/* Skills */}
          <div className="glass p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand-400" /> Skills Overview
            </h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 10).map(s => (
                  <span key={s} className="chip text-xs py-0.5">{s}</span>
                ))}
                {skills.length > 10 && (
                  <span className="chip text-xs py-0.5">+{skills.length - 10}</span>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Add skills in your profile or career form.</p>
            )}
          </div>

          {/* Certifications */}
          {certs.length > 0 && (
            <div className="glass p-5">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-400" /> Recommended Certifications
              </h3>
              <ul className="space-y-2">
                {certs.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="text-brand-400 mt-0.5">✦</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Recent History */}
      {history.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-brand-400" /> Recent Analyses
            </h2>
            <Link to="/history" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.slice(1, 4).map(rec => (
              <CareerCard key={rec.id} rec={rec} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
