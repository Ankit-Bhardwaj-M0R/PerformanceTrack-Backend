import React, { useState, useEffect } from 'react'
import { BarChart2, Download, RefreshCw, Target, TrendingUp, Users, Award } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import reportService from '../../services/reportService'
import toast from 'react-hot-toast'

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#06b6d4']

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

export default function TeamReportsPage() {
  const [dashboard, setDashboard]       = useState(null)
  const [goalAnalytics, setGoalAnalytics] = useState(null)
  const [perfSummary, setPerfSummary]   = useState(null)
  const [loading, setLoading]           = useState(true)
  const [generating, setGenerating]     = useState(false)
  const [activeTab, setActiveTab]       = useState('overview')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [dash, goals, perf] = await Promise.allSettled([
        reportService.getDashboardMetrics(),
        reportService.getGoalAnalytics(),
        reportService.getPerformanceSummary(),
      ])
      if (dash.status === 'fulfilled')  setDashboard(dash.value?.data || dash.value)
      if (goals.status === 'fulfilled') setGoalAnalytics(goals.value?.data || goals.value)
      if (perf.status === 'fulfilled')  setPerfSummary(perf.value?.data || perf.value)
    } catch {
      toast.error('Failed to load team reports')
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
          { name: 'Completed',  value: dashboard.completedGoals || 0 },
          { name: 'In Progress', value: dashboard.inProgressGoals || 0 },
          { name: 'Pending',    value: dashboard.pendingGoals || 0 },
        ].filter(d => d.value > 0)
      : []

  const ratingData = perfSummary?.avgSelfRating != null || perfSummary?.avgManagerRating != null
    ? [
        { name: 'Avg Self Rating',    value: +(perfSummary?.avgSelfRating || 0).toFixed(2) },
        { name: 'Avg Manager Rating', value: +(perfSummary?.avgManagerRating || 0).toFixed(2) },
      ]
    : []

  const tabs = [
    { id: 'overview',     label: 'Overview' },
    { id: 'goals',        label: 'Goal Analytics' },
    { id: 'performance',  label: 'Performance' },
  ]

  if (loading) return <Layout title="Team Reports"><LoadingSpinner message="Loading team reports..." /></Layout>

  const completionRate = dashboard?.totalGoals
    ? Math.round((dashboard.completedGoals / dashboard.totalGoals) * 100)
    : null

  return (
    <Layout title="Team Reports">
      {/* Generate Buttons */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {['TEAM', 'DEPARTMENT'].map(scope => (
          <button key={scope} onClick={() => handleGenerateReport(scope)}
            disabled={generating}
            className="btn-secondary flex items-center gap-2 text-sm">
            <Download size={16} />
            {generating ? 'Generating...' : `Generate ${scope} Report`}
          </button>
        ))}
        <button onClick={loadAll} className="btn-secondary p-2 ml-auto"><RefreshCw size={16} /></button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map(tab => (
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
            <KpiCard label="Total Team Goals"   value={dashboard?.totalGoals ?? dashboard?.totalTeamGoals} icon={Target}    color="text-blue-600 bg-blue-50" />
            <KpiCard label="Completed Goals"    value={dashboard?.completedGoals}                          icon={Award}     color="text-green-600 bg-green-50" />
            <KpiCard label="Team Size"          value={dashboard?.teamSize}                                icon={Users}     color="text-purple-600 bg-purple-50" />
            <KpiCard label="Completion Rate"    value={completionRate != null ? `${completionRate}%` : '—'} icon={TrendingUp} color="text-orange-600 bg-orange-50" />
          </div>

          {goalStatusData.length > 0 && (
            <div className="card">
              <h3 className="section-title mb-4">Goal Status Distribution</h3>
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
        </div>
      )}

      {/* Goal Analytics Tab */}
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
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
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
          {ratingData.length > 0 ? (
            <div className="card">
              <h3 className="section-title mb-4">Rating Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="value" name="Rating (out of 5)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
