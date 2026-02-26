import { BarChart2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

/**
 * Renders a Pie chart of goal statuses.
 * props: data — [{ name, value }]
 */
export function GoalStatusPieChart({ data }) {
  if (!data || data.length === 0) return (
    <div className="text-center py-12 text-gray-400">
      <BarChart2 size={40} className="mx-auto mb-2 opacity-50" />
      <p>No goal data available yet</p>
    </div>
  )
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data} dataKey="value" nameKey="name"
          cx="50%" cy="50%" outerRadius={100}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

/**
 * Renders a Bar chart of goal statuses.
 * props: data — [{ name, value }]
 */
export function GoalStatusBarChart({ data }) {
  if (!data || data.length === 0) return (
    <div className="text-center py-12 text-gray-400">
      <BarChart2 size={40} className="mx-auto mb-2 opacity-50" />
      <p>No goal data available yet</p>
    </div>
  )
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * Goals by category — Pie chart.
 * props: categoryBreakdown — { TECHNICAL: 4, BEHAVIORAL: 2, ... }
 */
export function GoalCategoryPieChart({ categoryBreakdown }) {
  if (!categoryBreakdown) return null
  const data = Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
          label={({ name, value }) => `${name}: ${value}`}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip /><Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

/**
 * Rating comparison bar chart.
 * props: data — [{ rating/name, count/value }]
 *        yMax — optional Y-axis max (default 5)
 *        fill — bar colour (default #3b82f6)
 */
export function RatingBarChart({ data, yMax = 5, fill = '#3b82f6' }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={data[0]?.rating !== undefined ? 'rating' : 'name'} />
        <YAxis domain={[0, yMax]} />
        <Tooltip />
        <Bar dataKey={data[0]?.count !== undefined ? 'count' : 'value'}
          name="Rating (out of 5)" fill={fill} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * Dept comparison grouped bar chart.
 * props: data — [{ dept, avgRating, completedGoals }]
 */
export function DeptBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="dept" tick={{ fontSize: 12 }} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="avgRating"      name="Avg Rating"      fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="completedGoals" name="Completed Goals" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
