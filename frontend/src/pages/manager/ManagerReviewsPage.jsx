import React, { useState, useEffect } from 'react'
import { ClipboardList, Eye, Search, RefreshCw } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import Pagination from '../../components/common/Pagination'
import MetricChip from '../../components/common/MetricChip'
import EmptyState from '../../components/common/EmptyState'
import ManagerReviewModal from '../../components/reviews/ManagerReviewModal'
import ReviewDetailModal from '../../components/reviews/ReviewDetailModal'
import { performanceReviewService, reviewCycleService } from '../../services/reviewService'
import userService from '../../services/userService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'


const STATUS_FILTERS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'SELF_ASSESSMENT_COMPLETED', label: 'Self-Assessment Done' },
  { value: 'COMPLETED', label: 'Manager Reviewed' },
  { value: 'COMPLETED_AND_ACKNOWLEDGED', label: 'Acknowledged' },
]

export default function ManagerReviewsPage() {
  const { user } = useAuth()

  const [reviews, setReviews]         = useState([])
  const [cycles, setCycles]           = useState([])       // all available cycles
  const [selectedCycleId, setSelectedCycleId] = useState(null)
  const [userMap, setUserMap]         = useState({})       // userId → { name, ... }

  const [loading, setLoading]         = useState(false)    // false so page structure shows immediately
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
      console.log('📅 Cycles API response:', data)
      const list = Array.isArray(data) ? data : (data?.content || [])
      console.log('📅 Cycles list:', list)
      setCycles(list)
      // Auto-select: active cycle first, otherwise most recent
      const active = list.find(c => c.status === 'ACTIVE')
      const first  = list[0]
      const pick   = active || first
      if (pick) setSelectedCycleId(pick.cycleId)
    } catch (err) {
      console.error('❌ Failed to load cycles:', err)
      // API failed — nothing to load
    } finally {
      setLoadingCycles(false)
    }
  }

  const loadTeam = async () => {
    try {
      const members = await userService.getTeam(user.userId)
      const list = Array.isArray(members) ? members : (members?.content || [])
      const map = {}
      list.forEach(m => { map[m.userId] = m })
      setUserMap(map)
    } catch { /* silently fail — show all reviews if team can't load */ }
  }

  const loadReviews = async () => {
    setLoading(true)
    try {
      // cycleId is required for manager to see team reviews
      console.log('📊 Loading reviews for cycleId:', selectedCycleId)
      const data = await performanceReviewService.getReviews(0, 200, selectedCycleId)
      console.log('📊 Reviews API response:', data)
      const list = Array.isArray(data) ? data : (data?.content || [])
      console.log('📊 Reviews list:', list)
      setReviews(list)
      setTotalPages(data?.totalPages || 1)
      setTotalElements(data?.totalElements || list.length)
    } catch (err) {
      console.error('❌ Failed to load reviews:', err)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const getEmployeeName = (review) => {
    if (!review) return '—'
    // Backend now returns flat userName field
    return review.userName || `User #${review.userId}`
  }

  const getCycleName = (review) =>
    // Backend now returns flat cycleTitle field
    review.cycleTitle || (selectedCycleId ? `Cycle #${selectedCycleId}` : '—')

  // Client-side filter: status + search only (backend already filters by manager's team)
  const filtered = reviews.filter(r => {
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
    r.status === 'COMPLETED' || r.status === 'COMPLETED_AND_ACKNOWLEDGED'
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
      </div>      {/* Filters row */}
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
        <EmptyState
          icon={ClipboardList}
          title="No reviews found"
          subtitle={!selectedCycle ? 'Select a review cycle above.' : 'No reviews match your filters.'}
        />
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

      {/* Modals */}
      <ManagerReviewModal
        isOpen={showReviewModal} onClose={() => setShowReviewModal(false)}
        review={selectedReview} employeeName={getEmployeeName(selectedReview)}
        form={managerForm} setForm={setManagerForm}
        onSubmit={handleManagerReview} submitting={submitting}
      />

      <ReviewDetailModal
        isOpen={showViewModal} onClose={() => setShowViewModal(false)}
        review={selectedReview}
      />
    </Layout>
  )
}
