import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ProgressBar from '../components/ProgressBar'
import {
  TrendingUp, Code, BookOpen, Award, Lightbulb,
  Building2, MessageSquare, Globe2, AlertTriangle, FileText,
  ArrowLeft, CheckCircle, XCircle, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react'

function Section({ icon: Icon, title, color = 'text-brand-400', children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="glass p-5">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full mb-3"
      >
        <h3 className={`font-semibold flex items-center gap-2 ${color}`}>
          <Icon className="w-4 h-4" /> {title}
        </h3>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && children}
    </div>
  )
}

function TagList({ items = [], chipClass = '' }) {
  if (!items.length) return <p className="text-sm text-gray-500 italic">None listed.</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`chip text-xs py-0.5 ${chipClass}`}>{item}</span>
      ))}
    </div>
  )
}

function BulletList({ items = [] }) {
  if (!items.length) return <p className="text-sm text-gray-500 italic">None listed.</p>
  return (
    <ol className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
          <span className="shrink-0 w-5 h-5 rounded-full bg-brand-600/30 text-brand-300 flex items-center justify-center text-xs font-bold mt-0.5">
            {i + 1}
          </span>
          {item}
        </li>
      ))}
    </ol>
  )
}

function CareerDetail({ career, index }) {
  const [expanded, setExpanded] = useState(index === 0)

  return (
    <div className="glass border border-white/10 hover:border-brand-500/30 transition-all duration-300">
      {/* Career Header */}
      <button
        type="button"
        onClick={() => setExpanded(o => !o)}
        className="w-full p-5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center text-white font-bold shrink-0">
            {index + 1}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{career.careerTitle}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-400 mt-0.5">
              <span className="flex items-center gap-1">{career.salaryRange}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-2xl font-black gradient-text">{career.matchPercentage}%</div>
            <div className="text-xs text-gray-500">match</div>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      <div className="px-5 pb-1">
        <ProgressBar value={career.matchPercentage} showLabel={false} />
      </div>

      {expanded && (
        <div className="p-5 space-y-4 border-t border-white/10 animate-slide-up">
          {/* Reason */}
          <div className="bg-brand-600/10 border border-brand-500/20 rounded-xl p-4">
            <p className="text-sm text-gray-300 leading-relaxed">{career.reason}</p>
          </div>

          {/* Summary */}
          <Section icon={FileText} title="Summary" color="text-blue-400">
            <p className="text-sm text-gray-300 leading-relaxed">{career.summary}</p>
          </Section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Required Skills */}
            <Section icon={CheckCircle} title="Required Skills" color="text-emerald-400">
              <TagList items={career.requiredSkills} chipClass="!bg-emerald-500/15 !border-emerald-500/25 !text-emerald-300" />
            </Section>

            {/* Missing Skills */}
            <Section icon={XCircle} title="Skills to Acquire" color="text-red-400">
              <TagList items={career.missingSkills} chipClass="!bg-red-500/15 !border-red-500/25 !text-red-300" />
            </Section>
          </div>

          {/* Learning Roadmap */}
          <Section icon={BookOpen} title="Learning Roadmap" color="text-amber-400">
            <BulletList items={career.learningRoadmap} />
          </Section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Certifications */}
            <Section icon={Award} title="Recommended Certifications" color="text-purple-400">
              <TagList items={career.recommendedCertifications} chipClass="!bg-purple-500/15 !border-purple-500/25 !text-purple-300" />
            </Section>

            {/* Projects */}
            <Section icon={Lightbulb} title="Useful Projects" color="text-yellow-400">
              <BulletList items={career.usefulProjects} />
            </Section>
          </div>

          {/* Companies */}
          <Section icon={Building2} title="Companies Hiring" color="text-cyan-400">
            <TagList items={career.companiesHiring} chipClass="!bg-cyan-500/15 !border-cyan-500/25 !text-cyan-300" />
          </Section>

          {/* Interview Tips */}
          <Section icon={MessageSquare} title="Interview Preparation Tips" color="text-indigo-400">
            <BulletList items={career.interviewPreparationTips} />
          </Section>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Future Scope */}
            <Section icon={Globe2} title="Future Scope" color="text-teal-400">
              <p className="text-sm text-gray-300 leading-relaxed">{career.futureScope}</p>
            </Section>

            {/* Risk Analysis */}
            <Section icon={AlertTriangle} title="Risk Analysis" color="text-orange-400">
              <p className="text-sm text-gray-300 leading-relaxed">{career.riskAnalysis}</p>
            </Section>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RecommendationPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()
  const rec = state?.rec

  if (!rec || !rec.recommendation?.careers) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Sparkles className="w-12 h-12 text-brand-400 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2">No recommendation data found.</h2>
        <p className="text-gray-400 mb-6">Please generate a new career analysis.</p>
        <button onClick={() => navigate('/career-form')} className="btn-primary">
          New Analysis
        </button>
      </div>
    )
  }

  const { careers } = rec.recommendation
  const top = careers[0]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="glass p-8 text-center relative overflow-hidden">
        <div className="orb w-48 h-48 bg-brand-600 top-0 left-1/4 opacity-20" />
        <Sparkles className="w-8 h-8 text-brand-400 mx-auto mb-3" />
        <h1 className="text-3xl font-bold text-white mb-2">
          Your Career <span className="gradient-text">Recommendations</span>
        </h1>
        <p className="text-gray-400 mb-6">
          Personalized analysis for <strong className="text-white">{rec.name}</strong> — {careers.length} career paths generated
        </p>

        {/* Top Match Highlight */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600/30 to-accent-600/30 border border-brand-500/30">
          <TrendingUp className="w-5 h-5 text-brand-400" />
          <div>
            <div className="text-sm text-gray-400">Top Career Match</div>
            <div className="font-bold text-white">{top.careerTitle}</div>
          </div>
          <div className="text-3xl font-black gradient-text">{top.matchPercentage}%</div>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Goal',      value: rec.career_goal?.slice(0, 30) + (rec.career_goal?.length > 30 ? '...' : '') },
          { label: 'Industry',  value: rec.preferred_industry },
          { label: 'Location',  value: rec.preferred_location },
          { label: 'Salary',    value: rec.expected_salary },
        ].map(({ label, value }) => (
          <div key={label} className="glass p-4 text-center">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="text-sm font-medium text-gray-200">{value}</div>
          </div>
        ))}
      </div>

      {/* Career Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-400" /> Top Career Paths
        </h2>
        {careers.map((career, i) => (
          <CareerDetail key={i} career={career} index={i} />
        ))}
      </div>
    </div>
  )
}