import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Target, CheckCircle, Clock, TrendingUp, ArrowRight,
  AlertCircle, ClipboardList, MessageSquare,
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import reportService from '../../services/reportService'
import goalService from '../../services/goalService'
import { performanceReviewService } from '../../services/reviewService'

function MetricCard({ title, value, icon: Icon, color, subtitle, onClick }) {
  return (
    <div className={`metric-card cursor-pointer hover:shadow-md transition-all`} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
    </div>
  )
}

export default function EmployeeDashboard() {
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
        setPendingReviews(list.filter(r => r.status === 'PENDING' || r.status === 'MANAGER_REVIEW_COMPLETED'))
      }
    } catch {
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Layout title="My Dashboard"><LoadingSpinner message="Loading dashboard..." /></Layout>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const totalGoals      = metrics?.totalGoals      ?? recentGoals.length
  const completedGoals  = metrics?.completedGoals  ?? recentGoals.filter(g => g.status === 'COMPLETED').length
  const inProgressGoals = metrics?.inProgressGoals ?? recentGoals.filter(g => g.status === 'IN_PROGRESS').length
  const pendingGoals    = metrics?.pendingGoals     ?? recentGoals.filter(g => g.status === 'PENDING').length
  const completionRate  = metrics?.completionRate   ?? (totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0)
  const pendingReviewsCnt = metrics?.pendingReviews ?? pendingReviews.length

  return (
    <Layout title="My Dashboard">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold">{greeting}, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-blue-100 mt-1">Here is your personal performance overview.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            {user?.department ? `${user.department} Department` : 'Employee View'}
          </span>
          <span className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg text-sm">
            <TrendingUp size={14} />
            {completionRate}% Completion Rate
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 mb-6 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> Dashboard metrics could not be loaded.
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Total Goals"      value={totalGoals}      icon={Target}      color="text-blue-600"   subtitle="All my goals"         onClick={() => navigate('/goals')} />
        <MetricCard title="Completed"        value={completedGoals}  icon={CheckCircle} color="text-green-600"  subtitle="Successfully finished" onClick={() => navigate('/goals')} />
        <MetricCard title="In Progress"      value={inProgressGoals} icon={TrendingUp}  color="text-indigo-600" subtitle="Currently working on"   onClick={() => navigate('/goals')} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Pending Goals"    value={pendingGoals}    icon={Clock}       color="text-yellow-600" subtitle="Awaiting approval"    onClick={() => navigate('/goals')} />
        <MetricCard title="Completion Rate"  value={`${completionRate}%`} icon={TrendingUp} color="text-purple-600" subtitle="Goals completed" onClick={() => navigate('/goals')} />
        <MetricCard title="Pending Reviews"  value={pendingReviewsCnt} icon={ClipboardList} color="text-orange-600" subtitle="Awaiting action" onClick={() => navigate('/reviews')} />
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Goals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">My Recent Goals</h3>
            <button onClick={() => navigate('/goals')} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </button>
          </div>
          {recentGoals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Target size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No goals yet</p>
              <button onClick={() => navigate('/goals')} className="btn-primary mt-3 text-sm py-1.5 px-3">
                Create your first goal
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentGoals.slice(0, 5).map(goal => (
                <div key={goal.goalId}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => navigate('/goals')}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{goal.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{goal.category} · Due {goal.endDate || 'No deadline'}</p>
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
          </div>
          <div className="space-y-3">
            {pendingGoals > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors" onClick={() => navigate('/goals')}>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center"><Clock size={16} className="text-yellow-600" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{pendingGoals} goals awaiting manager approval</p>
                  <p className="text-xs text-gray-500">Your manager needs to approve these</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
              </div>
            )}
            {pendingReviews.filter(r => r.status === 'PENDING').length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => navigate('/reviews')}>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"><ClipboardList size={16} className="text-blue-600" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Self-assessment due</p>
                  <p className="text-xs text-gray-500">Submit your self-assessment for the active cycle</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
              </div>
            )}
            {pendingReviews.filter(r => r.status === 'MANAGER_REVIEW_COMPLETED').length > 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-lg cursor-pointer hover:bg-green-100 transition-colors" onClick={() => navigate('/reviews')}>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle size={16} className="text-green-600" /></div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Review awaiting acknowledgment</p>
                  <p className="text-xs text-gray-500">Your manager has reviewed your performance</p>
                </div>
                <ArrowRight size={16} className="text-gray-400 ml-auto" />
              </div>
            )}
            {pendingGoals === 0 && pendingReviews.length === 0 && (
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
            { label: 'My Goals',    icon: Target,        path: '/goals',         color: 'text-blue-600 bg-blue-50' },
            { label: 'Reviews',     icon: ClipboardList, path: '/reviews',       color: 'text-green-600 bg-green-50' },
            { label: 'Feedback',    icon: MessageSquare, path: '/feedback',      color: 'text-purple-600 bg-purple-50' },
            { label: 'Notifications', icon: AlertCircle, path: '/notifications', color: 'text-orange-600 bg-orange-50' },
          ].map((action) => {
            const Icon = action.icon
            return (
              <button key={action.path} onClick={() => navigate(action.path)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow ${action.color}`}>
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
