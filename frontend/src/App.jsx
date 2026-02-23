import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// ─── Context Providers ────────────────────────────────────────────────────────
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'

// ─── Route Guard ──────────────────────────────────────────────────────────────
import ProtectedRoute from './components/common/ProtectedRoute'

// ─── Shared Pages ─────────────────────────────────────────────────────────────
import LoginPage           from './pages/LoginPage'
import NotificationsPage   from './pages/NotificationsPage'
import ProfilePage         from './pages/ProfilePage'

// ─── Manager Pages ────────────────────────────────────────────────────────────
import ManagerDashboard    from './pages/manager/ManagerDashboard'
import TeamGoalsPage       from './pages/manager/TeamGoalsPage'
import ManagerReviewsPage  from './pages/manager/ManagerReviewsPage'
import TeamMembersPage     from './pages/manager/TeamMembersPage'
import TeamReportsPage     from './pages/manager/TeamReportsPage'

// ─── Employee Pages ───────────────────────────────────────────────────────────
import EmployeeDashboard   from './pages/employee/EmployeeDashboard'
import EmployeeGoalsPage   from './pages/employee/EmployeeGoalsPage'
import EmployeeReviewsPage from './pages/employee/EmployeeReviewsPage'
import EmployeeFeedbackPage from './pages/employee/EmployeeFeedbackPage'

// ─── Admin Pages ──────────────────────────────────────────────────────────────
import AdminDashboard        from './pages/admin/AdminDashboard'
import AdminUsersPage        from './pages/admin/AdminUsersPage'
import AdminReviewCyclesPage from './pages/admin/AdminReviewCyclesPage'
import AdminAuditLogsPage    from './pages/admin/AdminAuditLogsPage'
import AdminReportsPage      from './pages/admin/AdminReportsPage'

// ─── Smart Dashboard: redirects to role-specific dashboard ───────────────────
function SmartDashboard() {
  const { isAdmin, isManager, isEmployee } = useAuth()
  if (isAdmin())    return <AdminDashboard />
  if (isManager())  return <ManagerDashboard />
  return <EmployeeDashboard />
}

// ─── Smart Reviews: redirects to role-specific reviews ───────────────────────
function SmartReviews() {
  const { isManager } = useAuth()
  if (isManager()) return <ManagerReviewsPage />
  return <EmployeeReviewsPage />
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', fontSize: '14px', maxWidth: '380px' },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />

          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/"      element={<Navigate to="/dashboard" replace />} />

            {/* ── Dashboard (role-adaptive) ── */}
            <Route path="/dashboard" element={
              <ProtectedRoute><SmartDashboard /></ProtectedRoute>
            } />

            {/* ── Manager-specific routes ── */}
            <Route path="/team-goals" element={
              <ProtectedRoute roles={['MANAGER']}>
                <TeamGoalsPage />
              </ProtectedRoute>
            } />
            <Route path="/team-members" element={
              <ProtectedRoute roles={['MANAGER']}>
                <TeamMembersPage />
              </ProtectedRoute>
            } />
            <Route path="/team-reports" element={
              <ProtectedRoute roles={['MANAGER']}>
                <TeamReportsPage />
              </ProtectedRoute>
            } />

            {/* ── Employee-specific routes ── */}
            <Route path="/goals" element={
              <ProtectedRoute roles={['EMPLOYEE', 'MANAGER']}>
                <EmployeeGoalsPage />
              </ProtectedRoute>
            } />
            <Route path="/feedback" element={
              <ProtectedRoute roles={['EMPLOYEE']}>
                <EmployeeFeedbackPage />
              </ProtectedRoute>
            } />

            {/* ── Reviews (adaptive for manager vs employee) ── */}
            <Route path="/reviews" element={
              <ProtectedRoute>
                <SmartReviews />
              </ProtectedRoute>
            } />

            {/* ── Admin-specific routes ── */}
            <Route path="/users" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminUsersPage />
              </ProtectedRoute>
            } />
            <Route path="/review-cycles" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminReviewCyclesPage />
              </ProtectedRoute>
            } />
            <Route path="/audit-logs" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminAuditLogsPage />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminReportsPage />
              </ProtectedRoute>
            } />

            {/* ── Shared routes ── */}
            <Route path="/notifications" element={
              <ProtectedRoute><NotificationsPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
