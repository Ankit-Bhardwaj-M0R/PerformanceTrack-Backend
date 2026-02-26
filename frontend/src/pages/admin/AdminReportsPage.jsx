import React, { useState, useEffect } from 'react'
import { BarChart2, RefreshCw, Target, TrendingUp, Users, Award, Activity } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import reportService from '../../services/reportService'
import toast from 'react-hot-toast'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

function KpiCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}

export default function AdminReportsPage() {
  const [dashboard, setDashboard]         = useState(null)
  const [goalAnalytics, setGoalAnalytics] = useState(null)
  const [perfSummary, setPerfSummary]     = useState(null)
  const [deptPerformance, setDeptPerformance] = useState(null)
  const [loading, setLoading]             = useState(true)
  const [activeTab, setActiveTab]         = useState('overview')

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
      if (dash.status === 'fulfilled')  setDashboard(dash.value?.data || dash.value)
      if (goals.status === 'fulfilled') setGoalAnalytics(goals.value?.data || goals.value)
      if (perf.status === 'fulfilled')  setPerfSummary(perf.value?.data || perf.value)
      if (dept.status === 'fulfilled')  setDeptPerformance(dept.value?.data || dept.value)
    } catch {
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Goal status data
  const goalStatusData = goalAnalytics
    ? [
        { name: 'Pending',            value: goalAnalytics.pending || 0 },
        { name: 'In Progress',        value: goalAnalytics.inProgress || 0 },
        { name: 'Pending Completion', value: goalAnalytics.pendingCompletion || 0 },
        { name: 'Completed',          value: goalAnalytics.completed || 0 },
        { name: 'Rejected',           value: goalAnalytics.rejected || 0 },
      ].filter(d => d.value > 0)
    : dashboard
      ? [
          { name: 'Completed',   value: dashboard.completedGoals || 0 },
          { name: 'In Progress', value: dashboard.inProgressGoals || 0 },
          { name: 'Pending',     value: dashboard.pendingGoals || 0 },
          { name: 'Rejected',    value: dashboard.rejectedGoals || 0 },
        ].filter(d => d.value > 0)
      : []

  // Department data
  const deptData = Array.isArray(deptPerformance)
    ? deptPerformance.map(d => ({
        dept: (d.department || '').length > 12 ? d.department.substring(0, 12) + '…' : (d.department || ''),
        avgRating: +(d.avgRating || 0).toFixed(2),
        completedGoals: d.completedGoals || 0,
        employeeCount: d.employeeCount || 0,
      }))
    : deptPerformance?.departments
      ? Object.entries(deptPerformance.departments).map(([dept, data]) => ({
          dept: dept.length > 12 ? dept.substring(0, 12) + '…' : dept,
          avgRating: +(data.avgRating || 0).toFixed(2),
          completedGoals: data.completedGoals || 0,
          employeeCount: data.employeeCount || 0,
        }))
      : []

  // Rating data
  const ratingDistribution = perfSummary?.ratingDistribution
    ? Object.entries(perfSummary.ratingDistribution).map(([rating, count]) => ({ rating: `${rating}★`, count }))
    : perfSummary?.avgSelfRating != null || perfSummary?.avgManagerRating != null
      ? [
          { rating: 'Avg Self Rating',    count: +(perfSummary.avgSelfRating || 0).toFixed(2) },
          { rating: 'Avg Manager Rating', count: +(perfSummary.avgManagerRating || 0).toFixed(2) },
        ].filter(d => d.count > 0)
      : []

  const completionRate = dashboard?.totalGoals
    ? Math.round((dashboard.completedGoals / dashboard.totalGoals) * 100)
    : null

  const tabs = [
    { id: 'overview',     label: 'Overview' },
    { id: 'goals',        label: 'Goal Analytics' },
    { id: 'performance',  label: 'Performance Summary' },
    { id: 'departments',  label: 'Departments' },
  ]

  if (loading) return <Layout title="Reports & Analytics"><LoadingSpinner message="Loading analytics..." /></Layout>

  return (
    <Layout title="Reports & Analytics">
      {/* Page Header Actions */}
      <div className="flex justify-end mb-6">
        <button onClick={loadAll} className="btn-secondary p-2"><RefreshCw size={16} /></button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white shadow-sm text-red-600' : 'text-gray-600 hover:text-gray-800'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Users"    value={dashboard?.totalUsers}    icon={Users}     color="text-purple-600 bg-purple-50" />
            <KpiCard label="Total Goals"    value={dashboard?.totalGoals}    icon={Target}    color="text-blue-600 bg-blue-50" />
            <KpiCard label="Total Reviews"  value={dashboard?.totalReviews ?? perfSummary?.totalReviews} icon={Activity} color="text-indigo-600 bg-indigo-50" />
            <KpiCard label="Completion Rate" value={completionRate != null ? `${completionRate}%` : '—'} icon={TrendingUp} color="text-green-600 bg-green-50" />
          </div>

          {goalStatusData.length > 0 && (
            <div className="card">
              <h3 className="section-title mb-4">Company-Wide Goal Status Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={goalStatusData} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {goalStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {deptData.length > 0 && (
            <div className="card">
              <h3 className="section-title mb-4">Department Overview</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {['Department', 'Employees', 'Completed Goals', 'Avg Rating'].map(h => (
                        <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-gray-600 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {deptData.map((d, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{d.dept}</td>
                        <td className="px-4 py-3 text-gray-600">{d.employeeCount || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{d.completedGoals}</td>
                        <td className="px-4 py-3 text-gray-600">{d.avgRating > 0 ? `${d.avgRating}/5` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Goal Analytics Tab — getGoalAnalytics() */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Goals"    value={goalAnalytics ? (goalAnalytics.pending || 0) + (goalAnalytics.inProgress || 0) + (goalAnalytics.pendingCompletion || 0) + (goalAnalytics.completed || 0) + (goalAnalytics.rejected || 0) : dashboard?.totalGoals} icon={Target} color="text-blue-600 bg-blue-50" />
            <KpiCard label="Completed"      value={goalAnalytics?.completed ?? dashboard?.completedGoals}  icon={Award}     color="text-green-600 bg-green-50" />
            <KpiCard label="In Progress"    value={goalAnalytics?.inProgress ?? dashboard?.inProgressGoals} icon={TrendingUp} color="text-indigo-600 bg-indigo-50" />
            <KpiCard label="Pending"        value={goalAnalytics?.pending ?? dashboard?.pendingGoals}       icon={Activity}  color="text-yellow-600 bg-yellow-50" />
          </div>

          {/* Status Breakdown Bar Chart */}
          <div className="card">
            <h3 className="section-title mb-4">Goal Status Breakdown</h3>
            {goalStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={goalStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
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

          {/* Category Breakdown */}
          {goalAnalytics?.categoryBreakdown && (
            <div className="card">
              <h3 className="section-title mb-4">Goals by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={Object.entries(goalAnalytics.categoryBreakdown).map(([name, value]) => ({ name, value }))}
                    dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}>
                    {Object.keys(goalAnalytics.categoryBreakdown).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Completion Rate */}
          {completionRate !== null && (
            <div className="card">
              <h3 className="section-title mb-3">Goal Completion Rate</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all"
                    style={{ width: `${completionRate}%` }} />
                </div>
                <span className="text-2xl font-bold text-green-600">{completionRate}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Summary Tab — getPerformanceSummary() */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {perfSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Reviews',      value: perfSummary.totalReviews ?? '—' },
                { label: 'Avg Self Rating',    value: perfSummary.avgSelfRating != null ? perfSummary.avgSelfRating.toFixed(2) : '—' },
                { label: 'Avg Manager Rating', value: perfSummary.avgManagerRating != null ? perfSummary.avgManagerRating.toFixed(2) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="card text-center">
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Rating comparison/distribution chart */}
          {ratingDistribution.length > 0 ? (
            <div className="card">
              <h3 className="section-title mb-4">Rating Comparison (Self vs Manager)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="rating" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="count" name="Rating (out of 5)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
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

      {/* Department Performance Tab — getDepartmentPerformance() */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {deptData.length > 0 ? (
            <>
              {/* Grouped Bar Chart */}
              <div className="card">
                <h3 className="section-title mb-4">Cross-Department Comparison</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={deptData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="dept" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgRating"      name="Avg Rating"       fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completedGoals" name="Completed Goals"  fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Department Table */}
              <div className="card p-0 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="section-title">Department Details</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Department', 'Employees', 'Completed Goals', 'Avg Rating'].map(h => (
                          <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {deptData.map((d, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-800">{d.dept}</td>
                          <td className="px-6 py-4 text-gray-600">{d.employeeCount || '—'}</td>
                          <td className="px-6 py-4 text-gray-600">{d.completedGoals}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(d.avgRating / 5) * 100}%` }} />
                              </div>
                              <span className="text-gray-600">{d.avgRating > 0 ? `${d.avgRating}/5` : '—'}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
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
