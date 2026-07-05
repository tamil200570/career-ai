import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { BrainCircuit, LayoutDashboard, History, User, LogOut, Menu, X, Sparkles } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const navLinks = user
    ? [
        { to: '/dashboard',   label: 'Dashboard', icon: LayoutDashboard },
        { to: '/career-form', label: 'New Analysis', icon: Sparkles },
        { to: '/history',     label: 'History',   icon: History },
        { to: '/profile',     label: 'Profile',   icon: User },
      ]
    : []

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center shadow-lg shadow-brand-600/30 group-hover:shadow-brand-600/50 transition-all duration-300">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">CareerAI</span>
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-link flex items-center gap-1.5 ${isActive(to) ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  Hi, <span className="text-white font-medium">{user.name?.split(' ')[0]}</span>
                </span>
                <button onClick={handleLogout} className="btn-secondary py-2 px-4 text-sm gap-1.5">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login"    className="btn-secondary py-2 px-4 text-sm">Log In</Link>
                <Link to="/register" className="btn-primary py-2 px-4 text-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 space-y-1 border-t border-white/10 animate-slide-up">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(to) ? 'text-white bg-brand-600/30' : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { handleLogout(); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login"    onClick={() => setMenuOpen(false)} className="btn-secondary py-2 px-4 text-sm flex-1 text-center">Log In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary py-2 px-4 text-sm flex-1 text-center">Get Started</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
