import React, { useState } from 'react'
import { User, Lock, Shield, Building, Mail, CheckCircle } from 'lucide-react'
import Layout from '../components/layout/Layout'
import StatusBadge from '../components/common/StatusBadge'
import { useAuth } from '../context/AuthContext'
import authService from '../services/authService'
import toast from 'react-hot-toast'

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
// Every user can:
//   - View their profile info (read-only, managed by admin)
//   - Change their password
//
// API Used:
//   PUT /api/v1/auth/change-password
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuth()

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordChanged(false)

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('All password fields are required')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      toast.error('New password must be different from your current password')
      return
    }

    setSubmitting(true)
    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      toast.success('Password changed successfully!')
      setPasswordChanged(true)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password. Check your current password.')
    } finally {
      setSubmitting(false)
    }
  }

  // Role descriptions for fresher understanding
  const roleDescriptions = {
    ADMIN: 'Full access: manage users, view all data, create review cycles, export reports.',
    MANAGER: 'Approve/reject team goals, submit manager reviews, view team reports.',
    EMPLOYEE: 'Create goals, submit progress, write self-assessments, view your reviews.',
  }

  return (
    <Layout title="My Profile">
      <div className="max-w-2xl space-y-6">
        {/* Profile Info Card */}
        <div className="card">
          <div className="flex items-center gap-5 mb-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={user?.role} />
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail size={18} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Email Address</p>
                <p className="text-sm text-gray-800 font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Building size={18} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Department</p>
                <p className="text-sm text-gray-800 font-medium">{user?.department || 'Not assigned'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Shield size={18} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Your Role</p>
                <p className="text-sm text-gray-800 font-medium">{user?.role}</p>
                <p className="text-xs text-gray-500 mt-0.5">{roleDescriptions[user?.role]}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <User size={18} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-medium">User ID</p>
                <p className="text-sm text-gray-800 font-mono">#{user?.userId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
              <Lock size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Change Password</h3>
              <p className="text-xs text-gray-500">Use a strong password with letters, numbers, and symbols</p>
            </div>
          </div>

          {passwordChanged && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm">
              <CheckCircle size={16} />
              Password changed successfully!
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="form-label">Current Password *</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                className="input-field"
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="Enter your current password"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="form-label">New Password *</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                className="input-field"
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Min 6 characters"
                disabled={submitting}
              />
            </div>
            <div>
              <label className="form-label">Confirm New Password *</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                className="input-field"
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Re-enter your new password"
                disabled={submitting}
              />
              {/* Real-time match indicator */}
              {passwordForm.confirmPassword && (
                <p className={`text-xs mt-1 ${
                  passwordForm.newPassword === passwordForm.confirmPassword
                    ? 'text-green-600' : 'text-red-500'
                }`}>
                  {passwordForm.newPassword === passwordForm.confirmPassword
                    ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Toggle show passwords */}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input type="checkbox" checked={showPasswords}
                onChange={e => setShowPasswords(e.target.checked)}
                className="w-4 h-4" />
              Show passwords
            </label>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Changing Password...
                </span>
              ) : (
                'Change Password'
              )}
            </button>
          </form>
        </div>

        {/* Security Tips for freshers */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-2">🔒 Security Tips</p>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li>Use a unique password you don't use anywhere else</li>
            <li>Include uppercase, lowercase, numbers, and symbols</li>
            <li>Never share your password with anyone</li>
            <li>Log out when using shared computers</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
