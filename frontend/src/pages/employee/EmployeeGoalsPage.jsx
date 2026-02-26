import React, { useState, useEffect } from 'react'
import { Plus, Target } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import EmptyState from '../../components/common/EmptyState'
import GoalCard from '../../components/goals/GoalCard'
import GoalFiltersBar from '../../components/goals/GoalFiltersBar'
import GoalFormModal from '../../components/goals/GoalFormModal'
import ProgressModal from '../../components/goals/ProgressModal'
import CompletionModal from '../../components/goals/CompletionModal'
import ManagerActionModal from '../../components/goals/ManagerActionModal'
import EvidenceModal from '../../components/goals/EvidenceModal'
import { useAuth } from '../../context/AuthContext'
import goalService from '../../services/goalService'
import feedbackService from '../../services/feedbackService'
import toast from 'react-hot-toast'


export default function GoalsPage() {
  const { user, isAdmin, isManager, isEmployee } = useAuth()

  // ─── State ────────────────────────────────────────────────────────────────
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Modal visibility toggles
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditGoalModal, setShowEditGoalModal] = useState(false)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
  const [showEditEvidenceModal, setShowEditEvidenceModal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [actionType, setActionType] = useState('')  // 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | etc.
  const [managerFeedback, setManagerFeedback] = useState([])

  // Form states
  const [goalForm, setGoalForm] = useState({
    title: '', description: '', category: 'TECHNICAL', priority: 'MEDIUM',
    startDate: '', endDate: '', assignedManagerId: user?.managerId || ''
  })
  const [progressForm, setProgressForm] = useState({ notes: '', progressPercentage: 50 })
  const [completionForm, setCompletionForm] = useState({
    completionNotes: '', evidenceLink: '', evidenceLinkDescription: ''
  })
  const [actionForm, setActionForm] = useState({ comments: '', message: '' })
  const [evidenceForm, setEvidenceForm] = useState({ verificationStatus: 'VERIFIED', notes: '' })
  const [submitting, setSubmitting] = useState(false)

  // ─── Load Data ────────────────────────────────────────────────────────────
  useEffect(() => { loadGoals() }, [page])


  const loadGoals = async () => {
    setLoading(true)
    try {
      const data = await goalService.getGoals(page, 10)
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


  // ─── Client-side filter: status, priority, category, and search ─────────
  const filteredGoals = goals.filter(g => {
    const matchSearch   = !searchTerm ||
      g.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.category?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus   = !statusFilter || g.status === statusFilter
    const matchPriority = !priorityFilter || g.priority === priorityFilter
    const matchCategory = !categoryFilter || g.category === categoryFilter
    return matchSearch && matchStatus && matchPriority && matchCategory
  })

  // ─── EMPLOYEE: Create Goal ────────────────────────────────────────────────
  const handleCreateGoal = async (e) => {
    e.preventDefault()
    if (!goalForm.title) {
      toast.error('Title is required')
      return
    }
    if (!goalForm.assignedManagerId) {
      toast.error('No manager is assigned to your account. Please contact your administrator.')
      return
    }
    setSubmitting(true)
    try {
      await goalService.createGoal(goalForm)
      toast.success('Goal created successfully!')
      setShowCreateModal(false)
      setGoalForm({ title: '', description: '', category: 'TECHNICAL', priority: 'MEDIUM', startDate: '', endDate: '', assignedManagerId: user?.managerId || '' })
      loadGoals()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to create goal')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── EMPLOYEE: Update Goal (when changes requested) ───────────────────────
  const handleUpdateGoal = async (e) => {
    e.preventDefault()
    if (!goalForm.title) {
      toast.error('Title is required')
      return
    }
    setSubmitting(true)
    try {
      await goalService.updateGoal(selectedGoal.goalId, goalForm)
      toast.success('Goal updated and resubmitted for approval!')
      setShowEditGoalModal(false)
      setGoalForm({ title: '', description: '', category: 'TECHNICAL', priority: 'MEDIUM', startDate: '', endDate: '', assignedManagerId: user?.managerId || '' })
      setManagerFeedback([])
      loadGoals()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to update goal')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── EMPLOYEE: Add Progress ───────────────────────────────────────────────
  const handleAddProgress = async (e) => {
    e.preventDefault()
    if (!progressForm.notes.trim()) { toast.error('Progress notes are required'); return }
    setSubmitting(true)
    try {
      await goalService.addProgress(selectedGoal.goalId, progressForm.notes)
      toast.success('Progress updated!')
      setShowProgressModal(false)
      setProgressForm({ notes: '', progressPercentage: 50 })
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
      setCompletionForm({ completionNotes: '', evidenceLink: '', evidenceLinkDescription: '' })
      loadGoals()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to submit completion')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── EMPLOYEE: Resubmit Evidence ──────────────────────────────────────────
  const handleResubmitEvidence = async (e) => {
    e.preventDefault()
    if (!completionForm.completionNotes) { toast.error('Completion notes are required'); return }
    setSubmitting(true)
    try {
      await goalService.resubmitEvidence(selectedGoal.goalId, completionForm)
      toast.success('Evidence resubmitted for review!')
      setShowEditEvidenceModal(false)
      setCompletionForm({ completionNotes: '', evidenceLink: '', evidenceLinkDescription: '' })
      loadGoals()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to resubmit evidence')
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Layout title="Goals Management">
      {/* ── Filters + New Goal button ── */}
      <GoalFiltersBar
        searchTerm={searchTerm}     setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
        categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
        onClear={() => { setStatusFilter(''); setPriorityFilter(''); setCategoryFilter(''); setSearchTerm('') }}
        extra={isEmployee() && (
          <button
            onClick={() => {
              setGoalForm({ title: '', description: '', category: 'TECHNICAL', priority: 'MEDIUM', startDate: '', endDate: '', assignedManagerId: user?.managerId || '' })
              setShowCreateModal(true)
            }}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={18} /> New Goal
          </button>
        )}
      />

      {/* ── Goals List ── */}
      {loading ? (
        <LoadingSpinner message="Loading goals..." />
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals found"
          subtitle={isEmployee() ? 'Create your first goal to get started.' : 'No goals match your filters.'}
          action={isEmployee() && (
            <button onClick={() => setShowCreateModal(true)} className="btn-primary mt-4">Create Goal</button>
          )}
        />
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
              onEditGoal={async () => {
                setSelectedGoal(goal)
                setGoalForm({
                  title: goal.title || '',
                  description: goal.description || '',
                  category: goal.category || 'TECHNICAL',
                  priority: goal.priority || 'MEDIUM',
                  startDate: goal.startDate || '',
                  endDate: goal.endDate || '',
                  assignedManagerId: goal.assignedManagerId || user?.managerId || ''
                })
                try {
                  const feedbackData = await feedbackService.getFeedback(goal.goalId)
                  setManagerFeedback(feedbackData?.data || [])
                } catch { setManagerFeedback([]) }
                setShowEditGoalModal(true)
              }}
              onEditEvidence={() => {
                setSelectedGoal(goal)
                setCompletionForm({ completionNotes: goal.completionNotes || '', evidenceLink: goal.evidenceLink || '', evidenceLinkDescription: goal.evidenceLinkDescription || '' })
                setShowEditEvidenceModal(true)
              }}
              onApprove={() => openAction(goal, 'APPROVE')}
              onRequestChanges={() => openAction(goal, 'REQUEST_CHANGES')}
              onApproveCompletion={() => openAction(goal, 'APPROVE_COMPLETION')}
              onRejectCompletion={() => openAction(goal, 'REJECT_COMPLETION')}
              onRequestEvidence={() => openAction(goal, 'REQUEST_EVIDENCE')}
              onVerifyEvidence={() => { setSelectedGoal(goal); setEvidenceForm({ verificationStatus: 'VERIFIED', notes: '' }); setShowEvidenceModal(true) }}
              onDelete={() => handleDelete(goal)}
            />
          ))}
          <Pagination currentPage={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
        </div>
      )}

      {/* ── Modals ── */}
      <GoalFormModal
        isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}
        title="Create New Goal"
        form={goalForm} setForm={setGoalForm}
        onSubmit={handleCreateGoal} submitting={submitting}
        managerId={user?.managerId}
      />

      <GoalFormModal
        isOpen={showEditGoalModal} onClose={() => setShowEditGoalModal(false)}
        title="Edit & Resubmit Goal"
        form={goalForm} setForm={setGoalForm}
        onSubmit={handleUpdateGoal} submitting={submitting}
        managerFeedback={managerFeedback}
      />

      <ProgressModal
        isOpen={showProgressModal} onClose={() => setShowProgressModal(false)}
        goal={selectedGoal} form={progressForm} setForm={setProgressForm}
        onSubmit={handleAddProgress} submitting={submitting}
      />

      <CompletionModal
        isOpen={showCompletionModal} onClose={() => setShowCompletionModal(false)}
        goal={selectedGoal} form={completionForm} setForm={setCompletionForm}
        onSubmit={handleSubmitCompletion} submitting={submitting}
      />

      <CompletionModal
        isOpen={showEditEvidenceModal} onClose={() => setShowEditEvidenceModal(false)}
        title="Edit & Resubmit Evidence"
        goal={selectedGoal} form={completionForm} setForm={setCompletionForm}
        onSubmit={handleResubmitEvidence} submitting={submitting}
        managerFeedback={selectedGoal?.evidenceLinkVerificationNotes}
      />

      <ManagerActionModal
        isOpen={showActionModal} onClose={() => setShowActionModal(false)}
        actionType={actionType} goal={selectedGoal}
        form={actionForm} setForm={setActionForm}
        onSubmit={handleManagerAction} submitting={submitting}
      />

      <EvidenceModal
        isOpen={showEvidenceModal} onClose={() => setShowEvidenceModal(false)}
        goal={selectedGoal} form={evidenceForm} setForm={setEvidenceForm}
        onSubmit={handleVerifyEvidence} submitting={submitting}
      />
    </Layout>
  )
}
