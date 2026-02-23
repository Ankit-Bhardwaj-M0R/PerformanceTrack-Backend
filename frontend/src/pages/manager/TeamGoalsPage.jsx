import React, { useState, useEffect } from 'react'
import {
  Target, Search, CheckCircle, XCircle, MessageSquare,
  Eye, ChevronDown, RefreshCw, Filter,
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import Modal from '../../components/common/Modal'
import Pagination from '../../components/common/Pagination'
import goalService from '../../services/goalService'
import userService from '../../services/userService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending Approval' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING_COMPLETION_APPROVAL', label: 'Pending Completion' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
]

const PRIORITY_OPTIONS = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const CATEGORY_OPTIONS = ['', 'TECHNICAL', 'BEHAVIORAL', 'PROFESSIONAL_DEVELOPMENT', 'OTHER']

function MetricChip({ label, value, color }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  )
}

export default function TeamGoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [userMap, setUserMap]       = useState({}) // userId -> user object

  const [statusFilter, setStatusFilter]     = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchTerm, setSearchTerm]         = useState('')

  const [selectedGoal, setSelectedGoal] = useState(null)
  const [actionType, setActionType]     = useState('')
  const [actionForm, setActionForm]     = useState({ comments: '', message: '' })
  const [showActionModal, setShowActionModal] = useState(false)
  const [showEvidenceModal, setShowEvidenceModal] = useState(false)
  const [evidenceForm, setEvidenceForm] = useState({ verificationStatus: 'VERIFIED', notes: '' })
  const [submitting, setSubmitting]     = useState(false)

  // Load team members for employee name resolution
  useEffect(() => {
    if (user?.userId) {
      userService.getTeam(user.userId)
        .then(members => {
          const list = Array.isArray(members) ? members : (members?.content || [])
          const map = {}
          list.forEach(m => { map[m.userId] = m })
          setUserMap(map)
        })
        .catch(() => {/* silently fail — names fall back to User #ID */})
    }
  }, [user?.userId])

  useEffect(() => { loadGoals() }, [page])

  const loadGoals = async () => {
    setLoading(true)
    try {
      const data = await goalService.getGoals(page, 10)
      const list = data?.content || data || []
      setGoals(list)
      setTotalPages(data?.totalPages || 1)
      setTotalElements(data?.totalElements || list.length)
    } catch {
      toast.error('Failed to load team goals')
    } finally {
      setLoading(false)
    }
  }

  // Resolve employee name from userMap or fallback to User #ID
  const getEmployeeName = (goal) => {
    if (goal.employeeName) return goal.employeeName
    const u = userMap[goal.assignedToUserId]
    return u ? u.name : `User #${goal.assignedToUserId}`
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

  const openAction = (goal, type) => {
    setSelectedGoal(goal)
    setActionType(type)
    setActionForm({ comments: '', message: '' })
    setShowActionModal(true)
  }

  const handleManagerAction = async (e) => {
    e.preventDefault()
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
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

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

  const actionTitles = {
    APPROVE: 'Approve Goal', REQUEST_CHANGES: 'Request Changes',
    APPROVE_COMPLETION: 'Approve Completion', REJECT_COMPLETION: 'Reject Completion',
    REQUEST_EVIDENCE: 'Request Additional Evidence',
  }

  const hasActiveFilters = statusFilter || priorityFilter || categoryFilter || searchTerm

  return (
    <Layout title="Team Goals">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MetricChip label="Total Team Goals"    value={totalGoals}       color="bg-blue-50 text-blue-700" />
        <MetricChip label="Pending Approvals"   value={pendingApprovals} color="bg-yellow-50 text-yellow-700" />
        <MetricChip label="In Progress"         value={inProgress}       color="bg-indigo-50 text-indigo-700" />
        <MetricChip label="Completed"           value={completed}        color="bg-green-50 text-green-700" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title or employee name..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto">
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Categories</option>
          {CATEGORY_OPTIONS.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {hasActiveFilters && (
          <button onClick={() => { setStatusFilter(''); setPriorityFilter(''); setCategoryFilter(''); setSearchTerm('') }}
            className="btn-secondary text-xs px-3">
            Clear
          </button>
        )}
        <button onClick={loadGoals} className="btn-secondary p-2">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          {statusFilter && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Status: {STATUS_OPTIONS.find(o => o.value === statusFilter)?.label}</span>}
          {priorityFilter && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Priority: {priorityFilter}</span>}
          {categoryFilter && <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Category: {categoryFilter}</span>}
          <span className="text-gray-500 self-center">{filtered.length} result{filtered.length !== 1 ? 's' : ''} on this page</span>
        </div>
      )}

      {/* Goals Table */}
      {loading ? (
        <LoadingSpinner message="Loading team goals..." />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <Target size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No team goals found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters.</p>
        </div>
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
                    onApprove={() => openAction(goal, 'APPROVE')}
                    onRequestChanges={() => openAction(goal, 'REQUEST_CHANGES')}
                    onApproveCompletion={() => openAction(goal, 'APPROVE_COMPLETION')}
                    onRejectCompletion={() => openAction(goal, 'REJECT_COMPLETION')}
                    onRequestEvidence={() => openAction(goal, 'REQUEST_EVIDENCE')}
                    onVerifyEvidence={() => { setSelectedGoal(goal); setShowEvidenceModal(true) }}
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

      {/* Manager Action Modal */}
      <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)} title={actionTitles[actionType] || 'Action'}>
        <form onSubmit={handleManagerAction} className="space-y-4">
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">Goal: <strong>{selectedGoal?.title}</strong></p>
          {actionType === 'APPROVE' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              This will approve the goal and allow the employee to start working on it.
            </div>
          ) : (
            <div>
              <label className="form-label">{actionType === 'REQUEST_EVIDENCE' ? 'Message to Employee *' : 'Comments / Reason *'}</label>
              <textarea
                className="input-field" rows={4}
                value={actionType === 'REQUEST_EVIDENCE' ? actionForm.message : actionForm.comments}
                onChange={e => setActionForm(
                  actionType === 'REQUEST_EVIDENCE'
                    ? { ...actionForm, message: e.target.value }
                    : { ...actionForm, comments: e.target.value }
                )}
                placeholder="Enter your comments..."
              />
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowActionModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting}
              className={`flex-1 ${actionType === 'REJECT_COMPLETION' ? 'btn-danger' : actionType === 'APPROVE' || actionType === 'APPROVE_COMPLETION' ? 'btn-success' : 'btn-primary'}`}>
              {submitting ? 'Processing...' : actionTitles[actionType]}
            </button>
          </div>
        </form>
      </Modal>

      {/* Verify Evidence Modal */}
      <Modal isOpen={showEvidenceModal} onClose={() => setShowEvidenceModal(false)} title="Verify Evidence">
        <form onSubmit={handleVerifyEvidence} className="space-y-4">
          {selectedGoal?.evidenceLink && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-700 mb-1">Evidence Link:</p>
              <a href={selectedGoal.evidenceLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                {selectedGoal.evidenceLink}
              </a>
            </div>
          )}
          <div>
            <label className="form-label">Verification Decision</label>
            <select className="input-field" value={evidenceForm.verificationStatus}
              onChange={e => setEvidenceForm({ ...evidenceForm, verificationStatus: e.target.value })}>
              <option value="VERIFIED">Verified — Evidence is acceptable</option>
              <option value="NEEDS_REVISION">Needs Revision — More work needed</option>
              <option value="REJECTED">Rejected — Does not meet requirements</option>
            </select>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea className="input-field" rows={3} value={evidenceForm.notes}
              onChange={e => setEvidenceForm({ ...evidenceForm, notes: e.target.value })}
              placeholder="Add notes about your verification..." />
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

function GoalRow({ goal, employeeName, onApprove, onRequestChanges, onApproveCompletion, onRejectCompletion, onRequestEvidence, onVerifyEvidence }) {
  const priorityColors = { CRITICAL: 'text-red-600 font-bold', HIGH: 'text-orange-500', MEDIUM: 'text-yellow-600', LOW: 'text-green-600' }

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
              {goal.evidenceLink && <button onClick={onVerifyEvidence} className="btn-primary text-xs py-1 px-2 flex items-center gap-1"><Eye size={12} /> Verify</button>}
              <button onClick={onApproveCompletion} className="btn-success text-xs py-1 px-2 flex items-center gap-1"><CheckCircle size={12} /> Approve</button>
              <button onClick={onRejectCompletion} className="btn-danger text-xs py-1 px-2 flex items-center gap-1"><XCircle size={12} /> Reject</button>
              <button onClick={onRequestEvidence} className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"><MessageSquare size={12} /> Evidence</button>
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
