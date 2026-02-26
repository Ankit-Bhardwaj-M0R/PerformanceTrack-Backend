import { Eye, ClipboardList, CheckCircle } from 'lucide-react'
import StatusBadge from '../common/StatusBadge'

/**
 * Single review row / card — used on both EmployeeReviewsPage and ManagerReviewsPage (card view).
 *
 * Props:
 *  review, user, isManager, isEmployee
 *  onManagerReview, onAcknowledge, onView
 */
export default function ReviewCard({ review, user, isManager, isEmployee, onManagerReview, onAcknowledge, onView }) {
  const isMyReview = review.userId === user?.userId

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

        <div className="flex gap-2">
          <button onClick={onView} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
            <Eye size={14} /> View
          </button>
          {isManager && review.status === 'SELF_ASSESSMENT_COMPLETED' && (
            <button onClick={onManagerReview} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
              <ClipboardList size={14} /> Review
            </button>
          )}
          {isEmployee && isMyReview && review.status === 'COMPLETED' && (
            <button onClick={onAcknowledge} className="btn-success text-xs py-1.5 px-3 flex items-center gap-1">
              <CheckCircle size={14} /> Acknowledge
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
