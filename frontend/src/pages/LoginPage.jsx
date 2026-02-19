import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// ─── LOGIN PAGE ────────────────────────────────────────────────────────────────
// The first page users see. Collects email + password and calls the login API.
// On success, redirects to the Dashboard.
//
// API Used: POST /api/v1/auth/login
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user } = useAuth()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If already logged in, go to dashboard
  React.useEffect(() => {
    if (user) navigate('/dashboard')
  }, [user, navigate])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(
        err.response?.data?.msg ||
        'Login failed. Please check your credentials and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">PerformanceTrack</h1>
          <p className="text-blue-100 text-sm mt-1">Employee Performance Management System</p>
        </div>

        {/* Form Area */}
        <div className="px-8 py-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in to your account</h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
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

            {/* Password Field */}
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
                {/* Toggle show/hide password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
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
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Contact your administrator if you need access.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
          <div className="flex justify-center gap-6 text-xs text-gray-400">
            <span>Roles: Admin | Manager | Employee</span>
          </div>
        </div>
      </div>
    </div>
  )
}
