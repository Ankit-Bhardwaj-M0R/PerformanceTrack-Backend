import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// ─── PAGINATION ───────────────────────────────────────────────────────────────
// Controls for navigating between pages of data.
// Works with Spring's pageable API responses.
//
// Usage:
//   <Pagination
//     currentPage={0}           ← Spring uses 0-based page index
//     totalPages={5}
//     onPageChange={(p) => setPage(p)}
//   />
// ─────────────────────────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalElements?: number
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalElements,
}: PaginationProps) {
  if (totalPages <= 1) return null // Don't show pagination for single page

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
      {/* Info text */}
      <p className="text-sm text-gray-600">
        Page {currentPage + 1} of {totalPages}
        {totalElements !== undefined && ` (${totalElements} total)`}
      </p>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page number buttons */}
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          // Show pages around the current page
          let page = i
          if (totalPages > 5) {
            if (currentPage < 3) page = i
            else if (currentPage > totalPages - 3) page = totalPages - 5 + i
            else page = currentPage - 2 + i
          }
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page + 1}
            </button>
          )
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
