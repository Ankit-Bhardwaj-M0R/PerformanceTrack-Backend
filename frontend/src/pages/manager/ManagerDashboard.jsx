import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Target, Clock, CheckCircle, ArrowRight,
  AlertCircle, TrendingUp, ClipboardList,
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import reportService from '../../services/reportService'
import goalService from '../../services/goalService'
import { performanceReviewService } from '../../services/reviewService'

// Metric card
function MetricCard({ title, value, icon: Icon, color, subtitle, onClick }) {
  return (
    <div
      className={`metric-card cursor-pointer ${onClick ? 'hover:shadow-md' : ''} transition-all`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-100').replace('-500', '-100')}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  )
}

export default function ManagerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [metrics, setMetrics]           = useState(null)
  const [recentGoals, setRecentGoals]   = useState([])
  const [pendingReviews, setPendingReviews] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [metricsRes, goalsRes, reviewsRes] = await Promise.allSettled([
        reportService.getDashboardMetrics(),
        goalService.getGoals(0, 8),
        performanceReviewService.getReviews(0, 10),
      ])

      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value)
      if (goalsRes.status === 'fulfilled') {
        const list = goalsRes.value?.content || goalsRes.value || []
        setRecentGoals(list)
      }
      if (reviewsRes.status === 'fulfilled') {
        const list = reviewsRes.value?.content || reviewsRes.value || []
        setPendingReviews(list.filter(r =>
          r.status === 'PENDING' || r.status === 'SELF_ASSESSMENT_COMPLETED'
        ))
      }
    } catch {
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Layout title="Manager Dashboard"><LoadingSpinner message="Loading dashboard..." /></Layout>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Derived metric values
  const totalMembers      = metrics?.teamSize ?? '—'
  const openGoals         = metrics?.totalGoals ?? recentGoals.filter(g => g.status !== 'COMPLETED' && g.status !== 'REJECTED').length
  const pendingApprovals  = metrics?.pendingApprovals ?? recentGoals.filter(g => g.status === 'PENDING').length
  const completedGoals    = metrics?.completedGoals ?? recentGoals.filter(g => g.status === 'COMPLETED').length
  const pendingCompletions = metrics?.pendingCompletions ?? recentGoals.filter(g => g.status === 'PENDING_COMPLETION_APPROVAL').length

  return (
    <Layout title="Manager Dashboard">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold">{greeting}, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-purple-100 mt-1">Here is your team's performance overview.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            {user?.department ? `${user.department} Department` : 'Manager View'}
          </span>
          <span className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg text-sm">
            <Users size={14} />
            {totalMembers} Team Members
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 mb-6 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> Dashboard metrics could not be loaded. The backend may be starting up.
        </div>
      )}

      {/* Metrics — 3 key metrics requested */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Total Members"
          value={totalMembers}
          icon={Users}
          color="text-purple-600"
          subtitle="Active team members"
          onClick={() => navigate('/team-members')}
        />
        <MetricCard
          title="Open Goals"
          value={openGoals}
          icon={Target}
          color="text-blue-600"
          subtitle="Active team goals"
          onClick={() => navigate('/team-goals')}
        />
        <MetricCard
          title="Pending Approvals"
          value={pendingApprovals}
          icon={Clock}
          color="text-orange-600"
          subtitle="Goals awaiting review"
          onClick={() => navigate('/team-goals')}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Completed Goals"
          value={completedGoals}
          icon={CheckCircle}
          color="text-green-600"
          subtitle="Successfully finished"
          onClick={() => navigate('/team-goals')}
        />
        <MetricCard
          title="Pending Completions"
          value={pendingCompletions}
          icon={TrendingUp}
          color="text-indigo-600"
          subtitle="Awaiting completion review"
          onClick={() => navigate('/team-goals')}
        />
        <MetricCard
          title="Pending Reviews"
          value={pendingReviews.length}
          icon={ClipboardList}
          color="text-red-600"
          subtitle="Performance reviews pending"
          onClick={() => navigate('/reviews')}
        />
      </div>

      {/* Two-column: Recent Goals + Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Team Goals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Team Goals</h3>
            <button onClick={() => navigate('/team-goals')} className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          {recentGoals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Target size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No team goals yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentGoals.slice(0, 5).map((goal) => (
                <div
                  key={goal.goalId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => navigate('/team-goals')}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{goal.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {goal.category} · {goal.employeeName || 'Team Member'}
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
            <button onClick={() => navigate('/team-goals')} className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {pendingApprovals > 0 && (
              <div
                className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={() => navigate('/team-goals')}
              >
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{pendingApprovals} goals awaiting approval</p>
                  <p className="text-xs text-gray-500">Review and approve team goals</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
              </div>
            )}
            {pendingCompletions > 0 && (
              <div
                className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => navigate('/team-goals')}
              >
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{pendingCompletions} goals pending completion</p>
                  <p className="text-xs text-gray-500">Review completion requests</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
              </div>
            )}
            {pendingReviews.length > 0 && (
              <div
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => navigate('/reviews')}
              >
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClipboardList size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{pendingReviews.length} performance review{pendingReviews.length > 1 ? 's' : ''} pending</p>
                  <p className="text-xs text-gray-500">Review team submissions</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
              </div>
            )}
            {pendingApprovals === 0 && pendingCompletions === 0 && pendingReviews.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle size={32} className="mx-auto mb-2 opacity-50 text-green-500" />
                <p className="text-sm">All caught up! No pending actions.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 card">
        <h3 className="section-title mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Team Goals',    icon: Target,        path: '/team-goals',    color: 'text-blue-600 bg-blue-50' },
            { label: 'Team Members',  icon: Users,         path: '/team-members',  color: 'text-purple-600 bg-purple-50' },
            { label: 'Reviews',       icon: ClipboardList, path: '/reviews',       color: 'text-green-600 bg-green-50' },
            { label: 'Team Reports',  icon: TrendingUp,    path: '/team-reports',  color: 'text-orange-600 bg-orange-50' },
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
    </Layout>
  )
}
