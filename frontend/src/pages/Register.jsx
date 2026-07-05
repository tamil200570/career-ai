import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { authService } from '../services/authService'
import {
  BrainCircuit,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  Briefcase,
  ArrowRight,
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

function Field({
  id,
  label,
  type = 'text',
  icon: Icon,
  placeholder,
  field,
  autoComplete,
  form,
  setForm,
  errors,
}) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>

      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={form[field]}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              [field]: e.target.value,
            }))
          }
          className={`input pl-10 ${errors[field] ? 'border-red-500' : ''}`}
        />
      </div>

      {errors[field] && (
        <p className="text-red-400 text-xs mt-1">{errors[field]}</p>
      )}
    </div>
  )
}

export default function Register() {
  const { login } = useAuth()
  const { success, error: toastError } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    education: '',
    experience: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}

    if (!form.name || form.name.length < 2)
      errs.name = 'Name must be at least 2 characters.'

    if (!form.email)
      errs.email = 'Email is required.'

    if (!form.password || form.password.length < 8)
      errs.password = 'Password must be at least 8 characters.'

    else if (!/[A-Z]/.test(form.password))
      errs.password = 'Password must contain an uppercase letter.'

    else if (!/\d/.test(form.password))
      errs.password = 'Password must contain a digit.'

    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.'

    setErrors(errs)

    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        education: form.education || undefined,
        experience: form.experience
          ? parseInt(form.experience)
          : undefined,
      }

      const res = await authService.register(payload)

      if (res.success) {
        login(res.data.token, res.data.user)

        success('Account created! Welcome to CareerAI 🎉')

        navigate('/career-form')
      } else {
        toastError(res.message || 'Registration failed.')
      }
    } catch (err) {
      toastError(
        err.response?.data?.message ||
          'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="orb w-64 h-64 bg-brand-600 top-10 right-10" />
      <div className="orb w-48 h-48 bg-accent-600 bottom-10 left-10" />

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 items-center justify-center mb-4 shadow-xl shadow-brand-600/30">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white">
            Create your account
          </h1>

          <p className="text-gray-400 mt-2">
            Start your AI-powered career journey today
          </p>
        </div>

        <div className="glass p-8">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5"
          >
            <Field
              id="reg-name"
              label="Full Name"
              icon={User}
              placeholder="John Doe"
              field="name"
              autoComplete="name"
              form={form}
              setForm={setForm}
              errors={errors}
            />

            <Field
              id="reg-email"
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="you@example.com"
              field="email"
              autoComplete="email"
              form={form}
              setForm={setForm}
              errors={errors}
            />

            <Field
              id="reg-education"
              label="Education (optional)"
              icon={BookOpen}
              placeholder="e.g. B.Tech Computer Science"
              field="education"
              autoComplete="off"
              form={form}
              setForm={setForm}
              errors={errors}
            />

            <Field
              id="reg-experience"
              label="Years of Experience (optional)"
              icon={Briefcase}
              type="number"
              placeholder="e.g. 2"
              field="experience"
              autoComplete="off"
              form={form}
              setForm={setForm}
              errors={errors}
            />

            <div>
              <label htmlFor="reg-password" className="label">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 8 chars, 1 uppercase, 1 digit"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className={`input pl-10 pr-10 ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="reg-confirm-password"
                className="label"
              >
                Confirm Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                <input
                  id="reg-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className={`input pl-10 ${
                    errors.confirmPassword ? 'border-red-500' : ''
                  }`}
                />
              </div>

              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? (
                <LoadingSpinner size="sm" label="" />
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}