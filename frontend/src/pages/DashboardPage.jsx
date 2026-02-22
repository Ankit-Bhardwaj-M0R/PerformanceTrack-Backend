import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  AlertCircle,
  ClipboardList,
  BarChart2,
  ArrowRight,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import StatusBadge from '../components/common/StatusBadge'
import { useAuth } from '../context/AuthContext'
import reportService from '../services/reportService'
import goalService from '../services/goalService'
import { performanceReviewService } from '../services/reviewService'

// ─── DASHBOARD PAGE ────────────────────────────────────────────────────────────
// Shows a high-level overview of the system.
// Content adapts based on user role:
//   ADMIN:    System-wide stats (total users, goals, reviews)
//   MANAGER:  Team stats (team goals, pending approvals, reviews)
//   EMPLOYEE: Personal stats (my goals, my reviews)
//
// APIs Used:
//   GET /api/v1/reports/dashboard
//   GET /api/v1/goals
//   GET /api/v1/performance-reviews
// ─────────────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isAdmin, isManager, isEmployee, isAdminOrManager } = useAuth()
  const navigate = useNavigate()

  const [metrics, setMetrics] = useState(null)
  const [recentGoals, setRecentGoals] = useState([])
  const [pendingReviews, setPendingReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Load all data in parallel (faster than loading one by one)
      const [metricsData, goalsData, reviewsData] = await Promise.allSettled([
        reportService.getDashboardMetrics(),
        goalService.getGoals(0, 5),   // Get 5 most recent goals
        performanceReviewService.getReviews(0, 5),
      ])

      if (metricsData.status === 'fulfilled') setMetrics(metricsData.value)
      if (goalsData.status === 'fulfilled') {
        const goals = goalsData.value?.content || goalsData.value || []
        setRecentGoals(goals)
      }
      if (reviewsData.status === 'fulfilled') {
        const reviews = reviewsData.value?.content || reviewsData.value || []
        setPendingReviews(reviews.filter(r =>
          r.status === 'PENDING' ||
          r.status === 'SELF_ASSESSMENT_COMPLETED' ||
          r.status === 'MANAGER_REVIEW_COMPLETED'
        ))
      }
    } catch (err) {
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Stat Card Component (defined inline for simplicity) ───────────────────
  const StatCard = ({ title, value, icon: Icon, color, subtitle, onClick }) => (
    <div
      className={`card cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>
            {value ?? '—'}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-opacity-10 ${color.replace('text', 'bg')}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <Layout title="Dashboard">
        <LoadingSpinner message="Loading dashboard..." />
      </Layout>
    )
  }

  // Build greeting based on time of day
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <Layout title="Dashboard">
      {/* ─── Welcome Banner ─── */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold">
          {greeting}, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-blue-100 mt-1">
          {isAdmin() && 'Here is an overview of the entire organization.'}
          {isManager() && "Here is your team's performance overview."}
          {isEmployee() && 'Here is your personal performance overview.'}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg text-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full" />
          <span>{user?.department ? `${user.department} Department` : user?.role}</span>
        </div>
      </div>

      {/* ─── Metrics Cards ─── */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 mb-6 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          Dashboard metrics could not be loaded. The backend may be starting up.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Goals"
          value={metrics?.totalGoals ?? metrics?.totalTeamGoals ?? recentGoals.length}
          icon={Target}
          color="text-blue-600"
          subtitle="All assigned goals"
          onClick={() => navigate('/goals')}
        />
        <StatCard
          title="Completed Goals"
          value={metrics?.completedGoals ?? recentGoals.filter(g => g.status === 'COMPLETED').length}
          icon={CheckCircle}
          color="text-green-600"
          subtitle="Successfully finished"
          onClick={() => navigate('/goals')}
        />
        <StatCard
          title="Pending Reviews"
          value={metrics?.pendingReviews ?? metrics?.pendingApprovals ?? pendingReviews.length}
          icon={ClipboardList}
          color="text-orange-600"
          subtitle="Awaiting action"
          onClick={() => navigate('/reviews')}
        />
        {isAdminOrManager() ? (
          <StatCard
            title="Active Users"
            value={metrics?.teamSize ?? (typeof metrics?.totalUsers === 'number' ? metrics.totalUsers : undefined)}
            icon={Users}
            color="text-purple-600"
            subtitle="Team members"
            onClick={() => navigate('/users')}
          />
        ) : (
          <StatCard
            title="In Progress"
            value={metrics?.inProgressGoals ?? recentGoals.filter(g => g.status === 'IN_PROGRESS').length}
            icon={TrendingUp}
            color="text-indigo-600"
            subtitle="Goals being worked on"
            onClick={() => navigate('/goals')}
          />
        )}
      </div>

      {/* ─── Two-column layout: Recent Goals + Pending Actions ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Goals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Goals</h3>
            <button
              onClick={() => navigate('/goals')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {recentGoals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Target size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No goals found</p>
              {isEmployee() && (
                <button
                  onClick={() => navigate('/goals')}
                  className="btn-primary mt-3 text-sm py-1.5 px-3"
                >
                  Create your first goal
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {recentGoals.map((goal) => (
                <div
                  key={goal.goalId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => navigate('/goals')}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{goal.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {goal.category} · Due {goal.endDate || 'No deadline'}
                    </p>
                  </div>
                  <StatusBadge status={goal.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Actions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Pending Actions</h3>
            <button
              onClick={() => navigate('/reviews')}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {/* Items that need attention */}
          <div className="space-y-3">
            {/* Goals pending manager approval */}
            {isManager() && recentGoals.filter(g => g.status === 'PENDING').length > 0 && (
              <div
                className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={() => navigate('/goals')}
              >
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {recentGoals.filter(g => g.status === 'PENDING').length} goals awaiting approval
                  </p>
                  <p className="text-xs text-gray-500">Review and approve team goals</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
              </div>
            )}

            {/* Goals pending completion approval */}
            {isManager() && recentGoals.filter(g => g.status === 'PENDING_COMPLETION_APPROVAL').length > 0 && (
              <div
                className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => navigate('/goals')}
              >
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {recentGoals.filter(g => g.status === 'PENDING_COMPLETION_APPROVAL').length} goals pending completion
                  </p>
                  <p className="text-xs text-gray-500">Review completion requests</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
              </div>
            )}

            {/* Pending reviews */}
            {pendingReviews.length > 0 && (
              <div
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => navigate('/reviews')}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClipboardList size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {pendingReviews.length} performance review{pendingReviews.length > 1 ? 's' : ''} pending
                  </p>
                  <p className="text-xs text-gray-500">
                    {isEmployee() ? 'Submit your self-assessment' : 'Review team submissions'}
                  </p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
              </div>
            )}

            {/* If nothing is pending */}
            {(
              recentGoals.filter(g => g.status === 'PENDING').length === 0 &&
              recentGoals.filter(g => g.status === 'PENDING_COMPLETION_APPROVAL').length === 0 &&
              pendingReviews.length === 0
            ) ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle size={32} className="mx-auto mb-2 opacity-50 text-green-500" />
                <p className="text-sm">All caught up! No pending actions.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ─── Quick Links for Admin ─── */}
      {isAdmin() && (
        <div className="mt-6 card">
          <h3 className="section-title mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Manage Users', icon: Users, path: '/users', color: 'text-purple-600 bg-purple-50' },
              { label: 'View Reports', icon: BarChart2, path: '/reports', color: 'text-blue-600 bg-blue-50' },
              { label: 'Review Cycles', icon: ClipboardList, path: '/review-cycles', color: 'text-green-600 bg-green-50' },
              { label: 'Audit Logs', icon: AlertCircle, path: '/audit-logs', color: 'text-orange-600 bg-orange-50' },
            ].map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow ${action.color}`}
                >
                  <Icon size={24} />
                  <span className="text-sm font-medium text-gray-700">{action.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </Layout>
  )
}

