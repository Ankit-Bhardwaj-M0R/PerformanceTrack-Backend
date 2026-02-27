import React from 'react'
import Modal from '../common/Modal'
import type { GoalResponseDTO, ProgressFormState } from '../../types'

/** Progress update modal for an employee on an IN_PROGRESS goal. */
interface ProgressModalProps {
  isOpen: boolean
  onClose: () => void
  goal: GoalResponseDTO | null
  form: ProgressFormState
  setForm: (form: ProgressFormState) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  submitting: boolean
}

export default function ProgressModal({
  isOpen, onClose, goal, form, setForm, onSubmit, submitting,
}: ProgressModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Progress Update">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
          Goal: <strong>{goal?.title}</strong>
        </p>

        <div>
          <label className="form-label">
            Progress Percentage: {form.progressPercentage}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={form.progressPercentage}
            onChange={(e) =>
              setForm({ ...form, progressPercentage: parseInt(e.target.value) })
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label className="form-label">Progress Notes *</label>
          <textarea
            className="input-field"
            rows={4}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Describe what you've accomplished so far..."
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Saving...' : 'Save Progress'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
