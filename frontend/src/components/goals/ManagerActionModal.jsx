import Modal from '../common/Modal'

const ACTION_TITLES = {
  APPROVE:            'Approve Goal',
  REQUEST_CHANGES:    'Request Changes',
  APPROVE_COMPLETION: 'Approve Completion',
  REJECT_COMPLETION:  'Reject Completion',
  REQUEST_EVIDENCE:   'Request Additional Evidence',
}

/**
 * Manager action modal — approve / reject / request-changes / request-evidence.
 *
 * Props:
 *  isOpen, onClose, actionType
 *  goal                     — selected goal
 *  form, setForm            — { comments, message }
 *  onSubmit, submitting
 */
export default function ManagerActionModal({ isOpen, onClose, actionType, goal, form, setForm, onSubmit, submitting }) {
  const title = ACTION_TITLES[actionType] || 'Manager Action'

  const btnClass =
    actionType === 'REJECT_COMPLETION'                                    ? 'btn-danger' :
    actionType === 'APPROVE' || actionType === 'APPROVE_COMPLETION'       ? 'btn-success' :
                                                                            'btn-primary'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          Goal: <strong>{goal?.title}</strong>
        </p>

        {actionType === 'APPROVE' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            This will approve the goal and allow the employee to start working on it.
          </div>
        ) : (
          <div>
            <label className="form-label">
              {actionType === 'REQUEST_EVIDENCE' ? 'Message to Employee *' : 'Comments / Reason *'}
            </label>
            <textarea
              className="input-field" rows={4}
              value={actionType === 'REQUEST_EVIDENCE' ? form.message : form.comments}
              onChange={e => setForm(
                actionType === 'REQUEST_EVIDENCE'
                  ? { ...form, message: e.target.value }
                  : { ...form, comments: e.target.value }
              )}
              placeholder={
                actionType === 'REQUEST_CHANGES'    ? 'Describe what needs to be changed...' :
                actionType === 'APPROVE_COMPLETION' ? 'Optional: Add completion comments...' :
                actionType === 'REJECT_COMPLETION'  ? 'Explain why the completion is rejected...' :
                                                      'Describe what additional evidence is needed...'
              }
            />
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={submitting} className={`flex-1 ${btnClass}`}>
            {submitting ? 'Processing...' : title}
          </button>
        </div>
      </form>
    </Modal>
  )
}
