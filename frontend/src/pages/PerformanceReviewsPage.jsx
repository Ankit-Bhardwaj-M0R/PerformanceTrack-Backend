import React, { useState, useEffect } from 'react'
import { ClipboardList, ChevronDown, Star, CheckCircle, Send, Eye } from 'lucide-react'
import Layout from '../components/layout/Layout'
import Modal from '../components/common/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import StatusBadge from '../components/common/StatusBadge'
import Pagination from '../components/common/Pagination'
import { useAuth } from '../context/AuthContext'
import { performanceReviewService, reviewCycleService } from '../services/reviewService'
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

  // ─── Star Rating Component ────────────────────────────────────────────────
  const StarRating = ({ value, onChange, readOnly = false }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readOnly && onChange && onChange(star)}
          className={`text-2xl transition-colors ${
            star <= value ? 'text-yellow-400' : 'text-gray-200'
          } ${!readOnly ? 'hover:text-yellow-300 cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-500 self-center">{value}/5</span>
    </div>
  )

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Layout title="Performance Reviews">
      {/* Active Cycle Banner */}
      {activeCycle && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-800">Active Review Cycle</p>
            <p className="text-lg font-bold text-blue-900">{activeCycle.title}</p>
            <p className="text-xs text-blue-600">
              {activeCycle.startDate} → {activeCycle.endDate}
            </p>
          </div>
          {/* Employee: Submit self-assessment */}
          {isEmployee() && (
            <button
              onClick={() => setShowSelfAssessmentModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Send size={16} /> Submit Self-Assessment
            </button>
          )}
        </div>
      )}

      {/* No Active Cycle */}
      {!activeCycle && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-yellow-800 text-sm">
          No active review cycle at this time. Contact your administrator.
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <LoadingSpinner message="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <div className="card text-center py-16">
          <ClipboardList size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">No performance reviews found</p>
          <p className="text-gray-400 text-sm mt-1">
            {isEmployee()
              ? 'Submit your self-assessment during an active review cycle.'
              : 'Team reviews will appear here once employees submit their self-assessments.'}
          </p>
        </div>
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
              onView={() => {
                setSelectedReview(review)
                setShowViewModal(true)
              }}
            />
          ))}
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* Self-Assessment Modal (Employee) */}
      <Modal isOpen={showSelfAssessmentModal} onClose={() => setShowSelfAssessmentModal(false)}
        title="Submit Self-Assessment" size="lg">
        <form onSubmit={handleSelfAssessment} className="space-y-5">
          {activeCycle && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
              Review Cycle: <strong>{activeCycle.title}</strong>
            </div>
          )}
          <div>
            <label className="form-label">Self-Assessment *</label>
            <p className="text-xs text-gray-500 mb-2">
              Reflect on your performance this cycle. What did you accomplish? What challenges did you face?
            </p>
            <textarea className="input-field" rows={6}
              value={selfForm.selfAssessment}
              onChange={e => setSelfForm({ ...selfForm, selfAssessment: e.target.value })}
              placeholder="Describe your achievements, learnings, and areas for growth..." />
          </div>
          <div>
            <label className="form-label">Self Rating</label>
            <div className="mt-2">
              <StarRating
                value={selfForm.employeeSelfRating}
                onChange={(v) => setSelfForm({ ...selfForm, employeeSelfRating: v })}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowSelfAssessmentModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Manager Review Modal */}
      <Modal isOpen={showManagerReviewModal} onClose={() => setShowManagerReviewModal(false)}
        title="Submit Manager Review" size="lg">
        <form onSubmit={handleManagerReview} className="space-y-4">
          {selectedReview && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium">Employee Self-Assessment:</p>
              <p className="text-gray-600 mt-1">{selectedReview.selfAssessment || 'Not provided'}</p>
              <p className="text-xs text-gray-400 mt-2">Self Rating: {selectedReview.employeeSelfRating}/5</p>
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
              <StarRating
                value={managerForm.managerRating}
                onChange={(v) => setManagerForm({ ...managerForm, managerRating: v })}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Rating Justification *</label>
            <textarea className="input-field" rows={3}
              value={managerForm.ratingJustification}
              onChange={e => setManagerForm({ ...managerForm, ratingJustification: e.target.value })}
              placeholder="Explain why you gave this rating..." />
          </div>
          <div>
            <label className="form-label">Compensation Recommendations</label>
            <input className="input-field" value={managerForm.compensationRecommendations}
              onChange={e => setManagerForm({ ...managerForm, compensationRecommendations: e.target.value })}
              placeholder="e.g., 10% salary increase, bonus eligible" />
          </div>
          <div>
            <label className="form-label">Goals for Next Period</label>
            <textarea className="input-field" rows={3}
              value={managerForm.nextPeriodGoals}
              onChange={e => setManagerForm({ ...managerForm, nextPeriodGoals: e.target.value })}
              placeholder="Suggest goals for the next review cycle..." />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowManagerReviewModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Acknowledge Modal (Employee) */}
      <Modal isOpen={showAcknowledgeModal} onClose={() => setShowAcknowledgeModal(false)}
        title="Acknowledge Manager Review">
        <form onSubmit={handleAcknowledge} className="space-y-4">
          {selectedReview && (
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-700">Manager Feedback:</p>
                <p className="text-gray-600 mt-1">{selectedReview.managerFeedback}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star size={16} className="text-yellow-400" />
                Manager Rating: <strong>{selectedReview.managerRating}/5</strong>
              </div>
            </div>
          )}
          <div>
            <label className="form-label">Your Response (optional)</label>
            <textarea className="input-field" rows={4}
              value={acknowledgeForm.employeeResponse}
              onChange={e => setAcknowledgeForm({ ...acknowledgeForm, employeeResponse: e.target.value })}
              placeholder="Share any thoughts or comments on this review..." />
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            By acknowledging, you confirm you have read and understood the review.
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowAcknowledgeModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-success flex-1">
              {submitting ? 'Processing...' : 'Acknowledge Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Review Details Modal */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)}
        title="Review Details" size="lg">
        {selectedReview && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <StatusBadge status={selectedReview.status} />
              <span className="text-sm text-gray-500">Submitted: {selectedReview.submittedDate?.split('T')[0]}</span>
            </div>
            {selectedReview.selfAssessment && (
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-blue-700 uppercase mb-2">Self-Assessment</p>
                <p className="text-sm text-gray-700">{selectedReview.selfAssessment}</p>
                <p className="text-xs text-blue-600 mt-2">Self Rating: {selectedReview.employeeSelfRating}/5</p>
              </div>
            )}
            {selectedReview.managerFeedback && (
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-green-700 uppercase mb-2">Manager Review</p>
                <p className="text-sm text-gray-700">{selectedReview.managerFeedback}</p>
                <p className="text-xs text-green-600 mt-2">Manager Rating: {selectedReview.managerRating}/5</p>
                {selectedReview.ratingJustification && (
                  <p className="text-xs text-gray-500 mt-1">Justification: {selectedReview.ratingJustification}</p>
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

// ─── REVIEW CARD COMPONENT ───────────────────────────────────────────────────
function ReviewCard({ review, user, isManager, isEmployee, onManagerReview, onAcknowledge, onView }) {
  const isMyReview = review.userId === user?.userId
  const isManagerReview = review.reviewedBy === user?.userId

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={review.status} />
            <span className="text-sm font-medium text-gray-800">
              {isManager ? `User ID: ${review.userId}` : 'My Review'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {review.submittedDate ? `Submitted: ${review.submittedDate?.split('T')[0]}` : 'Draft'}
            {review.managerRating && ` · Manager Rating: ${review.managerRating}/5`}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button onClick={onView} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
            <Eye size={14} /> View
          </button>
          {isManager && review.status === 'SELF_ASSESSMENT_COMPLETED' && (
            <button onClick={onManagerReview} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
              <ClipboardList size={14} /> Review
            </button>
          )}
          {isEmployee && isMyReview && review.status === 'MANAGER_REVIEW_COMPLETED' && (
            <button onClick={onAcknowledge} className="btn-success text-xs py-1.5 px-3 flex items-center gap-1">
              <CheckCircle size={14} /> Acknowledge
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
