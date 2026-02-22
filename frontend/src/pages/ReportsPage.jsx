import React, { useState, useEffect } from 'react'
import {
  BarChart2, Download, RefreshCw, Target,
  TrendingUp, Users, Award
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, Legend
} from 'recharts'
import Layout from '../components/layout/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import reportService from '../services/reportService'
import toast from 'react-hot-toast'

// ─── REPORTS & ANALYTICS PAGE ─────────────────────────────────────────────────
// ADMIN & MANAGER — Visual analytics and reports
// APIs Used:
//   GET /api/v1/reports/dashboard
//   GET /api/v1/reports/goal-analytics
//   GET /api/v1/reports/performance-summary
//   GET /api/v1/reports/department-performance
//   POST /api/v1/reports/generate
// ─────────────────────────────────────────────────────────────────────────────

// Chart color palette
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function ReportsPage() {
  const { isAdmin, isAdminOrManager } = useAuth()

  const [dashboard, setDashboard] = useState(null)
  const [goalAnalytics, setGoalAnalytics] = useState(null)
  const [perfSummary, setPerfSummary] = useState(null)
  const [deptPerformance, setDeptPerformance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [dash, goals, perf, dept] = await Promise.allSettled([
        reportService.getDashboardMetrics(),
        reportService.getGoalAnalytics(),
        reportService.getPerformanceSummary(),
        reportService.getDepartmentPerformance(),
      ])
      if (dash.status === 'fulfilled') setDashboard(dash.value?.data || dash.value)
      if (goals.status === 'fulfilled') setGoalAnalytics(goals.value?.data || goals.value)
      if (perf.status === 'fulfilled') setPerfSummary(perf.value?.data || perf.value)
      if (dept.status === 'fulfilled') setDeptPerformance(dept.value?.data || dept.value)
    } catch {
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async (scope) => {
    setGenerating(true)
    try {
      await reportService.generateReport(scope, 'JSON')
      toast.success(`${scope} report generated!`)
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Report generation failed')
    } finally {
      setGenerating(false)
    }
  }

  // Build chart data from API responses (handles different shapes gracefully)
  // Backend returns flat properties: pending, inProgress, pendingCompletion, completed, rejected
  const goalStatusData = goalAnalytics
    ? [
        { name: 'Pending', value: goalAnalytics.pending || 0 },
        { name: 'In Progress', value: goalAnalytics.inProgress || 0 },
        { name: 'Pending Completion', value: goalAnalytics.pendingCompletion || 0 },
        { name: 'Completed', value: goalAnalytics.completed || 0 },
        { name: 'Rejected', value: goalAnalytics.rejected || 0 },
      ].filter(d => d.value > 0)
    : dashboard
      ? [
          { name: 'Completed', value: dashboard.completedGoals || 0 },
          { name: 'In Progress', value: dashboard.inProgressGoals || 0 },
          { name: 'Pending', value: dashboard.pendingGoals || 0 },
          { name: 'Rejected', value: dashboard.rejectedGoals || 0 },
        ].filter(d => d.value > 0)
      : []

  // Backend returns a plain array of { department, avgRating, completedGoals, employeeCount }
  // Also handle legacy object shape { departments: { deptName: { avgRating, completedGoals } } }
  const deptData = Array.isArray(deptPerformance)
    ? deptPerformance.map(d => ({
        dept: (d.department || '').length > 10 ? d.department.substring(0, 10) + '…' : (d.department || ''),
        avgRating: d.avgRating || 0,
        completedGoals: d.completedGoals || 0,
      }))
    : deptPerformance?.departments
      ? Object.entries(deptPerformance.departments).map(([dept, data]) => ({
          dept: dept.length > 10 ? dept.substring(0, 10) + '…' : dept,
          avgRating: data.avgRating || 0,
          completedGoals: data.completedGoals || 0,
        }))
      : []

  // Backend returns avgSelfRating / avgManagerRating (not a distribution map).
  // Build a simple comparison bar from those averages when available.
  const ratingDistribution = perfSummary?.ratingDistribution
    ? Object.entries(perfSummary.ratingDistribution).map(([rating, count]) => ({
        rating: `${rating}★`, count
      }))
    : perfSummary?.avgSelfRating != null || perfSummary?.avgManagerRating != null
      ? [
          { rating: 'Avg Self Rating', count: +(perfSummary.avgSelfRating || 0).toFixed(2) },
          { rating: 'Avg Manager Rating', count: +(perfSummary.avgManagerRating || 0).toFixed(2) },
        ].filter(d => d.count > 0)
      : []

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'goals', label: 'Goal Analytics' },
    { id: 'performance', label: 'Performance' },
    { id: 'departments', label: 'Departments' },
  ]

  if (loading) return <Layout title="Reports & Analytics"><LoadingSpinner message="Loading analytics..." /></Layout>

  return (
    <Layout title="Reports & Analytics">
      {/* Generate Report Buttons — Admin & Manager */}
      {isAdminOrManager() && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {['TEAM', 'DEPARTMENT', 'COMPANY'].map(scope => (
            <button key={scope} onClick={() => handleGenerateReport(scope)}
              disabled={generating}
              className="btn-secondary flex items-center gap-2 text-sm">
              <Download size={16} />
              {generating ? 'Generating...' : `Generate ${scope} Report`}
            </button>
          ))}
          <button onClick={loadAll} className="btn-secondary p-2 ml-auto">
            <RefreshCw size={16} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Goals', value: dashboard?.totalGoals, icon: Target, color: 'text-blue-600 bg-blue-50' },
              { label: 'Completed', value: dashboard?.completedGoals, icon: Award, color: 'text-green-600 bg-green-50' },
              { label: 'Active Users', value: dashboard?.teamSize ?? dashboard?.totalUsers, icon: Users, color: 'text-purple-600 bg-purple-50' },
              { label: 'Completion Rate', value: dashboard?.totalGoals ? `${Math.round((dashboard.completedGoals / dashboard.totalGoals) * 100)}%` : '—', icon: TrendingUp, color: 'text-orange-600 bg-orange-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Goal Status Distribution Pie Chart */}
          {goalStatusData.length > 0 && (
            <div className="card">
              <h3 className="section-title mb-4">Goal Status Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={goalStatusData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {goalStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Goal Analytics Tab ── */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="section-title mb-4">Goal Status Breakdown</h3>
            {goalStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={goalStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {goalStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <BarChart2 size={40} className="mx-auto mb-2 opacity-50" />
                <p>No goal data available yet</p>
              </div>
            )}
          </div>

          {goalAnalytics?.categoryBreakdown && (
            <div className="card">
              <h3 className="section-title mb-4">Goals by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={Object.entries(goalAnalytics.categoryBreakdown).map(([name, value]) => ({ name, value }))}
                    dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}>
                    {Object.keys(goalAnalytics.categoryBreakdown).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Performance Tab ── */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Summary cards when we have avg data */}
          {perfSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Reviews', value: perfSummary.totalReviews ?? '—' },
                { label: 'Avg Self Rating', value: perfSummary.avgSelfRating != null ? perfSummary.avgSelfRating.toFixed(2) : '—' },
                { label: 'Avg Manager Rating', value: perfSummary.avgManagerRating != null ? perfSummary.avgManagerRating.toFixed(2) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="card text-center">
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}
          {ratingDistribution.length > 0 ? (
            <div className="card">
              <h3 className="section-title mb-4">Rating Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="rating" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="count" name="Rating (out of 5)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="card text-center py-16 text-gray-400">
              <TrendingUp size={40} className="mx-auto mb-2 opacity-50" />
              <p>Performance review data not yet available.</p>
              <p className="text-sm mt-1">Metrics appear after managers submit ratings.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Departments Tab ── */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {deptData.length > 0 ? (
            <div className="card">
              <h3 className="section-title mb-4">Department Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dept" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgRating" name="Avg Rating" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completedGoals" name="Completed Goals" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="card text-center py-16 text-gray-400">
              <Users size={40} className="mx-auto mb-2 opacity-50" />
              <p>Department data not yet available.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
