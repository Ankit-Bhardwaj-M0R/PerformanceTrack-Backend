import Modal from '../common/Modal'

/**
 * Submit Completion / Edit & Resubmit Evidence modal (Employee).
 *
 * Props:
 *  isOpen, onClose, title
 *  goal                — selected goal (for context banner)
 *  form, setForm       — { completionNotes, evidenceLink, evidenceLinkDescription }
 *  onSubmit, submitting
 *  managerFeedback     — string shown when editing evidence
 */
export default function CompletionModal({
  isOpen, onClose, title = 'Submit Goal for Completion',
  goal, form, setForm, onSubmit, submitting,
  managerFeedback,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={onSubmit} className="space-y-4">

        {/* Manager feedback on evidence (resubmit mode) */}
        {managerFeedback && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs font-medium text-orange-700 mb-1">Manager's Feedback:</p>
            <p className="text-sm text-orange-800">{managerFeedback}</p>
          </div>
        )}

        {/* Initial submit banner */}
        {!managerFeedback && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            You are submitting <strong>{goal?.title}</strong> for completion review.
            Your manager will verify your work.
          </div>
        )}

        <div>
          <label className="form-label">Completion Notes *</label>
          <textarea
            className="input-field" rows={4}
            value={form.completionNotes}
            onChange={e => setForm({ ...form, completionNotes: e.target.value })}
            placeholder="Describe how you completed this goal and what you achieved..."
            required
          />
        </div>

        <div>
          <label className="form-label">Evidence Link *</label>
          <input
            className="input-field"
            value={form.evidenceLink}
            onChange={e => setForm({ ...form, evidenceLink: e.target.value })}
            placeholder="https://docs.google.com/... or https://github.com/..."
          />
        </div>

        <div>
          <label className="form-label">Evidence Description *</label>
          <input
            className="input-field"
            value={form.evidenceLinkDescription}
            onChange={e => setForm({ ...form, evidenceLinkDescription: e.target.value })}
            placeholder="What does the evidence link contain?"
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={submitting} className="btn-success flex-1">
            {submitting ? 'Submitting...' : managerFeedback ? 'Resubmit Evidence' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
