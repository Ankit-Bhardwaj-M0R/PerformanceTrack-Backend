import React, { ReactNode } from 'react'
import Modal from '../common/Modal'
import type { GoalFormState, FeedbackResponseDTO } from '../../types'

const GOAL_CATEGORIES = ['TECHNICAL', 'BEHAVIORAL', 'PROFESSIONAL_DEVELOPMENT', 'OTHER']
const GOAL_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

/**
 * Reusable Create / Edit goal form modal.
 */
interface GoalFormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  form: GoalFormState
  setForm: (form: GoalFormState) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  submitting: boolean
  managerId?: number | null
  managerFeedback?: FeedbackResponseDTO[]
}

export default function GoalFormModal({
  isOpen, onClose, title,
  form, setForm,
  onSubmit, submitting,
  managerId,
  managerFeedback = [],
}: GoalFormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={onSubmit} className="space-y-4">

        {/* Manager feedback (edit mode only) */}
        {managerFeedback.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-medium text-orange-700 mb-1">Manager's Feedback:</p>
            {managerFeedback.map((fb, idx) => (
              <div key={idx} className="text-sm text-orange-800">
                <p className="font-medium">{fb.givenByUserName || 'Manager'}</p>
                <p>{fb.comments}</p>
                {fb.date && (
                  <p className="text-xs text-orange-600 mt-1">
                    {new Date(fb.date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="form-label">Goal Title *</label>
          <input
            className="input-field"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Complete React certification"
          />
        </div>

        <div>
          <label className="form-label">Description</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe what you plan to accomplish..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Category</label>
            <select
              className="input-field"
              value={form.category as string}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {GOAL_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Priority</label>
            <select
              className="input-field"
              value={form.priority as string}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              {GOAL_PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="input-field"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">End Date (Deadline)</label>
            <input
              type="date"
              className="input-field"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>

        {managerId && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <span className="font-medium">Assigned Manager ID: </span>
            {managerId}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Saving...' : 'Save Goal'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
