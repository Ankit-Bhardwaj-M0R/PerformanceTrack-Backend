import { Star } from 'lucide-react'
import Modal from '../common/Modal'

/**
 * Employee acknowledge review modal.
 *
 * Props:
 *  isOpen, onClose
 *  review             — selected review
 *  form, setForm      — { employeeResponse }
 *  onSubmit, submitting
 */
export default function AcknowledgeModal({ isOpen, onClose, review, form, setForm, onSubmit, submitting }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Acknowledge Manager Review">
      <form onSubmit={onSubmit} className="space-y-4">
        {review && (
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-gray-700">Manager Feedback:</p>
              <p className="text-gray-600 mt-1">{review.managerFeedback}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star size={16} className="text-yellow-400" />
              Manager Rating: <strong>{review.managerRating}/5</strong>
            </div>
          </div>
        )}

        <div>
          <label className="form-label">Your Response (optional)</label>
          <textarea
            className="input-field" rows={4}
            value={form.employeeResponse}
            onChange={e => setForm({ ...form, employeeResponse: e.target.value })}
            placeholder="Share any thoughts or comments on this review..."
          />
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          By acknowledging, you confirm you have read and understood the review.
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-success flex-1">
            {submitting ? 'Processing...' : 'Acknowledge Review'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
