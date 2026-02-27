import React from 'react'

// ─── LOADING SPINNER ──────────────────────────────────────────────────────────
// Shows a spinning circle while data is loading from the API.
// Usage:
//   <LoadingSpinner />             → full page centered spinner
//   <LoadingSpinner inline />      → small inline spinner
// ─────────────────────────────────────────────────────────────────────────────

interface LoadingSpinnerProps {
  inline?: boolean
  message?: string
}

export default function LoadingSpinner({
  inline = false,
  message = 'Loading...',
}: LoadingSpinnerProps) {
  if (inline) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
        <span>{message}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}
