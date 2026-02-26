import React, { useState, useEffect } from 'react'
import { ClipboardList, Send } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import EmptyState from '../../components/common/EmptyState'
import ReviewCard from '../../components/reviews/ReviewCard'
import ReviewDetailModal from '../../components/reviews/ReviewDetailModal'
import SelfAssessmentModal from '../../components/reviews/SelfAssessmentModal'
import ManagerReviewModal from '../../components/reviews/ManagerReviewModal'
import AcknowledgeModal from '../../components/reviews/AcknowledgeModal'
import { useAuth } from '../../context/AuthContext'
import { performanceReviewService, reviewCycleService } from '../../services/reviewService'
import toast from 'react-hot-toast'

// ─── PERFORMANCE REVIEWS PAGE ─────────────────────────────────────────────────
// Manages the full review workflow:
//   EMPLOYEE: Submit self-assessment → Acknowledge manager's review
//   MANAGER:  Submit manager rating and feedback
//
// APIs Used:
//   GET  /api/v1/performance-reviews
//   POST /api/v1/performance-reviews         (self-assessment)
//   PUT  /api/v1/performance-reviews/{id}    (manager review)
//   PUT  /api/v1/performance-reviews/{id}/draft
//   POST /api/v1/performance-reviews/{id}/acknowledge
//   GET  /api/v1/review-cycles/active
// ─────────────────────────────────────────────────────────────────────────────

export default function PerformanceReviewsPage() {
  const { user, isAdmin, isManager, isEmployee } = useAuth()

  const [reviews, setReviews] = useState([])
  const [activeCycle, setActiveCycle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Modals
  const [showSelfAssessmentModal, setShowSelfAssessmentModal] = useState(false)
  const [showManagerReviewModal, setShowManagerReviewModal] = useState(false)
  const [showAcknowledgeModal, setShowAcknowledgeModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Self-assessment form state
  const [selfForm, setSelfForm] = useState({
    selfAssessment: '',
    employeeSelfRating: 3,
  })

  // Manager review form state
  const [managerForm, setManagerForm] = useState({
    managerFeedback: '',
    managerRating: 3,
    ratingJustification: '',
    compensationRecommendations: '',
    nextPeriodGoals: '',
  })

  // Acknowledge form
  const [acknowledgeForm, setAcknowledgeForm] = useState({ employeeResponse: '' })

  // ─── Load Data ────────────────────────────────────────────────────────────
  useEffect(() => {
    loadData()
  }, [page])

  const loadData = async () => {
    setLoading(true)
    try {
      const [reviewsData, cycleData] = await Promise.allSettled([
        performanceReviewService.getReviews(page, 10),
        reviewCycleService.getActiveCycle(),
      ])

      if (reviewsData.status === 'fulfilled') {
        const list = reviewsData.value?.content || reviewsData.value || []
        setReviews(list)
        setTotalPages(reviewsData.value?.totalPages || 1)
      }
      if (cycleData.status === 'fulfilled') {
        setActiveCycle(cycleData.value?.data || cycleData.value)
      }
    } catch (err) {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  // ─── EMPLOYEE: Submit Self-Assessment ─────────────────────────────────────
  const handleSelfAssessment = async (e) => {
    e.preventDefault()
    if (!selfForm.selfAssessment) { toast.error('Self-assessment is required'); return }
    if (!activeCycle) { toast.error('No active review cycle found'); return }

    setSubmitting(true)
    try {
      await performanceReviewService.submitSelfAssessment({
        cycleId: activeCycle.cycleId,
        selfAssessment: selfForm.selfAssessment,
        employeeSelfRating: selfForm.employeeSelfRating,
      })
      toast.success('Self-assessment submitted!')
      setShowSelfAssessmentModal(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── MANAGER: Submit Manager Review ───────────────────────────────────────
  const handleManagerReview = async (e) => {
    e.preventDefault()
    if (!managerForm.managerFeedback || !managerForm.ratingJustification) {
      toast.error('Feedback and justification are required')
      return
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

  // ─── EMPLOYEE: Acknowledge Review ─────────────────────────────────────────
  const handleAcknowledge = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await performanceReviewService.acknowledgeReview(
        selectedReview.reviewId,
        acknowledgeForm.employeeResponse
      )
      toast.success('Review acknowledged!')
      setShowAcknowledgeModal(false)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to acknowledge')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Layout title="Performance Reviews">
      {/* Active Cycle Banner */}
      {activeCycle && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-800">Active Review Cycle</p>
            <p className="text-lg font-bold text-blue-900">{activeCycle.title}</p>
            <p className="text-xs text-blue-600">{activeCycle.startDate} → {activeCycle.endDate}</p>
          </div>
          {isEmployee() && (
            <button onClick={() => setShowSelfAssessmentModal(true)} className="btn-primary flex items-center gap-2">
              <Send size={16} /> Submit Self-Assessment
            </button>
          )}
        </div>
      )}

      {!activeCycle && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-yellow-800 text-sm">
          No active review cycle at this time. Contact your administrator.
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No performance reviews found"
          subtitle={isEmployee()
            ? 'Submit your self-assessment during an active review cycle.'
            : 'Team reviews will appear here once employees submit their self-assessments.'}
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.reviewId}
              review={review}
              user={user}
              isManager={isManager()}
              isEmployee={isEmployee()}
              onManagerReview={() => {
                setSelectedReview(review)
                setManagerForm({ managerFeedback: '', managerRating: 3, ratingJustification: '', compensationRecommendations: '', nextPeriodGoals: '' })
                setShowManagerReviewModal(true)
              }}
              onAcknowledge={() => {
                setSelectedReview(review)
                setAcknowledgeForm({ employeeResponse: '' })
                setShowAcknowledgeModal(true)
              }}
              onView={() => { setSelectedReview(review); setShowViewModal(true) }}
            />
          ))}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* ── Modals ── */}
      <SelfAssessmentModal
        isOpen={showSelfAssessmentModal} onClose={() => setShowSelfAssessmentModal(false)}
        activeCycle={activeCycle} form={selfForm} setForm={setSelfForm}
        onSubmit={handleSelfAssessment} submitting={submitting}
      />

      <ManagerReviewModal
        isOpen={showManagerReviewModal} onClose={() => setShowManagerReviewModal(false)}
        review={selectedReview} form={managerForm} setForm={setManagerForm}
        onSubmit={handleManagerReview} submitting={submitting}
      />

      <AcknowledgeModal
        isOpen={showAcknowledgeModal} onClose={() => setShowAcknowledgeModal(false)}
        review={selectedReview} form={acknowledgeForm} setForm={setAcknowledgeForm}
        onSubmit={handleAcknowledge} submitting={submitting}
      />

      <ReviewDetailModal
        isOpen={showViewModal} onClose={() => setShowViewModal(false)}
        review={selectedReview}
      />
    </Layout>
  )
}
