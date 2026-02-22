import React, { useEffect } from 'react'
import { X } from 'lucide-react'

// ─── MODAL ────────────────────────────────────────────────────────────────────
// A reusable dialog/popup component.
// Closes when pressing Escape or clicking the overlay background.
//
// Usage:
//   <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Goal">
//     <form>...</form>
//   </Modal>
// ─────────────────────────────────────────────────────────────────────────────

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Close modal when user presses Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden' // prevent background scrolling
    }
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Size variants
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    // Dark overlay background
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose} // clicking outside closes modal
      />

      {/* Modal Box */}
      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
