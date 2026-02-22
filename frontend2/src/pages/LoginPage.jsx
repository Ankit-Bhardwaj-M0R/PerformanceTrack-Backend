import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, TrendingUp, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const DUMMY_USERS = [
  { role: 'EMPLOYEE', email: 'rahul@company.com',  password: 'employee123', color: 'bg-green-100 text-green-700 border-green-200', badge: 'Employee' },
  { role: 'MANAGER',  email: 'priya@company.com',  password: 'manager123',  color: 'bg-purple-100 text-purple-700 border-purple-200', badge: 'Manager' },
  { role: 'ADMIN',    email: 'admin@company.com',  password: 'admin123',    color: 'bg-red-100 text-red-700 border-red-200', badge: 'Admin' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user } = useAuth()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  React.useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter both email and password.'); return }
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDummy = (u) => {
    setEmail(u.email)
    setPassword(u.password)
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">PerformanceTrack</h1>
            <p className="text-blue-100 text-sm mt-1">Employee Performance Management — v2</p>
          </div>

          <div className="px-8 py-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-5">Sign in to your account</h2>

            {/* Quick Login Shortcuts */}
            <div className="mb-5">
              <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                <Zap size={12} className="text-yellow-500" /> Quick Login (Demo Accounts)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DUMMY_USERS.map((u) => (
                  <button
                    key={u.role}
                    type="button"
                    onClick={() => fillDummy(u)}
                    className={`border rounded-lg px-2 py-2 text-xs font-medium transition-all hover:shadow-sm ${u.color}`}
                  >
                    <div className="font-bold">{u.badge}</div>
                    <div className="text-xs opacity-70 truncate">{u.email.split('@')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input-field pl-10"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field pl-10 pr-10"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
            <div className="flex justify-center gap-6 text-xs text-gray-400">
              <span>Roles: Admin · Manager · Employee</span>
            </div>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-4 text-center text-xs text-white text-opacity-60">
          Click a role above to auto-fill credentials
        </div>
      </div>
    </div>
  )
}
