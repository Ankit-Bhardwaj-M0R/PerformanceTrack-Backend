import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// ─── Context Providers ────────────────────────────────────────────────────────
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'

// ─── Route Guard ──────────────────────────────────────────────────────────────
import ProtectedRoute from './components/common/ProtectedRoute'

// ─── Pages ────────────────────────────────────────────────────────────────────
import LoginPage               from './pages/LoginPage'
import DashboardPage           from './pages/DashboardPage'
import GoalsPage               from './pages/GoalsPage'
import PerformanceReviewsPage  from './pages/PerformanceReviewsPage'
import ReviewCyclesPage        from './pages/ReviewCyclesPage'
import UsersPage               from './pages/UsersPage'
import ReportsPage             from './pages/ReportsPage'
import NotificationsPage       from './pages/NotificationsPage'
import AuditLogsPage           from './pages/AuditLogsPage'
import ProfilePage             from './pages/ProfilePage'

// ─── APP ──────────────────────────────────────────────────────────────────────
// This is the ROOT component of the entire application.
//
// Architecture (outermost → innermost):
//   BrowserRouter          → handles URL navigation
//     AuthProvider         → global login state (who is logged in?)
//       NotificationProvider → global notifications + SSE stream
//         Toaster          → toast popup messages
//         Routes           → maps URLs to page components
//
// HOW ROUTING WORKS (for freshers):
//   When you visit /goals, React Router renders <GoalsPage />
//   When you visit /login, it renders <LoginPage />
//   <ProtectedRoute> checks if you're logged in before showing the page
//   <ProtectedRoute roles={['ADMIN']}> also checks if you have the right role
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          {/*
            Toaster: renders toast notifications (success/error popups).
            position="top-right" means they appear in the top-right corner.
          */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                fontSize: '14px',
                maxWidth: '380px',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />

          <Routes>
            {/* ── Public Routes (no login required) ── */}
            <Route path="/login" element={<LoginPage />} />

            {/* ── Default: redirect root "/" to dashboard ── */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* ── Protected Routes (login required) ── */}

            {/* Dashboard — visible to ALL roles */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />

            {/* Goals — visible to ALL roles (content differs by role) */}
            <Route path="/goals" element={
              <ProtectedRoute>
                <GoalsPage />
              </ProtectedRoute>
            } />

            {/* Performance Reviews — visible to ALL roles */}
            <Route path="/reviews" element={
              <ProtectedRoute>
                <PerformanceReviewsPage />
              </ProtectedRoute>
            } />

            {/* Review Cycles — ADMIN only */}
            <Route path="/review-cycles" element={
              <ProtectedRoute roles={['ADMIN']}>
                <ReviewCyclesPage />
              </ProtectedRoute>
            } />

            {/* User Management — ADMIN only */}
            <Route path="/users" element={
              <ProtectedRoute roles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            } />

            {/* Reports — ADMIN and MANAGER only */}
            <Route path="/reports" element={
              <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
                <ReportsPage />
              </ProtectedRoute>
            } />

            {/* Notifications — ALL roles */}
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />

            {/* Audit Logs — ADMIN only */}
            <Route path="/audit-logs" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AuditLogsPage />
              </ProtectedRoute>
            } />

            {/* Profile — ALL roles (own profile) */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            {/* Catch-all: unknown URLs → redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
