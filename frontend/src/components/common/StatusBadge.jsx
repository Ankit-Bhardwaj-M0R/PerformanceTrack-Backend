import React from 'react'

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
// Colored label pill to display status values.
// Different colors for different statuses make it easy to scan at a glance.
//
// Usage:
//   <StatusBadge status="IN_PROGRESS" />
//   <StatusBadge status="COMPLETED" />
// ─────────────────────────────────────────────────────────────────────────────

// Map every possible status to a Tailwind color class
const STATUS_COLORS = {
  // Goal statuses
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  PENDING_COMPLETION_APPROVAL: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',

  // Review statuses (actual backend PerformanceReviewStatus enum values)
  SELF_ASSESSMENT_COMPLETED: 'bg-indigo-100 text-indigo-800',
  MANAGER_REVIEW_COMPLETED: 'bg-teal-100 text-teal-800',
  COMPLETED_AND_ACKNOWLEDGED: 'bg-green-100 text-green-800',
  // Legacy / fallback aliases
  SUBMITTED: 'bg-blue-100 text-blue-800',
  ACKNOWLEDGED: 'bg-green-100 text-green-800',

  // Completion approval statuses
  APPROVED: 'bg-green-100 text-green-800',

  // Evidence verification statuses
  VERIFIED: 'bg-green-100 text-green-800',
  NEEDS_ADDITIONAL_LINK: 'bg-orange-100 text-orange-800',

  // Review cycle statuses
  ACTIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-700',
  UPCOMING: 'bg-blue-100 text-blue-800',

  // Notification statuses
  UNREAD: 'bg-blue-100 text-blue-800',
  READ: 'bg-gray-100 text-gray-600',

  // User statuses
  INACTIVE: 'bg-red-100 text-red-700',

  // User roles
  ADMIN: 'bg-red-100 text-red-700',
  MANAGER: 'bg-purple-100 text-purple-700',
  EMPLOYEE: 'bg-green-100 text-green-700',
}

// Human-readable labels
const STATUS_LABELS = {
  PENDING_COMPLETION_APPROVAL: 'Pending Approval',
  IN_PROGRESS: 'In Progress',
  SELF_ASSESSMENT_COMPLETED: 'Self-Assessment Done',
  MANAGER_REVIEW_COMPLETED: 'Manager Reviewed',
  COMPLETED_AND_ACKNOWLEDGED: 'Acknowledged',
}

export default function StatusBadge({ status }) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'
  const label = STATUS_LABELS[status] || status?.replace(/_/g, ' ')

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  )
}
