import React from 'react'
import Modal from '../common/Modal'
import StarRating from '../common/StarRating'
import type { PerformanceReviewResponseDTO, ManagerReviewFormState } from '../../types'

/**
 * Manager review submission modal.
 */
interface ManagerReviewModalProps {
  isOpen: boolean
  onClose: () => void
  review: PerformanceReviewResponseDTO | null
  employeeName?: string
  form: ManagerReviewFormState
  setForm: (form: ManagerReviewFormState) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  submitting: boolean
}

export default function ManagerReviewModal({
  isOpen, onClose, review, employeeName, form, setForm, onSubmit, submitting,
}: ManagerReviewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Manager Review" size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        {employeeName && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-700">
              Employee:{' '}
              <span className="text-blue-700 font-semibold">{employeeName}</span>
            </p>
          </div>
        )}

        {review?.selfAssessment && (
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-blue-700 mb-1">Employee Self-Assessment:</p>
            <p className="text-gray-600">{review.selfAssessment}</p>
            {review.employeeSelfRating && (
              <p className="text-xs text-blue-500 mt-1">
                Self Rating: {review.employeeSelfRating}/5
              </p>
            )}
          </div>
        )}

        <div>
          <label className="form-label">Manager Feedback *</label>
          <textarea
            className="input-field"
            rows={5}
            value={form.managerFeedback}
            onChange={(e) => setForm({ ...form, managerFeedback: e.target.value })}
            placeholder="Provide detailed feedback on this employee's performance..."
          />
        </div>

        <div>
          <label className="form-label">Performance Rating</label>
          <div className="mt-2">
            <StarRating
              value={form.managerRating}
              onChange={(v) => setForm({ ...form, managerRating: v })}
            />
          </div>
        </div>

        <div>
          <label className="form-label">Rating Justification *</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.ratingJustification}
            onChange={(e) => setForm({ ...form, ratingJustification: e.target.value })}
            placeholder="Explain why you gave this rating..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Compensation Recommendations</label>
            <input
              className="input-field"
              value={form.compensationRecommendations}
              onChange={(e) =>
                setForm({ ...form, compensationRecommendations: e.target.value })
              }
              placeholder="e.g., 10% salary increase"
            />
          </div>
          <div>
            <label className="form-label">Goals for Next Period</label>
            <input
              className="input-field"
              value={form.nextPeriodGoals}
              onChange={(e) => setForm({ ...form, nextPeriodGoals: e.target.value })}
              placeholder="Suggest next-cycle goals"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
