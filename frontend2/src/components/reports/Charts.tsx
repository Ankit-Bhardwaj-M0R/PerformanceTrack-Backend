import React from 'react'
import { BarChart2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { ChartDataPoint, RatingDataPoint, DeptChartData } from '../../types'

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316',
]

// ─── GOAL STATUS PIE CHART ────────────────────────────────────────────────────

interface GoalStatusPieChartProps {
  data: ChartDataPoint[]
}

export function GoalStatusPieChart({ data }: GoalStatusPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <BarChart2 size={40} className="mx-auto mb-2 opacity-50" />
        <p>No goal data available yet</p>
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }: { name: string; percent: number }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ─── GOAL STATUS BAR CHART ────────────────────────────────────────────────────

export function GoalStatusBarChart({ data }: GoalStatusPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <BarChart2 size={40} className="mx-auto mb-2 opacity-50" />
        <p>No goal data available yet</p>
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" radius={[4, 4, 0, 0] as [number, number, number, number]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── GOAL CATEGORY PIE CHART ──────────────────────────────────────────────────

interface GoalCategoryPieChartProps {
  categoryBreakdown: Record<string, number> | null | undefined
}

export function GoalCategoryPieChart({ categoryBreakdown }: GoalCategoryPieChartProps) {
  if (!categoryBreakdown) return null
  const data: ChartDataPoint[] = Object.entries(categoryBreakdown).map(([name, value]) => ({
    name,
    value,
  }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ─── RATING BAR CHART ─────────────────────────────────────────────────────────

interface RatingBarChartProps {
  data: RatingDataPoint[] | ChartDataPoint[]
  yMax?: number
  fill?: string
}

export function RatingBarChart({ data, yMax = 5, fill = '#3b82f6' }: RatingBarChartProps) {
  const hasRating = (data[0] as RatingDataPoint)?.rating !== undefined
  const hasCount = (data[0] as RatingDataPoint)?.count !== undefined
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={hasRating ? 'rating' : 'name'} />
        <YAxis domain={[0, yMax]} />
        <Tooltip />
        <Bar
          dataKey={hasCount ? 'count' : 'value'}
          name="Rating (out of 5)"
          fill={fill}
          radius={[4, 4, 0, 0] as [number, number, number, number]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── DEPT BAR CHART ───────────────────────────────────────────────────────────

interface DeptBarChartProps {
  data: DeptChartData[]
}

export function DeptBarChart({ data }: DeptBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="dept" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="avgRating"
          name="Avg Rating"
          fill="#3b82f6"
          radius={[4, 4, 0, 0] as [number, number, number, number]}
        />
        <Bar
          dataKey="completedGoals"
          name="Completed Goals"
          fill="#10b981"
          radius={[4, 4, 0, 0] as [number, number, number, number]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
