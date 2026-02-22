import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ─── PROTECTED ROUTE ──────────────────────────────────────────────────────────
// This component guards pages that require authentication.
// If the user is NOT logged in → redirect to /login
// If roles are specified and user doesn't have the right role → redirect to /dashboard
//
// Usage:
//   <ProtectedRoute>                    → requires login
//   <ProtectedRoute roles={['ADMIN']}>  → requires ADMIN role
// ─────────────────────────────────────────────────────────────────────────────

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth()

  // While checking saved login (from localStorage), show nothing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Not logged in → go to login page
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role → go to dashboard
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  // All checks passed → render the page
  return children
}
