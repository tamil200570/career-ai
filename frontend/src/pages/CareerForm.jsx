import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { recommendationService } from '../services/recommendationService'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  Sparkles, User, BookOpen, GraduationCap, Briefcase,
  Code, Heart, Target, Building2, MapPin, IndianRupee, X, Plus
} from 'lucide-react'

const SKILL_SUGGESTIONS = [
  'Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Machine Learning',
  'Data Analysis', 'Java', 'AWS', 'Docker', 'TypeScript', 'Go',
  'Rust', 'C++', 'Flutter', 'Figma', 'Excel', 'Power BI',
]

const INTEREST_SUGGESTIONS = [
  'Artificial Intelligence', 'Web Development', 'Data Science', 'Cybersecurity',
  'Cloud Computing', 'Mobile Development', 'DevOps', 'Blockchain', 'Game Development',
  'Product Management', 'UX Design', 'Finance Tech', 'Healthcare IT',
]

// Moved outside CareerForm — defined once, not re-created on every render.
function TagInput({ field, input, setInput, suggestions, placeholder, values, onAdd, onRemove, error }) {
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              onAdd(field, input, setInput)
            }
          }}
          placeholder={placeholder}
          className="input flex-1"
        />
        <button
          type="button"
          onClick={() => onAdd(field, input, setInput)}
          className="btn-secondary py-3 px-4"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {suggestions
          .filter(s => !values.includes(s))
          .slice(0, 8)
          .map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onAdd(field, s, setInput)}
              className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-brand-300 hover:border-brand-500/40 transition-all"
            >
              + {s}
            </button>
          ))}
      </div>

      {/* Tags */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {values.map(tag => (
            <span key={tag} className="chip">
              {tag}
              <button type="button" onClick={() => onRemove(field, tag)} className="hover:text-red-400">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function CareerForm() {
  const { user } = useAuth()
  const { error: toastError } = useToast()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const TOTAL_STEPS = 3

  const [form, setForm] = useState({
    name: user?.name || '',
    education: user?.education || '',
    college: '',
    cgpa: '',
    years_of_experience: user?.experience ?? '',
    skills: [],
    interests: [],
    career_goal: '',
    preferred_industry: '',
    preferred_location: '',
    expected_salary: '',
  })
  const [skillInput, setSkillInput] = useState('')
  const [interestInput, setInterestInput] = useState('')
  const [errors, setErrors] = useState({})

  // Updates a field's value AND clears any existing error for it,
  // so the red border/message disappears as soon as the user starts fixing it.
  const set = (key, val) => {
    setForm(p => ({ ...p, [key]: val }))
    setErrors(prev => {
      if (!prev[key]) return prev
      const { [key]: _, ...rest } = prev
      return rest
    })
  }

  const addTag = (field, value, setInput) => {
    const trimmed = value.trim()
    if (!trimmed) return
    if (!form[field].includes(trimmed)) {
      set(field, [...form[field], trimmed])
    }
    setInput('')
  }

  const removeTag = (field, value) => {
    set(field, form[field].filter(v => v !== value))
  }

  const validateStep = (s) => {
    const errs = {}
    if (s === 1) {
      if (!form.name)       errs.name = 'Name is required.'
      if (!form.education)  errs.education = 'Education is required.'
      if (!form.college)    errs.college = 'College is required.'
      if (!form.cgpa && form.cgpa !== 0) errs.cgpa = 'CGPA is required.'
      if (form.cgpa < 0 || form.cgpa > 10) errs.cgpa = 'CGPA must be between 0 and 10.'
      if (form.years_of_experience === '') errs.years_of_experience = 'Experience is required.'
    } else if (s === 2) {
      if (form.skills.length === 0)    errs.skills = 'Add at least one skill.'
      if (form.interests.length === 0) errs.interests = 'Add at least one interest.'
    } else if (s === 3) {
      if (!form.career_goal)         errs.career_goal = 'Career goal is required.'
      if (!form.preferred_industry)  errs.preferred_industry = 'Industry is required.'
      if (!form.preferred_location)  errs.preferred_location = 'Location is required.'
      if (!form.expected_salary)     errs.expected_salary = 'Expected salary is required.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const nextStep = () => {
    if (validateStep(step)) setStep(s => s + 1)
  }

  const prevStep = () => setStep(s => s - 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep(3)) return

    setLoading(true)
    try {
      const payload = {
        ...form,
        cgpa: parseFloat(form.cgpa),
        years_of_experience: parseInt(form.years_of_experience),
      }
      const res = await recommendationService.generate(payload)
      if (res.success) {
        navigate(`/recommendation/${res.data.id}`, { state: { rec: { id: res.data.id, ...payload, recommendation: res.data.recommendation } } })
      } else {
        toastError(res.message || 'Failed to generate recommendations.')
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to generate recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const STEP_ICONS  = [User, Code, Target]
  const STEP_LABELS = ['Personal Info', 'Skills & Interests', 'Career Goals']

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Career <span className="gradient-text">Analysis Form</span>
        </h1>
        <p className="text-gray-400">Fill in your details and let AI craft your perfect career path.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {STEP_LABELS.map((label, idx) => {
          const num = idx + 1
          const Icon = STEP_ICONS[idx]
          const done = num < step
          const active = num === step
          return (
            <div key={label} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${active ? 'text-white' : done ? 'text-emerald-400' : 'text-gray-600'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  active ? 'bg-gradient-to-br from-brand-600 to-accent-600 shadow-lg shadow-brand-600/30'
                  : done  ? 'bg-emerald-500/20 border border-emerald-500/30'
                  : 'bg-white/5 border border-white/10'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline text-sm font-medium">{label}</span>
              </div>
              {idx < STEP_LABELS.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 rounded-full ${num < step ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="glass p-8 space-y-6">
          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <div className="space-y-5 animate-slide-up">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-brand-400" /> Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} className={`input ${errors.name ? 'border-red-500' : ''}`} placeholder="John Doe" />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="label">College / University *</label>
                  <input value={form.college} onChange={e => set('college', e.target.value)} className={`input ${errors.college ? 'border-red-500' : ''}`} placeholder="MIT" />
                  {errors.college && <p className="text-red-400 text-xs mt-1">{errors.college}</p>}
                </div>
              </div>

              <div>
                <label className="label">Education Qualification *</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input value={form.education} onChange={e => set('education', e.target.value)} className={`input pl-10 ${errors.education ? 'border-red-500' : ''}`} placeholder="e.g. B.Tech Computer Science" />
                </div>
                {errors.education && <p className="text-red-400 text-xs mt-1">{errors.education}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">CGPA (0–10) *</label>
                  <input type="number" step="0.01" min="0" max="10" value={form.cgpa} onChange={e => set('cgpa', e.target.value)} className={`input ${errors.cgpa ? 'border-red-500' : ''}`} placeholder="8.5" />
                  {errors.cgpa && <p className="text-red-400 text-xs mt-1">{errors.cgpa}</p>}
                </div>
                <div>
                  <label className="label">Years of Experience *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="number" min="0" max="60" value={form.years_of_experience} onChange={e => set('years_of_experience', e.target.value)} className={`input pl-10 ${errors.years_of_experience ? 'border-red-500' : ''}`} placeholder="2" />
                  </div>
                  {errors.years_of_experience && <p className="text-red-400 text-xs mt-1">{errors.years_of_experience}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Skills & Interests ── */}
          {step === 2 && (
            <div className="space-y-6 animate-slide-up">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-400" /> Skills &amp; Interests
              </h2>

              <div>
                <label className="label">Skills * <span className="text-gray-500">(type &amp; press Enter or comma)</span></label>
                <TagInput
                  field="skills"
                  input={skillInput}
                  setInput={setSkillInput}
                  suggestions={SKILL_SUGGESTIONS}
                  placeholder="e.g. Python, React..."
                  values={form.skills}
                  onAdd={addTag}
                  onRemove={removeTag}
                  error={errors.skills}
                />
              </div>

              <div>
                <label className="label">Interests * <span className="text-gray-500">(type &amp; press Enter or comma)</span></label>
                <TagInput
                  field="interests"
                  input={interestInput}
                  setInput={setInterestInput}
                  suggestions={INTEREST_SUGGESTIONS}
                  placeholder="e.g. AI, Web Dev..."
                  values={form.interests}
                  onAdd={addTag}
                  onRemove={removeTag}
                  error={errors.interests}
                />
              </div>
            </div>
          )}

          {/* ── Step 3: Career Goals ── */}
          {step === 3 && (
            <div className="space-y-5 animate-slide-up">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-brand-400" /> Career Goals
              </h2>

              <div>
                <label className="label">Career Goal *</label>
                <div className="relative">
                  <Target className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                  <textarea
                    value={form.career_goal}
                    onChange={e => set('career_goal', e.target.value)}
                    className={`input pl-10 min-h-[90px] resize-none ${errors.career_goal ? 'border-red-500' : ''}`}
                    placeholder="e.g. Become a Machine Learning Engineer at a top tech company within 2 years"
                  />
                </div>
                {errors.career_goal && <p className="text-red-400 text-xs mt-1">{errors.career_goal}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Preferred Industry *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input value={form.preferred_industry} onChange={e => set('preferred_industry', e.target.value)} className={`input pl-10 ${errors.preferred_industry ? 'border-red-500' : ''}`} placeholder="e.g. Technology, Finance" />
                  </div>
                  {errors.preferred_industry && <p className="text-red-400 text-xs mt-1">{errors.preferred_industry}</p>}
                </div>
                <div>
                  <label className="label">Preferred Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input value={form.preferred_location} onChange={e => set('preferred_location', e.target.value)} className={`input pl-10 ${errors.preferred_location ? 'border-red-500' : ''}`} placeholder="e.g. Bengaluru, Remote" />
                  </div>
                  {errors.preferred_location && <p className="text-red-400 text-xs mt-1">{errors.preferred_location}</p>}
                </div>
              </div>

              <div>
                <label className="label">Expected Salary (₹ per year) *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input value={form.expected_salary} onChange={e => set('expected_salary', e.target.value)} className={`input pl-10 ${errors.expected_salary ? 'border-red-500' : ''}`} placeholder="e.g. ₹8,00,000 - ₹12,00,000 per year" />
                </div>
                {errors.expected_salary && <p className="text-red-400 text-xs mt-1">{errors.expected_salary}</p>}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-2">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="btn-secondary flex-1">
                ← Back
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button type="button" id={`career-form-next-${step}`} onClick={nextStep} className="btn-primary flex-1">
                Next →
              </button>
            ) : (
              <button
                id="career-form-submit"
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? (
                  <LoadingSpinner size="sm" label="Analyzing with AI..." />
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Career Recommendations</>
                )}
              </button>
            )}
          </div>

          {loading && (
            <p className="text-center text-sm text-gray-500 animate-pulse">
              Career AI is analyzing your profile... This may take 30–60 seconds.
            </p>
          )}
        </div>
      </form>
    </div>
  )
}