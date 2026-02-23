import React, { useState, useEffect } from 'react'
import { ClipboardList, Eye, Search, RefreshCw, ChevronDown } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import { performanceReviewService, reviewCycleService } from '../../services/reviewService'
import userService from '../../services/userService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

function MetricChip({ label, value, color }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  )
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button" onClick={() => onChange && onChange(star)}
          className={`text-2xl transition-colors cursor-pointer ${star <= value ? 'text-yellow-400' : 'text-gray-200'} hover:text-yellow-300`}>
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500 self-center">{value}/5</span>
    </div>
  )
}

const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SELF_ASSESSMENT_COMPLETED', label: 'Self-Assessment Done' },
  { value: 'MANAGER_REVIEW_COMPLETED', label: 'Manager Reviewed' },
  { value: 'COMPLETED_AND_ACKNOWLEDGED', label: 'Acknowledged' },
]

export default function ManagerReviewsPage() {
  const { user } = useAuth()

  const [reviews, setReviews]         = useState([])
  const [cycles, setCycles]           = useState([])       // all available cycles
  const [selectedCycleId, setSelectedCycleId] = useState(null)
  const [userMap, setUserMap]         = useState({})       // userId → user
  const [teamMemberIds, setTeamMemberIds] = useState(new Set()) // for filtering

  const [loading, setLoading]         = useState(true)
  const [loadingCycles, setLoadingCycles] = useState(true)
  const [page, setPage]               = useState(0)
  const [totalPages, setTotalPages]   = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm]     = useState('')

  const [selectedReview, setSelectedReview]               = useState(null)
  const [showReviewModal, setShowReviewModal]             = useState(false)
  const [showViewModal, setShowViewModal]                 = useState(false)
  const [submitting, setSubmitting]                       = useState(false)
  const [managerForm, setManagerForm] = useState({
    managerFeedback: '', managerRating: 3,
    ratingJustification: '', compensationRecommendations: '', nextPeriodGoals: '',
  })

  // ── Load cycles + team on mount ─────────────────────────────────────────
  useEffect(() => {
    loadCycles()
    if (user?.userId) loadTeam()
  }, [user?.userId])

  // ── Load reviews when selected cycle or page changes ────────────────────
  useEffect(() => {
    if (selectedCycleId != null) loadReviews()
  }, [selectedCycleId, page])

  const loadCycles = async () => {
    setLoadingCycles(true)
    try {
      const data = await reviewCycleService.getAllCycles()
      const list = Array.isArray(data) ? data : (data?.content || [])
      setCycles(list)
      // Auto-select: active cycle first, otherwise most recent
      const active = list.find(c => c.status === 'ACTIVE')
      const first  = list[0]
      const pick   = active || first
      if (pick) setSelectedCycleId(pick.cycleId)
    } catch {
      // no cycles available — leave selectedCycleId null
    } finally {
      setLoadingCycles(false)
    }
  }

  const loadTeam = async () => {
    try {
      const members = await userService.getTeam(user.userId)
      const list = Array.isArray(members) ? members : (members?.content || [])
      const map = {}
      const ids = new Set()
      list.forEach(m => { map[m.userId] = m; ids.add(m.userId) })
      setUserMap(map)
      setTeamMemberIds(ids)
    } catch { /* silently fail — show all reviews if team can't load */ }
  }

  const loadReviews = async () => {
    setLoading(true)
    try {
      // cycleId is required for manager to see team reviews
      const data = await performanceReviewService.getReviews(0, 200, selectedCycleId)
      const list = Array.isArray(data) ? data : (data?.content || [])
      setReviews(list)
      setTotalPages(data?.totalPages || 1)
      setTotalElements(data?.totalElements || list.length)
    } catch {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const getEmployeeName = (review) => {
    const u = userMap[review.userId]
    return u?.name || `User #${review.userId}`
  }

  const getCycleName = (review) =>
    review.cycle?.title || (selectedCycleId ? `Cycle #${selectedCycleId}` : '—')

  // Client-side filter: only team members (if team loaded), then status + search
  const filtered = reviews.filter(r => {
    if (teamMemberIds.size > 0 && !teamMemberIds.has(r.userId)) return false
    const matchStatus = !statusFilter || r.status === statusFilter
    const empName = getEmployeeName(r)
    const matchSearch = !searchTerm ||
      String(r.userId).includes(searchTerm) ||
      empName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchStatus && matchSearch
  })

  // Metrics (over current page's filtered reviews)
  const total     = filtered.length
  const pending   = filtered.filter(r => r.status === 'PENDING').length
  const awaitingReview = filtered.filter(r => r.status === 'SELF_ASSESSMENT_COMPLETED').length
  const done      = filtered.filter(r =>
    r.status === 'MANAGER_REVIEW_COMPLETED' || r.status === 'COMPLETED_AND_ACKNOWLEDGED'
  ).length
  const avgRating = (() => {
    const rated = filtered.filter(r => r.managerRating)
    if (!rated.length) return '—'
    return (rated.reduce((s, r) => s + r.managerRating, 0) / rated.length).toFixed(1)
  })()

  const handleManagerReview = async (e) => {
    e.preventDefault()
    if (!managerForm.managerFeedback || !managerForm.ratingJustification) {
      toast.error('Feedback and justification are required'); return
    }
    setSubmitting(true)
    try {
      await performanceReviewService.submitManagerReview(selectedReview.reviewId, managerForm)
      toast.success('Manager review submitted!')
      setShowReviewModal(false)
      loadReviews()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedCycle = cycles.find(c => c.cycleId === selectedCycleId)

  return (
    <Layout title="Team Performance Reviews">
      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MetricChip label="Total Reviews"      value={total}         color="bg-blue-50 text-blue-700" />
        <MetricChip label="Pending Self-Assmt" value={pending}       color="bg-gray-50 text-gray-600" />
        <MetricChip label="Awaiting My Review" value={awaitingReview} color="bg-yellow-50 text-yellow-700" />
        <MetricChip label="Completed"          value={done}          color="bg-green-50 text-green-700" />
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 flex-wrap">
        {/* Cycle selector */}
        <select
          value={selectedCycleId ?? ''}
          onChange={e => { setSelectedCycleId(e.target.value ? Number(e.target.value) : null); setPage(0) }}
          className="input-field w-auto"
          disabled={loadingCycles}
        >
          {loadingCycles
            ? <option>Loading cycles...</option>
            : cycles.length === 0
              ? <option value="">No review cycles</option>
              : cycles.map(c => (
                  <option key={c.cycleId} value={c.cycleId}>
                    {c.title} {c.status === 'ACTIVE' ? '(Active)' : `(${c.status})`}
                  </option>
                ))
          }
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0) }}
          className="input-field w-auto"
        >
          {STATUS_FILTERS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by employee name or ID..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-9" />
        </div>

        <button onClick={loadReviews} className="btn-secondary p-2" title="Refresh">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Active cycle info */}
      {selectedCycle && (
        <div className={`rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-3
          ${selectedCycle.status === 'ACTIVE'
            ? 'bg-blue-50 border border-blue-200 text-blue-800'
            : 'bg-gray-50 border border-gray-200 text-gray-700'}`}>
          <span className="font-semibold">{selectedCycle.title}</span>
          <span className="text-xs opacity-70">{selectedCycle.startDate} → {selectedCycle.endDate}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            selectedCycle.status === 'ACTIVE'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-600'
          }`}>{selectedCycle.status}</span>
        </div>
      )}

      {!selectedCycle && !loadingCycles && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-yellow-800 text-sm">
          No review cycles found. Ask your administrator to create a review cycle.
        </div>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading reviews..." />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardList size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No reviews found</p>
          <p className="text-gray-400 text-sm mt-1">
            {!selectedCycle ? 'Select a review cycle above.' : 'No reviews match your filters.'}
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Employee', 'Cycle', 'Status', 'Self Rating', 'Manager Rating', 'Submitted', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(review => (
                  <tr key={review.reviewId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{getEmployeeName(review)}</p>
                      <p className="text-xs text-gray-400">ID: {review.userId}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                      {getCycleName(review)}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={review.status} /></td>
                    <td className="px-4 py-3 text-gray-600">
                      {review.employeeSelfRating ? `${review.employeeSelfRating}/5` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {review.managerRating ? `${review.managerRating}/5` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {review.submittedDate?.split('T')[0] || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <button
                          onClick={() => { setSelectedReview(review); setShowViewModal(true) }}
                          className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                          <Eye size={12} /> View
                        </button>
                        {review.status === 'SELF_ASSESSMENT_COMPLETED' && (
                          <button
                            onClick={() => {
                              setSelectedReview(review)
                              setManagerForm({ managerFeedback: '', managerRating: 3, ratingJustification: '', compensationRecommendations: '', nextPeriodGoals: '' })
                              setShowReviewModal(true)
                            }}
                            className="btn-primary text-xs py-1 px-2 flex items-center gap-1">
                            <ClipboardList size={12} /> Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4">
            <Pagination currentPage={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Submit Manager Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Submit Manager Review" size="lg">
        <form onSubmit={handleManagerReview} className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-700">Employee: <span className="text-blue-700 font-semibold">{getEmployeeName(selectedReview)}</span></p>
          </div>
          {selectedReview?.selfAssessment && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-blue-700 mb-1">Self-Assessment:</p>
              <p className="text-gray-600">{selectedReview.selfAssessment}</p>
              {selectedReview.employeeSelfRating && (
                <p className="text-xs text-blue-500 mt-1">Self Rating: {selectedReview.employeeSelfRating}/5</p>
              )}
            </div>
          )}
          <div>
            <label className="form-label">Manager Feedback *</label>
            <textarea className="input-field" rows={5}
              value={managerForm.managerFeedback}
              onChange={e => setManagerForm({ ...managerForm, managerFeedback: e.target.value })}
              placeholder="Provide detailed feedback on this employee's performance..." />
          </div>
          <div>
            <label className="form-label">Performance Rating</label>
            <div className="mt-2">
              <StarRating value={managerForm.managerRating} onChange={v => setManagerForm({ ...managerForm, managerRating: v })} />
            </div>
          </div>
          <div>
            <label className="form-label">Rating Justification *</label>
            <textarea className="input-field" rows={3}
              value={managerForm.ratingJustification}
              onChange={e => setManagerForm({ ...managerForm, ratingJustification: e.target.value })}
              placeholder="Explain why you gave this rating..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Compensation Recommendations</label>
              <input className="input-field" value={managerForm.compensationRecommendations}
                onChange={e => setManagerForm({ ...managerForm, compensationRecommendations: e.target.value })}
                placeholder="e.g., 10% salary increase" />
            </div>
            <div>
              <label className="form-label">Goals for Next Period</label>
              <input className="input-field" value={managerForm.nextPeriodGoals}
                onChange={e => setManagerForm({ ...managerForm, nextPeriodGoals: e.target.value })}
                placeholder="Suggest next-cycle goals" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowReviewModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Review Details Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Review Details" size="lg">
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={selectedReview.status} />
              <span className="font-medium text-gray-700">{getEmployeeName(selectedReview)}</span>
              <span className="text-sm text-gray-500">{getCycleName(selectedReview)}</span>
            </div>
            {selectedReview.selfAssessment && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Self-Assessment</p>
                <p className="text-sm text-gray-700">{selectedReview.selfAssessment}</p>
                {selectedReview.employeeSelfRating && (
                  <p className="text-xs text-blue-500 mt-2">Self Rating: {selectedReview.employeeSelfRating}/5</p>
                )}
              </div>
            )}
            {selectedReview.managerFeedback && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-green-700 uppercase mb-2">Manager Review</p>
                <p className="text-sm text-gray-700">{selectedReview.managerFeedback}</p>
                {selectedReview.managerRating && (
                  <p className="text-xs text-green-600 mt-2">Manager Rating: {selectedReview.managerRating}/5</p>
                )}
                {selectedReview.ratingJustification && (
                  <p className="text-xs text-gray-500 mt-1">Justification: {selectedReview.ratingJustification}</p>
                )}
                {selectedReview.compensationRecommendations && (
                  <p className="text-xs text-gray-500 mt-1">Compensation: {selectedReview.compensationRecommendations}</p>
                )}
              </div>
            )}
            {selectedReview.employeeResponse && (
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-purple-700 uppercase mb-2">Employee Response</p>
                <p className="text-sm text-gray-700">{selectedReview.employeeResponse}</p>
              </div>
            )}
            <button onClick={() => setShowViewModal(false)} className="btn-secondary w-full">Close</button>
          </div>
        )}
      </Modal>
    </Layout>
  )
}
