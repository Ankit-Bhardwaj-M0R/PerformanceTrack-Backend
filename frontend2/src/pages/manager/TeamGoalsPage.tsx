import React, { useState, useEffect } from 'react'
import { Target, RefreshCw, CheckCircle, XCircle, MessageSquare, Eye } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import MetricChip from '../../components/common/MetricChip'
import EmptyState from '../../components/common/EmptyState'
import GoalFiltersBar from '../../components/goals/GoalFiltersBar'
import ManagerActionModal from '../../components/goals/ManagerActionModal'
import EvidenceModal from '../../components/goals/EvidenceModal'
import goalService from '../../services/goalService'
import userService from '../../services/userService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import type {
  GoalResponseDTO, UserDTO,
  ManagerActionFormState, EvidenceFormState,
  ManagerActionType,
} from '../../types'

const priorityColors: Record<string, string> = {
  CRITICAL: 'text-red-600 font-bold',
  HIGH: 'text-orange-500',
  MEDIUM: 'text-yellow-600',
  LOW: 'text-green-600',
}

interface GoalRowProps {
  goal: GoalResponseDTO
  employeeName: string
  verificationStatus: string | null
  onApprove: () => void
  onRequestChanges: () => void
  onApproveCompletion: () => void
  onRejectCompletion: () => void
  onRequestEvidence: () => void
  onVerifyEvidence: () => void
}

function GoalRow({
  goal, employeeName, verificationStatus,
  onApprove, onRequestChanges, onApproveCompletion, onRejectCompletion,
  onRequestEvidence, onVerifyEvidence,
}: GoalRowProps): JSX.Element {
  const canApproveCompletion  = verificationStatus === 'VERIFIED'
  const canRejectCompletion   = verificationStatus === 'REJECTED'
  const canRequestEvidence    = verificationStatus === 'NEEDS_ADDITIONAL_LINK'
  const verifyDone            = !!verificationStatus

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-xs text-gray-400 font-mono">#{goal.goalId}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <p className="text-gray-800 font-medium">{employeeName}</p>
        <p className="text-xs text-gray-400">ID: {goal.assignedToUserId}</p>
      </td>
      <td className="px-4 py-3 text-gray-700 max-w-xs">
        <p className="truncate font-medium" title={goal.title}>{goal.title}</p>
        {goal.description && <p className="text-xs text-gray-400 truncate mt-0.5" title={goal.description}>{goal.description}</p>}
      </td>
      <td className="px-4 py-3 text-xs">
        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{goal.category}</span>
      </td>
      <td className={`px-4 py-3 text-xs font-semibold ${priorityColors[goal.priority] || 'text-gray-600'}`}>{goal.priority}</td>
      <td className="px-4 py-3"><StatusBadge status={goal.status} /></td>
      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{goal.startDate || '—'}</td>
      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{goal.endDate || '—'}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1 min-w-[120px]">
          {goal.status === 'PENDING' && (
            <>
              <button onClick={onApprove} className="btn-success text-xs py-1 px-2 flex items-center gap-1"><CheckCircle size={12} /> Approve</button>
              <button onClick={onRequestChanges} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"><MessageSquare size={12} /> Changes</button>
            </>
          )}
          {goal.status === 'PENDING_COMPLETION_APPROVAL' && (
            <>
              {/* Verify button — always enabled so manager can select/change the decision */}
              <button
                onClick={onVerifyEvidence}
                className="btn-primary text-xs py-1 px-2 flex items-center gap-1"
                title="Open verify evidence dialog to set your decision">
                <Eye size={12} /> Verify
              </button>

              {/* Approve — enabled only when verification decision is VERIFIED */}
              <button
                onClick={onApproveCompletion}
                disabled={!canApproveCompletion}
                className={`text-xs py-1 px-2 flex items-center gap-1 rounded transition-colors
                  ${canApproveCompletion
                    ? 'btn-success cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}
                title={canApproveCompletion ? 'Approve completion' : "Select 'Verified' in Verify dialog to enable"}>
                <CheckCircle size={12} /> Approve
              </button>

              {/* Reject — enabled only when verification decision is REJECTED */}
              <button
                onClick={onRejectCompletion}
                disabled={!canRejectCompletion}
                className={`text-xs py-1 px-2 flex items-center gap-1 rounded transition-colors
                  ${canRejectCompletion
                    ? 'btn-danger cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}
                title={canRejectCompletion ? 'Reject completion' : "Select 'Rejected' in Verify dialog to enable"}>
                <XCircle size={12} /> Reject
              </button>

              {/* Request Evidence — enabled only when verification decision is NEEDS_ADDITIONAL_LINK */}
              <button
                onClick={onRequestEvidence}
                disabled={!canRequestEvidence}
                className={`text-xs py-1 px-2 flex items-center gap-1 rounded transition-colors
                  ${canRequestEvidence
                    ? 'btn-secondary cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}`}
                title={canRequestEvidence ? 'Request additional evidence' : "Select 'Needs Additional Link' in Verify dialog to enable"}>
                <MessageSquare size={12} /> Evidence
              </button>

              {/* Hint shown until the manager has used Verify */}
              {!verifyDone && (
                <p className="w-full text-xs text-amber-600 mt-1">⚠ Use Verify to select a decision first</p>
              )}
            </>
          )}
          {(goal.status === 'COMPLETED' || goal.status === 'IN_PROGRESS' || goal.status === 'REJECTED') && (
            <span className="text-xs text-gray-400 italic">No action needed</span>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function TeamGoalsPage(): JSX.Element {
  const { user } = useAuth()
  const [goals, setGoals]           = useState<GoalResponseDTO[]>([])
  const [loading, setLoading]       = useState<boolean>(true)
  const [page, setPage]             = useState<number>(0)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [totalElements, setTotalElements] = useState<number>(0)
  const [userMap, setUserMap]       = useState<Record<number, UserDTO>>({})

  const [statusFilter, setStatusFilter]     = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [searchTerm, setSearchTerm]         = useState<string>('')

  const [selectedGoal, setSelectedGoal] = useState<GoalResponseDTO | null>(null)
  const [actionType, setActionType]     = useState<string>('')
  const [actionForm, setActionForm]     = useState<ManagerActionFormState>({ comments: '', message: '' })
  const [showActionModal, setShowActionModal] = useState<boolean>(false)
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false)
  const [evidenceForm, setEvidenceForm] = useState<EvidenceFormState>({ verificationStatus: 'VERIFIED', notes: '' })
  const [submitting, setSubmitting]     = useState<boolean>(false)
  // Track the verification status selected per goal (goalId -> verificationStatus)
  const [goalVerificationMap, setGoalVerificationMap] = useState<Record<number, string>>({})

  // Load team members for employee name resolution
  useEffect(() => {
    if (user?.userId) {
      userService.getTeam(user.userId)
        .then((members: unknown) => {
          const list: UserDTO[] = Array.isArray(members) ? members as UserDTO[] : ((members as { content?: UserDTO[] })?.content || [])
          const map: Record<number, UserDTO> = {}
          list.forEach(m => { if (m.userId != null) map[m.userId] = m })
          setUserMap(map)
        })
        .catch(() => {/* silently fail — names fall back to User #ID */})
    }
  }, [user?.userId])

  useEffect(() => { loadGoals() }, [page])

  const loadGoals = async (): Promise<void> => {
    setLoading(true)
    try {
      const data = await goalService.getGoals(page, 10) as { content?: GoalResponseDTO[]; totalPages?: number; totalElements?: number } | GoalResponseDTO[]
      const list: GoalResponseDTO[] = (data as { content?: GoalResponseDTO[] })?.content || (data as GoalResponseDTO[]) || []
      setGoals(list)
      setTotalPages((data as { totalPages?: number })?.totalPages || 1)
      setTotalElements((data as { totalElements?: number })?.totalElements || list.length)
    } catch {
      toast.error('Failed to load team goals')
    } finally {
      setLoading(false)
    }
  }

  // Resolve employee name from userMap or fallback to User #ID
  const getEmployeeName = (goal: GoalResponseDTO): string => {
    if (goal.assignedToUserName) return goal.assignedToUserName
    if (goal.assignedToUserId && userMap[goal.assignedToUserId]) {
      const u = userMap[goal.assignedToUserId]
      return u.name ?? `User #${goal.assignedToUserId}`
    }
    return `User #${goal.assignedToUserId}`
  }

  // Client-side filters — status, priority, category, and search all applied here
  const filtered = goals.filter(g => {
    const empName = getEmployeeName(g)
    const matchSearch  = !searchTerm ||
      g.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus  = !statusFilter || g.status === statusFilter
    const matchPri     = !priorityFilter || g.priority === priorityFilter
    const matchCat     = !categoryFilter || g.category === categoryFilter
    return matchSearch && matchStatus && matchPri && matchCat
  })

  // Metrics
  const totalGoals       = totalElements
  const pendingApprovals = goals.filter(g => g.status === 'PENDING').length
  const inProgress       = goals.filter(g => g.status === 'IN_PROGRESS').length
  const completed        = goals.filter(g => g.status === 'COMPLETED').length

  const openAction = (goal: GoalResponseDTO, type: string): void => {
    setSelectedGoal(goal)
    setActionType(type)
    setActionForm({ comments: '', message: '' })
    setShowActionModal(true)
  }

  const handleManagerAction = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!selectedGoal) return
    setSubmitting(true)
    try {
      switch (actionType) {
        case 'APPROVE':
          await goalService.approveGoal(selectedGoal.goalId); toast.success('Goal approved!'); break
        case 'REQUEST_CHANGES':
          await goalService.requestChanges(selectedGoal.goalId, actionForm.comments); toast.success('Change request sent'); break
        case 'APPROVE_COMPLETION':
          await goalService.approveCompletion(selectedGoal.goalId, actionForm.comments); toast.success('Completion approved!'); break
        case 'REJECT_COMPLETION':
          await goalService.rejectCompletion(selectedGoal.goalId, actionForm.comments); toast.success('Completion rejected'); break
        case 'REQUEST_EVIDENCE':
          await goalService.requestAdditionalEvidence(selectedGoal.goalId, actionForm.message); toast.success('Evidence requested'); break
        default: break
      }
      setShowActionModal(false)
      loadGoals()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { msg?: string } } }
      toast.error(e.response?.data?.msg || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyEvidence = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!selectedGoal) return
    setSubmitting(true)
    try {
      await goalService.verifyEvidence(selectedGoal.goalId, evidenceForm.verificationStatus as import('../../types').EvidenceVerificationStatus, evidenceForm.notes)
      toast.success('Evidence verification submitted!')
      // Remember which verification status was chosen for this goal
      setGoalVerificationMap(prev => ({ ...prev, [selectedGoal.goalId]: evidenceForm.verificationStatus }))
      setShowEvidenceModal(false)
      loadGoals()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { msg?: string } } }
      toast.error(e.response?.data?.msg || 'Failed to verify evidence')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout title="Team Goals">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MetricChip label="Total Team Goals"    value={totalGoals}       color="bg-blue-50 text-blue-700" />
        <MetricChip label="Pending Approvals"   value={pendingApprovals} color="bg-yellow-50 text-yellow-700" />
        <MetricChip label="In Progress"         value={inProgress}       color="bg-indigo-50 text-indigo-700" />
        <MetricChip label="Completed"           value={completed}        color="bg-green-50 text-green-700" />
      </div>

      <GoalFiltersBar
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
        categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
        onClear={() => { setStatusFilter(''); setPriorityFilter(''); setCategoryFilter(''); setSearchTerm('') }}
        extra={
          <button onClick={loadGoals} className="btn-secondary p-2" title="Refresh">
            <RefreshCw size={16} />
          </button>
        }
      />

      {/* Goals Table */}
      {loading ? (
        <LoadingSpinner message="Loading team goals..." />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Target} title="No team goals found" subtitle="Try adjusting your filters." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['ID', 'Employee', 'Title', 'Category', 'Priority', 'Status', 'Start Date', 'Due Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(goal => (
                  <GoalRow
                    key={goal.goalId}
                    goal={goal}
                    employeeName={getEmployeeName(goal)}
                    verificationStatus={goalVerificationMap[goal.goalId] || null}
                    onApprove={() => openAction(goal, 'APPROVE')}
                    onRequestChanges={() => openAction(goal, 'REQUEST_CHANGES')}
                    onApproveCompletion={() => openAction(goal, 'APPROVE_COMPLETION')}
                    onRejectCompletion={() => openAction(goal, 'REJECT_COMPLETION')}
                    onRequestEvidence={() => openAction(goal, 'REQUEST_EVIDENCE')}
                    onVerifyEvidence={() => { setSelectedGoal(goal); setEvidenceForm({ verificationStatus: 'VERIFIED', notes: '' }); setShowEvidenceModal(true) }}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4">
            <Pagination currentPage={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
          </div>
        </div>
      )}

      <ManagerActionModal
        isOpen={showActionModal} onClose={() => setShowActionModal(false)}
        actionType={actionType as ManagerActionType} goal={selectedGoal}
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
