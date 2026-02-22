import React, { useState, useEffect } from 'react'
import {
  Plus, Search, Filter, ChevronDown, Target, Edit2,
  Trash2, CheckCircle, XCircle, MessageSquare, Upload,
  Eye, TrendingUp, MoreVertical
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import { useAuth } from '../../context/AuthContext'
import goalService from '../../services/goalService'
import userService from '../../services/userService'
import toast from 'react-hot-toast'

// ─── GOALS PAGE ───────────────────────────────────────────────────────────────
// Full 7-phase goal lifecycle management.
//
// EMPLOYEE can:  Create goal, update (when PENDING), add progress, submit completion
// MANAGER can:   Approve/reject goal, request changes, verify evidence, approve/reject completion
// ADMIN can:     View all goals
//
// APIs Used:
//   GET    /api/v1/goals
//   POST   /api/v1/goals
//   PUT    /api/v1/goals/{id}
//   DELETE /api/v1/goals/{id}
//   PUT    /api/v1/goals/{id}/approve
//   PUT    /api/v1/goals/{id}/request-changes
//   POST   /api/v1/goals/{id}/submit-completion
//   POST   /api/v1/goals/{id}/approve-completion
//   POST   /api/v1/goals/{id}/reject-completion
//   POST   /api/v1/goals/{id}/progress
//   PUT    /api/v1/goals/{id}/evidence/verify
// ─────────────────────────────────────────────────────────────────────────────

// Goal categories and priorities from the backend enums
const GOAL_CATEGORIES = ['PERFORMANCE', 'DEVELOPMENT', 'LEADERSHIP', 'TEAMWORK', 'INNOVATION', 'OTHER']
const GOAL_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function GoalsPage() {
  const { user, isAdmin, isManager, isEmployee } = useAuth()

  // ─── State ────────────────────────────────────────────────────────────────
  const [goals, setGoals] = useState([])
  const [managers, setManagers] = useState([])   // For the "assign manager" dropdown
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal visibility toggles
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)  // for approve/reject
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [actionType, setActionType] = useState('')  // 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | etc.

  // Form states
  const [goalForm, setGoalForm] = useState({
    title: '', description: '', category: 'PERFORMANCE', priority: 'MEDIUM',
    startDate: '', endDate: '', assignedManagerId: ''
  })
  const [progressForm, setProgressForm] = useState({ notes: '', progressPercentage: 50 })
  const [completionForm, setCompletionForm] = useState({
    completionNotes: '', evidenceLink: '', evidenceLinkDescription: ''
  })
  const [actionForm, setActionForm] = useState({ comments: '', message: '' })
  const [evidenceForm, setEvidenceForm] = useState({ verificationStatus: 'VERIFIED', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  // ─── Load Data ────────────────────────────────────────────────────────────
  useEffect(() => { loadGoals() }, [page, statusFilter])

  useEffect(() => {
    // Load managers list for the "create goal" form (employees need to pick a manager)
    if (isEmployee()) loadManagers()
  }, [])

  const loadGoals = async () => {
    setLoading(true)
    try {
      const data = await goalService.getGoals(page, 10, statusFilter || null)
      const list = data?.content || data || []
      setGoals(list)
      setTotalPages(data?.totalPages || 1)
      setTotalElements(data?.totalElements || list.length)
    } catch (err) {
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const loadManagers = async () => {
    try {
      // ADMIN/MANAGER can list all users; EMPLOYEE gets 403 from this endpoint
      const data = await userService.getAllUsers(0, 100)
      const list = data?.content || data || []
      setManagers(list.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN'))
    } catch (err) {
      if (err.response?.status === 403 && user?.userId) {
        // Employees can't call getAllUsers — fall back to fetching their own
        // profile to get their direct manager's details
        try {
          const profile = await userService.getUserById(user.userId)
          if (profile?.manager) setManagers([profile.manager])
        } catch { /* silently fail */ }
      }
    }
  }

  // ─── Filter goals by search term (client-side) ───────────────────────────
  const filteredGoals = goals.filter(g =>
    g.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ─── EMPLOYEE: Create Goal ────────────────────────────────────────────────
  const handleCreateGoal = async (e) => {
    e.preventDefault()
    if (!goalForm.title || !goalForm.assignedManagerId) {
      toast.error('Title and Manager are required')
      return
    }
    setSubmitting(true)
    try {
      await goalService.createGoal(goalForm)
      toast.success('Goal created successfully!')
      setShowCreateModal(false)
      setGoalForm({ title: '', description: '', category: 'PERFORMANCE', priority: 'MEDIUM', startDate: '', endDate: '', assignedManagerId: '' })
      loadGoals()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create goal')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── EMPLOYEE: Add Progress ───────────────────────────────────────────────
  const handleAddProgress = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await goalService.addProgress(selectedGoal.goalId, progressForm.notes, progressForm.progressPercentage)
      toast.success('Progress updated!')
      setShowProgressModal(false)
      loadGoals()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update progress')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── EMPLOYEE: Submit for Completion ──────────────────────────────────────
  const handleSubmitCompletion = async (e) => {
    e.preventDefault()
    if (!completionForm.completionNotes) { toast.error('Completion notes are required'); return }
    setSubmitting(true)
    try {
      await goalService.submitCompletion(selectedGoal.goalId, completionForm)
      toast.success('Goal submitted for completion review!')
      setShowCompletionModal(false)
      loadGoals()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to submit completion')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── MANAGER: Approve/Reject/Request Changes ───────────────────────────────
  const handleManagerAction = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      switch (actionType) {
        case 'APPROVE':
          await goalService.approveGoal(selectedGoal.goalId)
          toast.success('Goal approved!')
          break
        case 'REQUEST_CHANGES':
          await goalService.requestChanges(selectedGoal.goalId, actionForm.comments)
          toast.success('Change request sent to employee')
          break
        case 'APPROVE_COMPLETION':
          await goalService.approveCompletion(selectedGoal.goalId, actionForm.comments)
          toast.success('Goal completion approved!')
          break
        case 'REJECT_COMPLETION':
          await goalService.rejectCompletion(selectedGoal.goalId, actionForm.comments)
          toast.success('Completion rejected')
          break
        case 'REQUEST_EVIDENCE':
          await goalService.requestAdditionalEvidence(selectedGoal.goalId, actionForm.message)
          toast.success('Evidence request sent')
          break
        default:
          break
      }
      setShowActionModal(false)
      loadGoals()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── MANAGER: Verify Evidence ────────────────────────────────────────────
  const handleVerifyEvidence = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await goalService.verifyEvidence(selectedGoal.goalId, evidenceForm.verificationStatus, evidenceForm.notes)
      toast.success('Evidence verification submitted!')
      setShowEvidenceModal(false)
      loadGoals()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to verify evidence')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Delete Goal ─────────────────────────────────────────────────────────
  const handleDelete = async (goal) => {
    if (!window.confirm(`Delete goal "${goal.title}"? This cannot be undone.`)) return
    try {
      await goalService.deleteGoal(goal.goalId)
      toast.success('Goal deleted')
      loadGoals()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to delete goal')
    }
  }

  // ─── Open manager action modal ────────────────────────────────────────────
  const openAction = (goal, type) => {
    setSelectedGoal(goal)
    setActionType(type)
    setActionForm({ comments: '', message: '' })
    setShowActionModal(true)
  }

  // ─── Action modal title map ───────────────────────────────────────────────
  const actionTitles = {
    APPROVE: 'Approve Goal',
    REQUEST_CHANGES: 'Request Changes',
    APPROVE_COMPLETION: 'Approve Completion',
    REJECT_COMPLETION: 'Reject Completion',
    REQUEST_EVIDENCE: 'Request Additional Evidence',
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Layout title="Goals Management">
      {/* ── Top Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search goals by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
          className="input-field w-auto"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="PENDING_COMPLETION_APPROVAL">Pending Completion</option>
          <option value="COMPLETED">Completed</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* Create button (Employees only) */}
        {isEmployee() && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} /> New Goal
          </button>
        )}
      </div>

      {/* ── Goals List ── */}
      {loading ? (
        <LoadingSpinner message="Loading goals..." />
      ) : filteredGoals.length === 0 ? (
        <div className="card text-center py-16">
          <Target size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No goals found</p>
          <p className="text-gray-400 text-sm mt-1">
            {isEmployee() ? 'Create your first goal to get started.' : 'No goals match your filters.'}
          </p>
          {isEmployee() && (
            <button onClick={() => setShowCreateModal(true)} className="btn-primary mt-4">
              Create Goal
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.goalId}
              goal={goal}
              user={user}
              isManager={isManager()}
              isEmployee={isEmployee()}
              isAdmin={isAdmin()}
              onAddProgress={() => { setSelectedGoal(goal); setShowProgressModal(true) }}
              onSubmitCompletion={() => { setSelectedGoal(goal); setShowCompletionModal(true) }}
              onApprove={() => openAction(goal, 'APPROVE')}
              onRequestChanges={() => openAction(goal, 'REQUEST_CHANGES')}
              onApproveCompletion={() => openAction(goal, 'APPROVE_COMPLETION')}
              onRejectCompletion={() => openAction(goal, 'REJECT_COMPLETION')}
              onRequestEvidence={() => openAction(goal, 'REQUEST_EVIDENCE')}
              onVerifyEvidence={() => { setSelectedGoal(goal); setShowEvidenceModal(true) }}
              onDelete={() => handleDelete(goal)}
            />
          ))}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════════════════════ */}

      {/* Create Goal Modal (Employee) */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Goal" size="lg">
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="form-label">Goal Title *</label>
            <input className="input-field" value={goalForm.title}
              onChange={e => setGoalForm({ ...goalForm, title: e.target.value })}
              placeholder="e.g., Complete React certification" />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="input-field" rows={3} value={goalForm.description}
              onChange={e => setGoalForm({ ...goalForm, description: e.target.value })}
              placeholder="Describe what you plan to accomplish..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category</label>
              <select className="input-field" value={goalForm.category}
                onChange={e => setGoalForm({ ...goalForm, category: e.target.value })}>
                {GOAL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select className="input-field" value={goalForm.priority}
                onChange={e => setGoalForm({ ...goalForm, priority: e.target.value })}>
                {GOAL_PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Start Date</label>
              <input type="date" className="input-field" value={goalForm.startDate}
                onChange={e => setGoalForm({ ...goalForm, startDate: e.target.value })} />
            </div>
            <div>
              <label className="form-label">End Date (Deadline)</label>
              <input type="date" className="input-field" value={goalForm.endDate}
                onChange={e => setGoalForm({ ...goalForm, endDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="form-label">Assign to Manager *</label>
            <select className="input-field" value={goalForm.assignedManagerId}
              onChange={e => setGoalForm({ ...goalForm, assignedManagerId: e.target.value })}>
              <option value="">Select your manager...</option>
              {managers.map(m => (
                <option key={m.userId} value={m.userId}>{m.name} ({m.department})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Progress Modal (Employee) */}
      <Modal isOpen={showProgressModal} onClose={() => setShowProgressModal(false)} title="Add Progress Update">
        <form onSubmit={handleAddProgress} className="space-y-4">
          <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
            Goal: <strong>{selectedGoal?.title}</strong>
          </p>
          <div>
            <label className="form-label">Progress Percentage: {progressForm.progressPercentage}%</label>
            <input type="range" min="0" max="100" value={progressForm.progressPercentage}
              onChange={e => setProgressForm({ ...progressForm, progressPercentage: parseInt(e.target.value) })}
              className="w-full" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>
          <div>
            <label className="form-label">Progress Notes *</label>
            <textarea className="input-field" rows={4} value={progressForm.notes}
              onChange={e => setProgressForm({ ...progressForm, notes: e.target.value })}
              placeholder="Describe what you've accomplished so far..." />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowProgressModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Saving...' : 'Save Progress'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Submit Completion Modal (Employee) */}
      <Modal isOpen={showCompletionModal} onClose={() => setShowCompletionModal(false)} title="Submit Goal for Completion" size="lg">
        <form onSubmit={handleSubmitCompletion} className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            You are submitting <strong>{selectedGoal?.title}</strong> for completion review. Your manager will verify your work.
          </div>
          <div>
            <label className="form-label">Completion Notes *</label>
            <textarea className="input-field" rows={4} value={completionForm.completionNotes}
              onChange={e => setCompletionForm({ ...completionForm, completionNotes: e.target.value })}
              placeholder="Describe how you completed this goal and what you achieved..." />
          </div>
          <div>
            <label className="form-label">Evidence Link (optional)</label>
            <input className="input-field" value={completionForm.evidenceLink}
              onChange={e => setCompletionForm({ ...completionForm, evidenceLink: e.target.value })}
              placeholder="https://docs.google.com/... or https://github.com/..." />
          </div>
          <div>
            <label className="form-label">Evidence Description</label>
            <input className="input-field" value={completionForm.evidenceLinkDescription}
              onChange={e => setCompletionForm({ ...completionForm, evidenceLinkDescription: e.target.value })}
              placeholder="What does the evidence link contain?" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowCompletionModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-success flex-1">
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Manager Action Modal (Approve / Reject / Request Changes) */}
      <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)}
        title={actionTitles[actionType] || 'Manager Action'}>
        <form onSubmit={handleManagerAction} className="space-y-4">
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            Goal: <strong>{selectedGoal?.title}</strong>
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
                value={actionType === 'REQUEST_EVIDENCE' ? actionForm.message : actionForm.comments}
                onChange={e => setActionForm(
                  actionType === 'REQUEST_EVIDENCE'
                    ? { ...actionForm, message: e.target.value }
                    : { ...actionForm, comments: e.target.value }
                )}
                placeholder={
                  actionType === 'REQUEST_CHANGES' ? 'Describe what needs to be changed...' :
                  actionType === 'APPROVE_COMPLETION' ? 'Optional: Add completion comments...' :
                  actionType === 'REJECT_COMPLETION' ? 'Explain why the completion is rejected...' :
                  'Describe what additional evidence is needed...'
                }
              />
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowActionModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting}
              className={`flex-1 ${actionType === 'REJECT_COMPLETION' ? 'btn-danger' : actionType === 'APPROVE' || actionType === 'APPROVE_COMPLETION' ? 'btn-success' : 'btn-primary'}`}>
              {submitting ? 'Processing...' : actionTitles[actionType] || 'Confirm'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Verify Evidence Modal (Manager) */}
      <Modal isOpen={showEvidenceModal} onClose={() => setShowEvidenceModal(false)} title="Verify Evidence">
        <form onSubmit={handleVerifyEvidence} className="space-y-4">
          {selectedGoal?.evidenceLink && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-700 mb-1">Evidence Link:</p>
              <a href={selectedGoal.evidenceLink} target="_blank" rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all">
                {selectedGoal.evidenceLink}
              </a>
              {selectedGoal.evidenceLinkDescription && (
                <p className="text-xs text-blue-600 mt-1">{selectedGoal.evidenceLinkDescription}</p>
              )}
            </div>
          )}
          <div>
            <label className="form-label">Verification Decision</label>
            <select className="input-field" value={evidenceForm.verificationStatus}
              onChange={e => setEvidenceForm({ ...evidenceForm, verificationStatus: e.target.value })}>
              <option value="VERIFIED">Verified — Evidence is acceptable</option>
              <option value="NEEDS_REVISION">Needs Revision — More work needed</option>
              <option value="REJECTED">Rejected — Evidence does not meet requirements</option>
            </select>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea className="input-field" rows={3} value={evidenceForm.notes}
              onChange={e => setEvidenceForm({ ...evidenceForm, notes: e.target.value })}
              placeholder="Add notes about your verification decision..." />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowEvidenceModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : 'Submit Verification'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  )
}

// ─── GOAL CARD COMPONENT ─────────────────────────────────────────────────────
// Renders a single goal with all available actions based on status + role
function GoalCard({ goal, user, isManager, isEmployee, isAdmin, onAddProgress,
  onSubmitCompletion, onApprove, onRequestChanges, onApproveCompletion,
  onRejectCompletion, onRequestEvidence, onVerifyEvidence, onDelete }) {

  const [expanded, setExpanded] = useState(false)

  const priorityColors = {
    CRITICAL: 'border-l-red-500',
    HIGH: 'border-l-orange-400',
    MEDIUM: 'border-l-yellow-400',
    LOW: 'border-l-green-400',
  }

  const isMyGoal = goal.assignedToUserId === user?.userId
  const isMyTeamGoal = goal.assignedManagerId === user?.userId

  return (
    <div className={`card border-l-4 ${priorityColors[goal.priority] || 'border-l-gray-300'} hover:shadow-md transition-shadow`}>
      {/* Goal Header */}
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
            {goal.endDate && <span>Due: {goal.endDate}</span>}
            {goal.startDate && <span>Started: {goal.startDate}</span>}
          </div>
        </div>

        {/* Toggle expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <ChevronDown size={20} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {goal.description && (
            <p className="text-sm text-gray-600">{goal.description}</p>
          )}
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
            </div>
          )}
        </div>
      )}

      {/* Action Buttons Row */}
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
        {/* ── EMPLOYEE ACTIONS ── */}
        {isEmployee && isMyGoal && (
          <>
            {goal.status === 'IN_PROGRESS' && (
              <button onClick={onAddProgress}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                <TrendingUp size={14} /> Update Progress
              </button>
            )}
            {(goal.status === 'IN_PROGRESS') && (
              <button onClick={onSubmitCompletion}
                className="btn-success text-xs py-1.5 px-3 flex items-center gap-1">
                <Upload size={14} /> Submit Completion
              </button>
            )}
            {(goal.status === 'PENDING') && (
              <button onClick={onDelete}
                className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1">
                <Trash2 size={14} /> Delete
              </button>
            )}
          </>
        )}

        {/* ── MANAGER ACTIONS ── */}
        {isManager && isMyTeamGoal && (
          <>
            {goal.status === 'PENDING' && (
              <>
                <button onClick={onApprove}
                  className="btn-success text-xs py-1.5 px-3 flex items-center gap-1">
                  <CheckCircle size={14} /> Approve
                </button>
                <button onClick={onRequestChanges}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <MessageSquare size={14} /> Request Changes
                </button>
              </>
            )}
            {goal.status === 'PENDING_COMPLETION_APPROVAL' && (
              <>
                {goal.evidenceLink && (
                  <button onClick={onVerifyEvidence}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                    <Eye size={14} /> Verify Evidence
                  </button>
                )}
                <button onClick={onApproveCompletion}
                  className="btn-success text-xs py-1.5 px-3 flex items-center gap-1">
                  <CheckCircle size={14} /> Approve
                </button>
                <button onClick={onRejectCompletion}
                  className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1">
                  <XCircle size={14} /> Reject
                </button>
                <button onClick={onRequestEvidence}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <MessageSquare size={14} /> Request Evidence
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
