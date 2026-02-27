import React from 'react'
import Modal from '../common/Modal'
import type { GoalResponseDTO, EvidenceFormState } from '../../types'

/**
 * Evidence verification modal (Manager).
 */
interface EvidenceModalProps {
  isOpen: boolean
  onClose: () => void
  goal: GoalResponseDTO | null
  form: EvidenceFormState
  setForm: (form: EvidenceFormState) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  submitting: boolean
}

export default function EvidenceModal({
  isOpen, onClose, goal, form, setForm, onSubmit, submitting,
}: EvidenceModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Verify Evidence">
      <form onSubmit={onSubmit} className="space-y-4">

        {goal?.evidenceLink && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-700 mb-1">Evidence Link:</p>
            <a
              href={goal.evidenceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {goal.evidenceLink}
            </a>
            {goal.evidenceLinkDescription && (
              <p className="text-xs text-blue-600 mt-1">{goal.evidenceLinkDescription}</p>
            )}
          </div>
        )}

        <div>
          <label className="form-label">Verification Decision</label>
          <select
            className="input-field"
            value={form.verificationStatus}
            onChange={(e) => setForm({ ...form, verificationStatus: e.target.value })}
          >
            <option value="VERIFIED">Verified — Evidence is acceptable</option>
            <option value="NEEDS_ADDITIONAL_LINK">
              Needs Additional Link — More work needed
            </option>
            <option value="REJECTED">Rejected — Evidence does not meet requirements</option>
          </select>
        </div>

        <div>
          <label className="form-label">Notes</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Add notes about your verification decision..."
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Submitting...' : 'Submit Verification'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
