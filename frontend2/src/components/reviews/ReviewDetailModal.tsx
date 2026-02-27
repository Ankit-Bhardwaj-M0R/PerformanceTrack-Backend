import React from 'react'
import Modal from '../common/Modal'
import StatusBadge from '../common/StatusBadge'
import type { PerformanceReviewResponseDTO } from '../../types'

/**
 * Read-only review detail modal — shows self-assessment, manager review, and employee response.
 */
interface ReviewDetailModalProps {
  isOpen: boolean
  onClose: () => void
  review: PerformanceReviewResponseDTO | null
}

export default function ReviewDetailModal({ isOpen, onClose, review }: ReviewDetailModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Details" size="lg">
      {review && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <StatusBadge status={review.status} />
            <span className="text-sm text-gray-500">
              Submitted: {review.submittedDate?.split('T')[0]}
            </span>
          </div>

          {review.selfAssessment && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase mb-2">
                Self-Assessment
              </p>
              <p className="text-sm text-gray-700">{review.selfAssessment}</p>
              <p className="text-xs text-blue-600 mt-2">
                Self Rating: {review.employeeSelfRating}/5
              </p>
            </div>
          )}

          {review.managerFeedback && (
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-green-700 uppercase mb-2">
                Manager Review
              </p>
              <p className="text-sm text-gray-700">{review.managerFeedback}</p>
              <p className="text-xs text-green-600 mt-2">
                Manager Rating: {review.managerRating}/5
              </p>
              {review.ratingJustification && (
                <p className="text-xs text-gray-500 mt-1">
                  Justification: {review.ratingJustification}
                </p>
              )}
              {review.compensationRecommendations && (
                <p className="text-xs text-gray-500 mt-1">
                  Compensation: {review.compensationRecommendations}
                </p>
              )}
            </div>
          )}

          {review.employeeResponse && (
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-purple-700 uppercase mb-2">
                Employee Response
              </p>
              <p className="text-sm text-gray-700">{review.employeeResponse}</p>
            </div>
          )}

          <button onClick={onClose} className="btn-secondary w-full">
            Close
          </button>
        </div>
      )}
    </Modal>
  )
}
