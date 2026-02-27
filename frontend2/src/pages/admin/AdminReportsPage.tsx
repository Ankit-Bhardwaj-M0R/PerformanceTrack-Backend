import React, { useState, useEffect } from 'react'
import { BarChart2, RefreshCw, Target, TrendingUp, Users, Award, Activity } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import KpiCard from '../../components/common/KpiCard'
import {
  GoalStatusPieChart, GoalStatusBarChart, GoalCategoryPieChart,
  RatingBarChart, DeptBarChart,
} from '../../components/reports/Charts'
import reportService from '../../services/reportService'
import toast from 'react-hot-toast'
import type {
  DashboardMetrics, GoalAnalytics, PerformanceSummary,
  ChartDataPoint, RatingDataPoint, DeptChartData,
} from '../../types'

interface Tab { id: string; label: string }

export default function AdminReportsPage(): JSX.Element {
  const [dashboard, setDashboard]         = useState<DashboardMetrics | null>(null)
  const [goalAnalytics, setGoalAnalytics] = useState<GoalAnalytics | null>(null)
  const [perfSummary, setPerfSummary]     = useState<PerformanceSummary | null>(null)
  const [deptPerformance, setDeptPerformance] = useState<unknown>(null)
  const [loading, setLoading]             = useState<boolean>(true)
  const [activeTab, setActiveTab]         = useState<string>('overview')

  useEffect(() => { loadAll() }, [])

  const loadAll = async (): Promise<void> => {
    setLoading(true)
    try {
      const [dash, goals, perf, dept] = await Promise.allSettled([
        reportService.getDashboardMetrics(),
        reportService.getGoalAnalytics(),
        reportService.getPerformanceSummary(),
        reportService.getDepartmentPerformance(),
      ])
      if (dash.status === 'fulfilled')  setDashboard((dash.value as { data?: DashboardMetrics } & DashboardMetrics).data ?? dash.value as DashboardMetrics)
      if (goals.status === 'fulfilled') setGoalAnalytics((goals.value as { data?: GoalAnalytics } & GoalAnalytics).data ?? goals.value as GoalAnalytics)
      if (perf.status === 'fulfilled')  setPerfSummary((perf.value as { data?: PerformanceSummary } & PerformanceSummary).data ?? perf.value as PerformanceSummary)
      if (dept.status === 'fulfilled')  setDeptPerformance((dept.value as { data?: unknown } & unknown) ?? dept.value)
    } catch {
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  // Goal status data
  const goalStatusData: ChartDataPoint[] = goalAnalytics
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
  type DeptEntry = { department?: string; avgRating?: number; completedGoals?: number; employeeCount?: number }

  const deptData: DeptChartData[] = Array.isArray(deptPerformance)
    ? (deptPerformance as DeptEntry[]).map(d => ({
        dept: (d.department || '').length > 12 ? d.department!.substring(0, 12) + '…' : (d.department || ''),
        avgRating: +(d.avgRating || 0).toFixed(2),
        completedGoals: d.completedGoals || 0,
        employeeCount: d.employeeCount || 0,
      }))
    : (deptPerformance as { departments?: Record<string, DeptEntry> } | null)?.departments
      ? Object.entries((deptPerformance as { departments: Record<string, DeptEntry> }).departments).map(([dept, data]) => ({
          dept: dept.length > 12 ? dept.substring(0, 12) + '…' : dept,
          avgRating: +(data.avgRating || 0).toFixed(2),
          completedGoals: data.completedGoals || 0,
          employeeCount: data.employeeCount || 0,
        }))
      : []

  // Rating distribution
  const ratingDistribution: RatingDataPoint[] = perfSummary?.ratingDistribution
    ? Object.entries(perfSummary.ratingDistribution).map(([rating, count]) => ({ rating: `${rating}★`, count: count as number }))
    : perfSummary?.avgSelfRating != null || perfSummary?.avgManagerRating != null
      ? [
          { rating: 'Avg Self Rating',    count: +(perfSummary?.avgSelfRating || 0).toFixed(2) },
          { rating: 'Avg Manager Rating', count: +(perfSummary?.avgManagerRating || 0).toFixed(2) },
        ].filter(d => d.count > 0)
      : []

  const completionRate = dashboard?.totalGoals
    ? Math.round(((dashboard.completedGoals ?? 0) / dashboard.totalGoals) * 100)
    : null

  const tabs: Tab[] = [
    { id: 'overview',    label: 'Overview' },
    { id: 'goals',       label: 'Goal Analytics' },
    { id: 'performance', label: 'Performance Summary' },
    { id: 'departments', label: 'Departments' },
  ]

  if (loading) return <Layout title="Reports & Analytics"><LoadingSpinner message="Loading analytics..." /></Layout>

  return (
    <Layout title="Reports & Analytics">
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
            <KpiCard label="Total Users"    value={dashboard?.totalUsers}    icon={Users}    color="text-purple-600 bg-purple-50" />
            <KpiCard label="Total Goals"    value={dashboard?.totalGoals}    icon={Target}   color="text-blue-600 bg-blue-50" />
            <KpiCard label="Total Reviews"  value={dashboard?.totalReviews ?? perfSummary?.totalReviews} icon={Activity} color="text-indigo-600 bg-indigo-50" />
            <KpiCard label="Completion Rate" value={completionRate != null ? `${completionRate}%` : '—'} icon={TrendingUp} color="text-green-600 bg-green-50" />
          </div>

          {goalStatusData.length > 0 && (
            <div className="card">
              <h3 className="section-title mb-4">Company-Wide Goal Status Distribution</h3>
              <GoalStatusPieChart data={goalStatusData} />
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

      {/* Goal Analytics Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Goals"  value={goalAnalytics ? (goalAnalytics.pending || 0) + (goalAnalytics.inProgress || 0) + (goalAnalytics.pendingCompletion || 0) + (goalAnalytics.completed || 0) + (goalAnalytics.rejected || 0) : dashboard?.totalGoals} icon={Target} color="text-blue-600 bg-blue-50" />
            <KpiCard label="Completed"    value={goalAnalytics?.completed ?? dashboard?.completedGoals}   icon={Award}     color="text-green-600 bg-green-50" />
            <KpiCard label="In Progress"  value={goalAnalytics?.inProgress ?? dashboard?.inProgressGoals} icon={TrendingUp} color="text-indigo-600 bg-indigo-50" />
            <KpiCard label="Pending"      value={goalAnalytics?.pending ?? dashboard?.pendingGoals}        icon={Activity}  color="text-yellow-600 bg-yellow-50" />
          </div>

          <div className="card">
            <h3 className="section-title mb-4">Goal Status Breakdown</h3>
            {goalStatusData.length > 0 ? (
              <GoalStatusBarChart data={goalStatusData} />
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
              <GoalCategoryPieChart categoryBreakdown={goalAnalytics.categoryBreakdown} />
            </div>
          )}

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

      {/* Performance Summary Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {perfSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Reviews',      value: perfSummary.totalReviews ?? '—' },
                { label: 'Avg Self Rating',    value: perfSummary.avgSelfRating != null ? (perfSummary.avgSelfRating as number).toFixed(2) : '—' },
                { label: 'Avg Manager Rating', value: perfSummary.avgManagerRating != null ? (perfSummary.avgManagerRating as number).toFixed(2) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="card text-center">
                  <p className="text-2xl font-bold text-gray-800">{String(value)}</p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}

          {ratingDistribution.length > 0 ? (
            <div className="card">
              <h3 className="section-title mb-4">Rating Comparison (Self vs Manager)</h3>
              <RatingBarChart data={ratingDistribution} yMax={5} fill="#3b82f6" />
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

      {/* Department Performance Tab */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          {deptData.length > 0 ? (
            <>
              <div className="card">
                <h3 className="section-title mb-4">Cross-Department Comparison</h3>
                <DeptBarChart data={deptData} />
              </div>

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
