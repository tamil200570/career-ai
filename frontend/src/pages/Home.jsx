import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  BrainCircuit, Sparkles, Target, TrendingUp, Shield,
  ArrowRight, CheckCircle, Star, Zap, Globe, BookOpen
} from 'lucide-react'

const FEATURES = [
  {
    icon: BrainCircuit,
    title: 'AI-Powered Analysis',
    description: 'Google Gemini analyzes your skills, education, and goals to deliver hyper-personalized career recommendations.',
    color: 'from-brand-500 to-accent-500',
  },
  {
    icon: Target,
    title: 'Precise Match Scoring',
    description: 'Every career suggestion comes with a match percentage calculated from your complete profile.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: TrendingUp,
    title: 'Detailed Roadmaps',
    description: 'Step-by-step learning roadmaps, certifications, and project ideas for each career path.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Risk & Future Analysis',
    description: 'Understand the risks, future scope, and market demand for each career suggestion.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Globe,
    title: 'Companies Hiring',
    description: 'Discover which top companies are actively hiring for your recommended career paths.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: BookOpen,
    title: 'Interview Prep',
    description: 'Targeted interview preparation tips and strategies to land your dream role.',
    color: 'from-violet-500 to-purple-500',
  },
]

const STEPS = [
  { num: '01', title: 'Create Account', desc: 'Register with your email and basic details.' },
  { num: '02', title: 'Fill Career Form', desc: 'Provide your skills, education, and career goals.' },
  { num: '03', title: 'Get AI Analysis', desc: 'Gemini generates 5 personalized career recommendations.' },
  { num: '04', title: 'Plan Your Future', desc: 'Follow roadmaps, get certified, land your dream job.' },
]

const STATS = [
  { value: '5+', label: 'Career Paths per Analysis' },
  { value: '14', label: 'Insights per Career' },
  { value: '100%', label: 'AI-Powered' },
  { value: '∞', label: 'Re-Analyze Anytime' },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-96 h-96 bg-brand-600 top-0 left-1/4" />
      <div className="orb w-80 h-80 bg-accent-600 top-20 right-1/4" />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center text-center px-4 py-20">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-600/20 border border-brand-500/30 text-brand-300 text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            Powered by Google Gemini 2.5 Flash
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            Discover Your{' '}
            <span className="gradient-text">Perfect Career</span>
            {' '}Path with AI
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            CareerAI analyzes your skills, experience, and goals using advanced AI to deliver
            hyper-personalized career guidance — with roadmaps, certifications, and market insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/career-form" id="hero-cta-auth" className="btn-primary text-lg px-8 py-4">
                <Sparkles className="w-5 h-5" /> Start New Analysis <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" id="hero-cta-register" className="btn-primary text-lg px-8 py-4">
                  <Sparkles className="w-5 h-5" /> Get Started Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" id="hero-cta-login" className="btn-secondary text-lg px-8 py-4">
                  Log In
                </Link>
              </>
            )}
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-sm text-gray-400">Trusted by career seekers worldwide</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-white/10 bg-white/2">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-4xl font-black gradient-text mb-1">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Navigate Your Career</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              A comprehensive AI toolkit that goes beyond generic advice to deliver
              actionable, personalized career intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="glass p-6 hover:border-brand-500/40 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-white/2 border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="relative text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center mx-auto mb-4 text-white font-black text-lg shadow-lg shadow-brand-600/30">
                  {num}
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Get */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              What Each Analysis <span className="gradient-text">Includes</span>
            </h2>
          </div>

          <div className="glass p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Career title & match percentage',
                'Salary range expectations',
                'Required & missing skills',
                'Step-by-step learning roadmap',
                'Recommended certifications',
                'Useful project ideas',
                'Top companies hiring',
                'Interview preparation tips',
                'Future career scope',
                'Risk analysis',
                'Why this career fits you',
                'Overall career summary',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 relative">
        <div className="orb w-96 h-96 bg-brand-600 bottom-0 left-1/4 opacity-10" />
        <div className="max-w-3xl mx-auto text-center glass p-12 border-glow">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Find Your <span className="gradient-text">Dream Career?</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Join thousands of professionals using AI to make smarter career decisions.
          </p>
          {user ? (
            <Link to="/career-form" id="bottom-cta-auth" className="btn-primary text-lg px-10 py-4">
              <Sparkles className="w-5 h-5" /> Start Your Analysis
            </Link>
          ) : (
            <Link to="/register" id="bottom-cta-register" className="btn-primary text-lg px-10 py-4">
              <Sparkles className="w-5 h-5" /> Get Started Free — No Credit Card
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
