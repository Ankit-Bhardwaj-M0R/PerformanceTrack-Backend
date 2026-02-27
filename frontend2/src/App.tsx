import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages
import LoginPage from './pages/LoginPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminReviewCyclesPage from './pages/admin/AdminReviewCyclesPage'
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'

// Manager pages
import ManagerDashboard from './pages/manager/ManagerDashboard'
import TeamGoalsPage from './pages/manager/TeamGoalsPage'
import TeamMembersPage from './pages/manager/TeamMembersPage'
import ManagerReviewsPage from './pages/manager/ManagerReviewsPage'
import TeamReportsPage from './pages/manager/TeamReportsPage'

// Employee pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import EmployeeGoalsPage from './pages/employee/EmployeeGoalsPage'
import EmployeeFeedbackPage from './pages/employee/EmployeeFeedbackPage'
import EmployeeReviewsPage from './pages/employee/EmployeeReviewsPage'

// Role-based smart components
function SmartDashboard(): JSX.Element {
  const { isAdmin, isManager, isEmployee } = useAuth()
  if (isAdmin())   return <AdminDashboard />
  if (isManager()) return <ManagerDashboard />
  return <EmployeeDashboard />
}

function SmartReviews(): JSX.Element {
  const { isManager } = useAuth()
  if (isManager()) return <ManagerReviewsPage />
  return <EmployeeReviewsPage />
}

export default function App(): JSX.Element {
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
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Shared routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SmartDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews"
              element={
                <ProtectedRoute>
                  <SmartReviews />
                </ProtectedRoute>
              }
            />

            {/* Manager routes */}
            <Route
              path="/team-goals"
              element={
                <ProtectedRoute roles={['MANAGER']}>
                  <TeamGoalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team-members"
              element={
                <ProtectedRoute roles={['MANAGER']}>
                  <TeamMembersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team-reports"
              element={
                <ProtectedRoute roles={['MANAGER']}>
                  <TeamReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Employee routes */}
            <Route
              path="/goals"
              element={
                <ProtectedRoute roles={['EMPLOYEE', 'MANAGER']}>
                  <EmployeeGoalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback"
              element={
                <ProtectedRoute roles={['EMPLOYEE']}>
                  <EmployeeFeedbackPage />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review-cycles"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminReviewCyclesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminAuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <AdminReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
