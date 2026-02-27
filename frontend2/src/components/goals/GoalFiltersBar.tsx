import React, { ReactNode } from 'react'
import { Search } from 'lucide-react'

const GOAL_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const GOAL_CATEGORIES = ['TECHNICAL', 'BEHAVIORAL', 'PROFESSIONAL_DEVELOPMENT', 'OTHER']

/**
 * Search + filter toolbar for any goal list.
 */
interface GoalFiltersBarProps {
  searchTerm: string
  setSearchTerm: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  priorityFilter: string
  setPriorityFilter: (v: string) => void
  categoryFilter: string
  setCategoryFilter: (v: string) => void
  onClear: () => void
  extra?: ReactNode
}

export default function GoalFiltersBar({
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  priorityFilter, setPriorityFilter,
  categoryFilter, setCategoryFilter,
  onClear,
  extra,
}: GoalFiltersBarProps) {
  const hasFilters = statusFilter || priorityFilter || categoryFilter || searchTerm

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search goals by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="PENDING_COMPLETION_APPROVAL">Pending Completion</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* Priority */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Priorities</option>
          {GOAL_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All Categories</option>
          {GOAL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button onClick={onClear} className="btn-secondary text-xs px-3">
            Clear
          </button>
        )}

        {extra}
      </div>

      {/* Active filter chips */}
      {(statusFilter || priorityFilter || categoryFilter) && (
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          {statusFilter && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Status: {statusFilter}
            </span>
          )}
          {priorityFilter && (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
              Priority: {priorityFilter}
            </span>
          )}
          {categoryFilter && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Category: {categoryFilter}
            </span>
          )}
        </div>
      )}
    </>
  )
}
