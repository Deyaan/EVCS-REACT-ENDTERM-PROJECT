import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, User, Mail, Lock, AlertCircle } from 'lucide-react'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    setError('')
    setLoading(true)
    try {
      await signup(email, password, name, role)
      navigate('/')
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ev-dark flex items-center justify-center p-4">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-ev-green opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-ev-green rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap size={22} className="text-ev-dark" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Create account</h1>
          <p className="text-ev-muted text-sm mt-1">Join EVCS and start charging smarter</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ev-muted" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input pl-9" placeholder="Arjun Sharma" required />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ev-muted" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input pl-9" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ev-muted" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input pl-9" placeholder="Min 6 characters" required />
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'user', label: 'EV Driver', desc: 'Find & navigate to stations' },
                  { value: 'owner', label: 'Station Owner', desc: 'Manage your charging stations' },
                ].map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === r.value
                        ? 'border-ev-green bg-ev-green/10 text-white'
                        : 'border-ev-border text-ev-muted hover:border-gray-600'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-0.5">{r.label}</div>
                    <div className="text-xs opacity-70">{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-ev-red text-xs bg-ev-red/10 border border-ev-red/20 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center flex items-center gap-2 mt-2">
              {loading && <div className="w-4 h-4 border-2 border-ev-dark border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ev-muted mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-ev-green hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
