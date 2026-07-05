import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { profileService } from '../services/profileService'
import LoadingSpinner from '../components/LoadingSpinner'
import { User, Mail, BookOpen, Briefcase, Lock, Code, Save, Plus, X, Eye, EyeOff } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { success, error: toastError } = useToast()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const [form, setForm] = useState({ name: '', education: '', experience: '', bio: '', skills: [] })
  const [skillInput, setSkillInput] = useState('')

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [pwErrors, setPwErrors] = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        const res = await profileService.getProfile()
        if (res.success) {
          const p = res.data
          setProfile(p)
          setForm({
            name: p.name || '',
            education: p.education || '',
            experience: p.experience ?? '',
            bio: p.bio || '',
            skills: p.skills || [],
          })
        }
      } catch {
        toastError('Could not load profile.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        education: form.education || undefined,
        experience: form.experience !== '' ? parseInt(form.experience) : undefined,
        bio: form.bio || undefined,
        skills: form.skills.length > 0 ? form.skills : undefined,
      }
      const res = await profileService.updateProfile(payload)
      if (res.success) {
        updateUser(res.data)
        success('Profile updated successfully!')
      } else {
        toastError(res.message || 'Update failed.')
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Update failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!pwForm.current_password) errs.current = 'Required.'
    if (pwForm.new_password.length < 8) errs.new = 'Min 8 characters.'
    if (!/[A-Z]/.test(pwForm.new_password)) errs.new = 'Must contain uppercase.'
    if (!/\d/.test(pwForm.new_password)) errs.new = 'Must contain a digit.'
    if (pwForm.new_password !== pwForm.confirm) errs.confirm = 'Passwords do not match.'
    setPwErrors(errs)
    if (Object.keys(errs).length) return

    setChangingPw(true)
    try {
      const res = await profileService.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      if (res.success) {
        success('Password changed successfully!')
        setPwForm({ current_password: '', new_password: '', confirm: '' })
        setPwErrors({})
      } else {
        toastError(res.message || 'Password change failed.')
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Password change failed.')
    } finally {
      setChangingPw(false)
    }
  }

  const addSkill = () => {
    const t = skillInput.trim()
    if (t && !form.skills.includes(t)) {
      setForm(p => ({ ...p, skills: [...p.skills, t] }))
    }
    setSkillInput('')
  }

  const removeSkill = (s) => setForm(p => ({ ...p, skills: p.skills.filter(x => x !== s) }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner size="lg" label="Loading profile..." />
      </div>
    )
  }

  const TABS = [
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'skills',  label: 'Skills',       icon: Code },
    { id: 'password',label: 'Password',      icon: Lock },
  ]

  const PwField = ({ id, label, field, placeholder }) => (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          id={id}
          type={showPw[field] ? 'text' : 'password'}
          placeholder={placeholder}
          value={pwForm[field === 'current' ? 'current_password' : field === 'new' ? 'new_password' : 'confirm']}
          onChange={e => setPwForm(p => ({
            ...p,
            [field === 'current' ? 'current_password' : field === 'new' ? 'new_password' : 'confirm']: e.target.value
          }))}
          className={`input pl-10 pr-10 ${pwErrors[field] ? 'border-red-500' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShowPw(p => ({ ...p, [field]: !p[field] }))}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
        >
          {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {pwErrors[field] && <p className="text-red-400 text-xs mt-1">{pwErrors[field]}</p>}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-brand-600/30">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{profile?.name}</h1>
          <p className="text-gray-400 text-sm flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> {profile?.email}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white/5 rounded-xl p-1 border border-white/10">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`profile-tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass p-8 space-y-5 animate-slide-up">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-brand-400" /> Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="profile-name" className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input id="profile-name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input pl-10" placeholder="Full name" />
              </div>
            </div>
            <div>
              <label htmlFor="profile-experience" className="label">Years of Experience</label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input id="profile-experience" type="number" min="0" max="60" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} className="input pl-10" placeholder="e.g. 3" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="profile-education" className="label">Education</label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input id="profile-education" value={form.education} onChange={e => setForm(p => ({ ...p, education: e.target.value }))} className="input pl-10" placeholder="e.g. B.Tech Computer Science" />
            </div>
          </div>

          <div>
            <label htmlFor="profile-bio" className="label">Bio</label>
            <textarea id="profile-bio" value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className="input min-h-[80px] resize-none" placeholder="Tell us about yourself..." />
          </div>

          <button id="profile-save" type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? <LoadingSpinner size="sm" label="" /> : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </form>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="glass p-8 space-y-5 animate-slide-up">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-brand-400" /> Manage Skills
          </h2>

          <div className="flex gap-2">
            <input
              id="profile-skill-input"
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              placeholder="Type a skill and press Enter"
              className="input flex-1"
            />
            <button type="button" id="profile-add-skill" onClick={addSkill} className="btn-primary px-5">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {form.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.skills.map(s => (
                <span key={s} className="chip text-sm">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-400 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No skills added yet.</p>
          )}

          <button id="profile-save-skills" onClick={handleSaveProfile} disabled={saving} className="btn-primary w-full">
            {saving ? <LoadingSpinner size="sm" label="" /> : <><Save className="w-4 h-4" /> Save Skills</>}
          </button>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="glass p-8 space-y-5 animate-slide-up">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-400" /> Change Password
          </h2>
          <PwField id="pw-current" label="Current Password"  field="current" placeholder="Your current password" />
          <PwField id="pw-new"     label="New Password"      field="new"     placeholder="Min 8 chars, 1 uppercase, 1 digit" />
          <PwField id="pw-confirm" label="Confirm Password"  field="confirm" placeholder="Repeat new password" />
          <button id="profile-change-pw" type="submit" disabled={changingPw} className="btn-primary w-full">
            {changingPw ? <LoadingSpinner size="sm" label="" /> : <><Lock className="w-4 h-4" /> Update Password</>}
          </button>
        </form>
      )}
    </div>
  )
}
