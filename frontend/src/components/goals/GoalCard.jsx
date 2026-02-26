import { useState } from 'react'
import {
  ChevronDown, Edit2, Trash2, CheckCircle, XCircle,
  MessageSquare, Upload, Eye, TrendingUp,
} from 'lucide-react'
import StatusBadge from '../common/StatusBadge'

const priorityColors = {
  CRITICAL: 'border-l-red-500',
  HIGH:     'border-l-orange-400',
  MEDIUM:   'border-l-yellow-400',
  LOW:      'border-l-green-400',
}

/**
 * Single goal card with expand/collapse and all role-based action buttons.
 *
 * Props:
 *  goal, user, isManager, isEmployee, isAdmin
 *  onAddProgress, onSubmitCompletion, onEditGoal, onEditEvidence
 *  onApprove, onRequestChanges, onApproveCompletion, onRejectCompletion
 *  onRequestEvidence, onVerifyEvidence, onDelete
 */
export default function GoalCard({
  goal, user, isManager, isEmployee,
  onAddProgress, onSubmitCompletion, onEditGoal, onEditEvidence,
  onApprove, onRequestChanges, onApproveCompletion, onRejectCompletion,
  onRequestEvidence, onVerifyEvidence, onDelete,
}) {
  const [expanded, setExpanded] = useState(false)

  const isMyGoal      = goal.assignedToUserId === user?.userId
  const isMyTeamGoal  = goal.assignedManagerId === user?.userId

  return (
    <div className={`card border-l-4 ${priorityColors[goal.priority] || 'border-l-gray-300'} hover:shadow-md transition-shadow`}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{goal.title}</h3>
            <StatusBadge status={goal.status} />
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {goal.priority}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
            <span>Category: {goal.category}</span>
            {goal.endDate   && <span>Due: {goal.endDate}</span>}
            {goal.startDate && <span>Started: {goal.startDate}</span>}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <ChevronDown size={20} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* ── Expanded Details ── */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {goal.description && <p className="text-sm text-gray-600">{goal.description}</p>}

          {goal.progressNotes && (
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-700 mb-1">Progress Notes:</p>
              <p className="text-sm text-blue-800">{goal.progressNotes}</p>
            </div>
          )}

          {goal.completionNotes && (
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs font-medium text-green-700 mb-1">Completion Notes:</p>
              <p className="text-sm text-green-800">{goal.completionNotes}</p>
            </div>
          )}

          {goal.evidenceLink && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-1">Evidence:</p>
              <a href={goal.evidenceLink} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all">
                {goal.evidenceLink}
              </a>
              {goal.evidenceLinkVerificationStatus && (
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    goal.evidenceLinkVerificationStatus === 'VERIFIED'             ? 'bg-green-100 text-green-700' :
                    goal.evidenceLinkVerificationStatus === 'REJECTED'             ? 'bg-red-100 text-red-700' :
                                                                                     'bg-orange-100 text-orange-700'
                  }`}>
                    Evidence: {goal.evidenceLinkVerificationStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
              {goal.evidenceLinkVerificationNotes && (
                <p className="text-xs text-gray-600 mt-2">
                  <span className="font-medium">Verification Notes:</span> {goal.evidenceLinkVerificationNotes}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">

        {/* EMPLOYEE actions */}
        {isEmployee && isMyGoal && (
          <>
            {goal.status === 'PENDING' && goal.requestChanges && (
              <button onClick={onEditGoal} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                <Edit2 size={14} /> Edit Goal
              </button>
            )}
            {goal.status === 'IN_PROGRESS' && (
              <button onClick={onAddProgress} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                <TrendingUp size={14} /> Update Progress
              </button>
            )}
            {goal.status === 'IN_PROGRESS' && (
              <button onClick={onSubmitCompletion} className="btn-success text-xs py-1.5 px-3 flex items-center gap-1">
                <Upload size={14} /> Submit Completion
              </button>
            )}
            {goal.status === 'PENDING_COMPLETION_APPROVAL' && goal.completionApprovalStatus === 'ADDITIONAL_EVIDENCE_REQUIRED' && (
              <button onClick={onEditEvidence} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                <Edit2 size={14} /> Edit Evidence
              </button>
            )}
            {goal.status === 'PENDING' && !goal.requestChanges && (
              <button onClick={onDelete} className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1">
                <Trash2 size={14} /> Delete
              </button>
            )}
          </>
        )}

        {/* MANAGER actions */}
        {isManager && isMyTeamGoal && (
          <>
            {goal.status === 'PENDING' && (
              <>
                <button onClick={onApprove} className="btn-success text-xs py-1.5 px-3 flex items-center gap-1">
                  <CheckCircle size={14} /> Approve
                </button>
                <button onClick={onRequestChanges} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <MessageSquare size={14} /> Request Changes
                </button>
              </>
            )}
            {goal.status === 'PENDING_COMPLETION_APPROVAL' && (
              <>
                {goal.evidenceLink && !goal.evidenceLinkVerificationStatus && (
                  <button onClick={onVerifyEvidence} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                    <Eye size={14} /> Verify Evidence
                  </button>
                )}
                {goal.evidenceLinkVerificationStatus && (
                  <>
                    <button
                      onClick={onApproveCompletion}
                      disabled={goal.evidenceLinkVerificationStatus !== 'VERIFIED'}
                      className={`text-xs py-1.5 px-3 flex items-center gap-1 ${
                        goal.evidenceLinkVerificationStatus === 'VERIFIED'
                          ? 'btn-success'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                      }`}>
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={onRejectCompletion}
                      disabled={goal.evidenceLinkVerificationStatus !== 'REJECTED'}
                      className={`text-xs py-1.5 px-3 flex items-center gap-1 ${
                        goal.evidenceLinkVerificationStatus === 'REJECTED'
                          ? 'btn-danger'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                      }`}>
                      <XCircle size={14} /> Reject
                    </button>
                    <button
                      onClick={onRequestEvidence}
                      disabled={goal.evidenceLinkVerificationStatus !== 'NEEDS_ADDITIONAL_LINK'}
                      className={`text-xs py-1.5 px-3 flex items-center gap-1 ${
                        goal.evidenceLinkVerificationStatus === 'NEEDS_ADDITIONAL_LINK'
                          ? 'btn-secondary'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                      }`}>
                      <MessageSquare size={14} /> Request Evidence
                    </button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
