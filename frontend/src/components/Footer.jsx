import { Link } from 'react-router-dom'
import { BrainCircuit, Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gray-950/60 backdrop-blur-xl mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold gradient-text">CareerAI</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI-powered career guidance platform using Google Gemini to deliver personalized career path recommendations.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/',           label: 'Home' },
                { to: '/dashboard',  label: 'Dashboard' },
                { to: '/career-form', label: 'Career Analysis' },
                { to: '/history',    label: 'History' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-500 hover:text-brand-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-4">Connect</h4>
            <div className="flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-brand-400 hover:border-brand-500/40 hover:bg-brand-600/10 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} CareerAI. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Powered by <span className="text-brand-400">Google Gemini</span> · Built with{' '}
            <span className="text-brand-400">FastAPI</span> &amp;{' '}
            <span className="text-brand-400">React</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
