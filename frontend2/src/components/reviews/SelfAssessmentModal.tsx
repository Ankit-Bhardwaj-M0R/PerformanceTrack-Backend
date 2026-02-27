import React from 'react'
import Modal from '../common/Modal'
import StarRating from '../common/StarRating'
import type { ReviewCycle, SelfAssessmentFormState } from '../../types'

/**
 * Employee self-assessment submission modal.
 */
interface SelfAssessmentModalProps {
  isOpen: boolean
  onClose: () => void
  activeCycle: ReviewCycle | null
  form: SelfAssessmentFormState
  setForm: (form: SelfAssessmentFormState) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  submitting: boolean
}

export default function SelfAssessmentModal({
  isOpen, onClose, activeCycle, form, setForm, onSubmit, submitting,
}: SelfAssessmentModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Self-Assessment" size="lg">
      <form onSubmit={onSubmit} className="space-y-5">
        {activeCycle && (
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
            Review Cycle: <strong>{activeCycle.title}</strong>
          </div>
        )}

        <div>
          <label className="form-label">Self-Assessment *</label>
          <p className="text-xs text-gray-500 mb-2">
            Reflect on your performance this cycle. What did you accomplish? What challenges
            did you face?
          </p>
          <textarea
            className="input-field"
            rows={6}
            value={form.selfAssessment}
            onChange={(e) => setForm({ ...form, selfAssessment: e.target.value })}
            placeholder="Describe your achievements, learnings, and areas for growth..."
          />
        </div>

        <div>
          <label className="form-label">Self Rating</label>
          <div className="mt-2">
            <StarRating
              value={form.employeeSelfRating}
              onChange={(v) => setForm({ ...form, employeeSelfRating: v })}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
