import { Link } from 'react-router-dom'
import { BrainCircuit, Home, ArrowLeft, Sparkles } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="orb w-64 h-64 bg-brand-600 top-10 left-1/4" />
      <div className="orb w-48 h-48 bg-accent-600 bottom-10 right-1/4" />

      <div className="text-center max-w-md relative z-10 animate-slide-up">
        <div className="text-9xl font-black gradient-text mb-4 select-none">404</div>

        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 items-center justify-center mb-6 shadow-xl shadow-brand-600/30">
          <BrainCircuit className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" id="not-found-home" className="btn-primary">
            <Home className="w-4 h-4" /> Go Home
          </Link>
          <button id="not-found-back" onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>

        <div className="mt-8 glass p-4 inline-flex items-center gap-2 text-sm text-gray-400">
          <Sparkles className="w-4 h-4 text-brand-400" />
          Try the <Link to="/career-form" className="text-brand-400 hover:text-brand-300 font-medium">Career Analysis</Link> instead
        </div>
      </div>
    </div>
  )
}
