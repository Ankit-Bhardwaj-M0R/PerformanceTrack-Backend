import React, { useState, useEffect } from 'react'
import { ClipboardList, Star, CheckCircle, Eye, Send, Search, RefreshCw } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import { performanceReviewService, reviewCycleService } from '../../services/reviewService'
import toast from 'react-hot-toast'

function MetricChip({ label, value, color }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-2xl font-bold">{value ?? '—'}</p>
      <p className="text-xs font-medium mt-0.5 opacity-80">{label}</p>
    </div>
  )
}

function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button key={star} type="button"
          onClick={() => !readOnly && onChange && onChange(star)}
          className={`text-2xl transition-colors ${star <= value ? 'text-yellow-400' : 'text-gray-200'}
            ${!readOnly ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}>
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
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
  { value: 'COMPLETED', label: 'Completed' },
]

export default function ManagerReviewsPage() {
  const [reviews, setReviews]       = useState([])
  const [activeCycle, setActiveCycle] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm]     = useState('')

  const [selectedReview, setSelectedReview] = useState(null)
  const [showManagerReviewModal, setShowManagerReviewModal] = useState(false)
  const [showViewModal, setShowViewModal]                   = useState(false)
  const [submitting, setSubmitting]                         = useState(false)

  const [managerForm, setManagerForm] = useState({
    managerFeedback: '', managerRating: 3,
    ratingJustification: '', compensationRecommendations: '', nextPeriodGoals: '',
  })

  useEffect(() => { loadData() }, [page])

  const loadData = async () => {
    setLoading(true)
    try {
      const [reviewsRes, cycleRes] = await Promise.allSettled([
        performanceReviewService.getReviews(page, 20),
        reviewCycleService.getActiveCycle(),
      ])
      if (reviewsRes.status === 'fulfilled') {
        const list = reviewsRes.value?.content || reviewsRes.value || []
        setReviews(list)
        setTotalPages(reviewsRes.value?.totalPages || 1)
        setTotalElements(reviewsRes.value?.totalElements || list.length)
      }
      if (cycleRes.status === 'fulfilled') setActiveCycle(cycleRes.value?.data || cycleRes.value)
    } catch {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const filtered = reviews.filter(r => {
    const matchStatus = !statusFilter || r.status === statusFilter
    const matchSearch = !searchTerm || String(r.userId).includes(searchTerm) || r.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchStatus && matchSearch
  })

  // Metrics
  const total     = totalElements
  const pending   = reviews.filter(r => r.status === 'PENDING' || r.status === 'SELF_ASSESSMENT_COMPLETED').length
  const completed = reviews.filter(r => r.status === 'COMPLETED' || r.status === 'ACKNOWLEDGED').length
  const ratings   = reviews.filter(r => r.managerRating).map(r => r.managerRating)
  const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—'

  const handleManagerReview = async (e) => {
    e.preventDefault()
    if (!managerForm.managerFeedback || !managerForm.ratingJustification) {
      toast.error('Feedback and justification are required'); return
    }
    setSubmitting(true)
    try {
      await performanceReviewService.submitManagerReview(selectedReview.reviewId, managerForm)
      toast.success('Manager review submitted!')
      setShowManagerReviewModal(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout title="Reviews">
      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MetricChip label="Total Reviews"     value={total}     color="bg-blue-50 text-blue-700" />
        <MetricChip label="Pending Actions"   value={pending}   color="bg-yellow-50 text-yellow-700" />
        <MetricChip label="Completed"         value={completed} color="bg-green-50 text-green-700" />
        <MetricChip label="Avg Rating Given"  value={avgRating} color="bg-purple-50 text-purple-700" />
      </div>

      {/* Active Cycle Banner */}
      {activeCycle && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-blue-800">Active Review Cycle: <span className="font-bold">{activeCycle.title}</span></p>
          <p className="text-xs text-blue-600 mt-0.5">{activeCycle.startDate} → {activeCycle.endDate}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by employee name or ID..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-9" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }} className="input-field w-auto">
          {STATUS_FILTERS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button onClick={loadData} className="btn-secondary p-2"><RefreshCw size={16} /></button>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <LoadingSpinner message="Loading reviews..." />
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardList size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No reviews found</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Review ID', 'Employee', 'Status', 'Self Rating', 'Manager Rating', 'Submitted', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(review => (
                  <tr key={review.reviewId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400 font-mono">#{review.reviewId}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{review.employeeName || `User #${review.userId}`}</td>
                    <td className="px-4 py-3"><StatusBadge status={review.status} /></td>
                    <td className="px-4 py-3 text-gray-600">{review.employeeSelfRating ? `${review.employeeSelfRating}/5` : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{review.managerRating ? `${review.managerRating}/5` : '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{review.submittedDate?.split('T')[0] || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => { setSelectedReview(review); setShowViewModal(true) }}
                          className="btn-secondary text-xs py-1 px-2 flex items-center gap-1">
                          <Eye size={12} /> View
                        </button>
                        {review.status === 'SELF_ASSESSMENT_COMPLETED' && (
                          <button onClick={() => {
                            setSelectedReview(review)
                            setManagerForm({ managerFeedback: '', managerRating: 3, ratingJustification: '', compensationRecommendations: '', nextPeriodGoals: '' })
                            setShowManagerReviewModal(true)
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

      {/* Manager Review Modal */}
      <Modal isOpen={showManagerReviewModal} onClose={() => setShowManagerReviewModal(false)} title="Submit Manager Review" size="lg">
        <form onSubmit={handleManagerReview} className="space-y-4">
          {selectedReview?.selfAssessment && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-blue-700 mb-1">Employee Self-Assessment:</p>
              <p className="text-gray-600">{selectedReview.selfAssessment}</p>
              <p className="text-xs text-blue-500 mt-1">Self Rating: {selectedReview.employeeSelfRating}/5</p>
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
            <button type="button" onClick={() => setShowManagerReviewModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Review Details" size="lg">
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <StatusBadge status={selectedReview.status} />
              <span className="text-sm text-gray-500">Submitted: {selectedReview.submittedDate?.split('T')[0] || '—'}</span>
            </div>
            {selectedReview.selfAssessment && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Self-Assessment</p>
                <p className="text-sm text-gray-700">{selectedReview.selfAssessment}</p>
                <p className="text-xs text-blue-500 mt-2">Self Rating: {selectedReview.employeeSelfRating}/5</p>
              </div>
            )}
            {selectedReview.managerFeedback && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-green-700 uppercase mb-2">Manager Review</p>
                <p className="text-sm text-gray-700">{selectedReview.managerFeedback}</p>
                <p className="text-xs text-green-600 mt-2">Manager Rating: {selectedReview.managerRating}/5</p>
                {selectedReview.ratingJustification && <p className="text-xs text-gray-500 mt-1">Justification: {selectedReview.ratingJustification}</p>}
                {selectedReview.compensationRecommendations && <p className="text-xs text-gray-500 mt-1">Compensation: {selectedReview.compensationRecommendations}</p>}
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
