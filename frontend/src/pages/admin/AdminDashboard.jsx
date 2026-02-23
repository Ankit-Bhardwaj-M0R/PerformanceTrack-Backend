import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, Target, CheckCircle, ClipboardList, RefreshCw,
  Shield, BarChart2, ArrowRight, AlertCircle, TrendingUp,
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import reportService from '../../services/reportService'
import { reviewCycleService } from '../../services/reviewService'

function MetricCard({ title, value, icon: Icon, color, subtitle, onClick }) {
  return (
    <div className={`metric-card cursor-pointer hover:shadow-md transition-all`} onClick={onClick}>
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

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [metrics, setMetrics]       = useState(null)
  const [activeCycles, setActiveCycles] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [metricsRes, cyclesRes] = await Promise.allSettled([
        reportService.getDashboardMetrics(),
        reviewCycleService.getAllCycles(),
      ])
      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value)
      if (cyclesRes.status === 'fulfilled') {
        const list = cyclesRes.value?.content || cyclesRes.value || []
        setActiveCycles(Array.isArray(list) ? list.filter(c => c.status === 'ACTIVE') : [])
      }
    } catch {
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Layout title="Admin Dashboard"><LoadingSpinner message="Loading dashboard..." /></Layout>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const totalUsers     = metrics?.totalUsers     ?? '—'
  const totalGoals     = metrics?.totalGoals     ?? '—'
  const totalReviews   = metrics?.totalReviews   ?? '—'
  const completedGoals = metrics?.completedGoals ?? '—'
  const pendingReviews = metrics?.pendingReviews ?? '—'
  const activeCyclesCount = activeCycles.length

  const completionRate = (typeof totalGoals === 'number' && totalGoals > 0 && typeof completedGoals === 'number')
    ? Math.round((completedGoals / totalGoals) * 100)
    : null

  return (
    <Layout title="Admin Dashboard">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold">{greeting}, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-red-100 mt-1">Here is an overview of the entire organization.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg text-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            System Administrator
          </span>
          <span className="inline-flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1.5 rounded-lg text-sm">
            <RefreshCw size={14} />
            {activeCyclesCount} Active Review Cycle{activeCyclesCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 mb-6 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> Dashboard metrics could not be loaded.
        </div>
      )}

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-4">
        <MetricCard title="Total Users"     value={totalUsers}     icon={Users}       color="text-purple-600" subtitle="Registered accounts"   onClick={() => navigate('/users')} />
        <MetricCard title="Total Goals"     value={totalGoals}     icon={Target}      color="text-blue-600"   subtitle="Company-wide goals"    onClick={() => navigate('/reports')} />
        <MetricCard title="Active Cycles"   value={activeCyclesCount} icon={RefreshCw} color="text-green-600" subtitle="Running review cycles" onClick={() => navigate('/review-cycles')} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard title="Completed Goals" value={completedGoals} icon={CheckCircle} color="text-green-600"  subtitle="Successfully finished" onClick={() => navigate('/reports')} />
        <MetricCard title="Total Reviews"   value={totalReviews}   icon={ClipboardList} color="text-indigo-600" subtitle="Performance reviews" onClick={() => navigate('/reports')} />
        <MetricCard title="Pending Reviews" value={pendingReviews} icon={AlertCircle} color="text-orange-600" subtitle="Awaiting completion"   onClick={() => navigate('/reports')} />
      </div>

      {/* Completion Rate Banner */}
      {completionRate !== null && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Company Goal Completion Rate</h3>
            <span className="text-2xl font-bold text-green-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
      )}

      {/* Active Cycles */}
      {activeCycles.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Active Review Cycles</h3>
            <button onClick={() => navigate('/review-cycles')} className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1">
              Manage <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {activeCycles.map(cycle => (
              <div key={cycle.cycleId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div>
                  <p className="font-medium text-gray-800">{cycle.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cycle.startDate} → {cycle.endDate}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">ACTIVE</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h3 className="section-title mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Manage Users',    icon: Users,         path: '/users',          color: 'text-purple-600 bg-purple-50' },
            { label: 'View Reports',    icon: BarChart2,     path: '/reports',        color: 'text-blue-600 bg-blue-50' },
            { label: 'Review Cycles',   icon: RefreshCw,     path: '/review-cycles',  color: 'text-green-600 bg-green-50' },
            { label: 'Audit Logs',      icon: Shield,        path: '/audit-logs',     color: 'text-orange-600 bg-orange-50' },
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
