import React, { useState, useEffect } from 'react'
import { BarChart2, RefreshCw, Target, TrendingUp, Users, Award } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import KpiCard from '../../components/common/KpiCard'
import {
  GoalStatusPieChart,
  GoalStatusBarChart,
  GoalCategoryPieChart,
  RatingBarChart,
} from '../../components/reports/Charts'
import reportService from '../../services/reportService'
import toast from 'react-hot-toast'
import type { GoalAnalytics, PerformanceSummary } from '../../types'

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'goals',       label: 'Goal Analytics' },
  { id: 'performance', label: 'Performance' },
]

export default function TeamReportsPage(): JSX.Element {
  const [dashboard, setDashboard]         = useState<Record<string, unknown> | null>(null)
  const [goalAnalytics, setGoalAnalytics] = useState<GoalAnalytics | null>(null)
  const [perfSummary, setPerfSummary]     = useState<PerformanceSummary | null>(null)
  const [loading, setLoading]             = useState<boolean>(true)
  const [activeTab, setActiveTab]         = useState<string>('overview')

  useEffect(() => { loadAll() }, [])

  const loadAll = async (): Promise<void> => {
    setLoading(true)
    try {
      const [dash, goals, perf] = await Promise.allSettled([
        reportService.getDashboardMetrics(),
        reportService.getGoalAnalytics(),
        reportService.getPerformanceSummary(),
      ])
      if (dash.status === 'fulfilled')  setDashboard((dash.value as { data?: unknown })?.data as Record<string, unknown> ?? dash.value as Record<string, unknown>)
      if (goals.status === 'fulfilled') setGoalAnalytics((goals.value as { data?: GoalAnalytics })?.data ?? goals.value as GoalAnalytics)
      if (perf.status === 'fulfilled')  setPerfSummary((perf.value as { data?: PerformanceSummary })?.data ?? perf.value as PerformanceSummary)
    } catch {
      toast.error('Failed to load team reports')
    } finally {
      setLoading(false)
    }
  }

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
          { name: 'Completed',   value: (dashboard.completedGoals as number) || 0 },
          { name: 'In Progress', value: (dashboard.inProgressGoals as number) || 0 },
          { name: 'Pending',     value: (dashboard.pendingGoals as number) || 0 },
        ].filter(d => d.value > 0)
      : []

  const ratingData = (perfSummary?.avgSelfRating != null || perfSummary?.avgManagerRating != null)
    ? [
        { name: 'Avg Self Rating',    value: +(perfSummary?.avgSelfRating || 0).toFixed(2) },
        { name: 'Avg Manager Rating', value: +(perfSummary?.avgManagerRating || 0).toFixed(2) },
      ]
    : []

  if (loading) return <Layout title="Team Reports"><LoadingSpinner message="Loading team reports..." /></Layout>

  const completionRate = (dashboard?.totalGoals as number)
    ? Math.round(((dashboard?.completedGoals as number) / (dashboard?.totalGoals as number)) * 100)
    : null

  return (
    <Layout title="Team Reports">
      {/* Page Header Actions */}
      <div className="flex justify-end mb-6">
        <button onClick={loadAll} className="btn-secondary p-2"><RefreshCw size={16} /></button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white shadow-sm text-purple-600' : 'text-gray-600 hover:text-gray-800'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Team Goals"   value={(dashboard?.totalGoals ?? (dashboard as Record<string, unknown>)?.totalTeamGoals) as number | undefined} icon={Target}     color="text-blue-600 bg-blue-50" />
            <KpiCard label="Completed Goals"    value={dashboard?.completedGoals as number | undefined}                                                           icon={Award}      color="text-green-600 bg-green-50" />
            <KpiCard label="Team Size"          value={dashboard?.teamSize as number | undefined}                                                                  icon={Users}      color="text-purple-600 bg-purple-50" />
            <KpiCard label="Completion Rate"    value={completionRate != null ? `${completionRate}%` : undefined}                                                  icon={TrendingUp} color="text-orange-600 bg-orange-50" />
          </div>

          {goalStatusData.length > 0 && (
            <div className="card">
              <h3 className="section-title mb-4">Goal Status Distribution</h3>
              <GoalStatusPieChart data={goalStatusData} />
            </div>
          )}
        </div>
      )}

      {/* Goal Analytics Tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
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
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {perfSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Reviews',      value: perfSummary.totalReviews ?? '—' },
                { label: 'Avg Self Rating',    value: perfSummary.avgSelfRating    != null ? perfSummary.avgSelfRating.toFixed(2)    : '—' },
                { label: 'Avg Manager Rating', value: perfSummary.avgManagerRating != null ? perfSummary.avgManagerRating.toFixed(2) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="card text-center">
                  <p className="text-2xl font-bold text-gray-800">{value}</p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          )}
          {ratingData.length > 0 ? (
            <div className="card">
              <h3 className="section-title mb-4">Rating Comparison</h3>
              <RatingBarChart data={ratingData} yMax={5} fill="#8b5cf6" />
            </div>
          ) : (
            <div className="card text-center py-16 text-gray-400">
              <TrendingUp size={40} className="mx-auto mb-2 opacity-50" />
              <p>Performance review data not yet available.</p>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}
