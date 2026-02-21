import React, { useState } from 'react';
import { ArrowLeft, Star, Save } from 'lucide-react';
import { User } from '../../App';

interface ManagerReviewDetailProps {
  reviewId: number;
  user: User;
  onNavigate: (view: string) => void;
}

export function ManagerReviewDetail({ reviewId, user, onNavigate }: ManagerReviewDetailProps) {
  // Mock review data - status determines what form shows
  const review = {
    id: reviewId,
    employee: 'John Employee',
    employeeId: 3,
    cycle: 'Q1 2026',
    status: reviewId === 1 ? 'PENDING_MANAGER_REVIEW' : 'COMPLETED',
    selfRating: 4,
    managerRating: reviewId === 1 ? null : 4,
    submittedDate: '2026-01-20',
    selfAssessment: {
      achievements: 'Completed API optimization project with 35% improvement, mentored 2 junior developers, led code review initiative.',
      challenges: 'Initial Redis configuration was complex, required learning new caching strategies and debugging performance issues.',
      learnings: 'Advanced caching techniques, performance optimization strategies, team leadership skills.',
    },
  };

  const [formData, setFormData] = useState({
    managerFeedback: review.status === 'COMPLETED' ? 'John demonstrated exceptional technical skills and exceeded expectations. Strong problem-solving and mentorship.' : '',
    managerRating: review.managerRating || 0,
    ratingJustification: review.status === 'COMPLETED' ? 'Exceeded the 30% target with 35% improvement. Excellent leadership in code review initiative.' : '',
    compensationRecommendations: review.status === 'COMPLETED' ? 'Merit increase: 5-7%, Bonus: $2500' : '',
    nextPeriodGoals: review.status === 'COMPLETED' ? 'Lead microservices migration project, mentor 3 junior developers, improve cross-team communication' : '',
  });

  const [hoverRating, setHoverRating] = useState(0);

  const isPendingReview = review.status === 'PENDING_MANAGER_REVIEW';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting manager review:', formData);
    alert('Manager review submitted successfully!');
    onNavigate('manager-reviews');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('manager-reviews')}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Reviews
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isPendingReview ? 'Complete Performance Review' : 'View Performance Review'}
        </h1>
        <p className="text-gray-600">{review.employee} - {review.cycle}</p>
        <p className="text-sm text-gray-500 mt-1">Submitted: {review.submittedDate}</p>
      </div>

      {/* Employee Self-Assessment (Read-Only) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Self-Assessment</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Self-Rating</label>
            {renderStars(review.selfRating)}
            <span className="text-sm text-gray-600 ml-2">{review.selfRating}/5</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Achievements</label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {review.selfAssessment.achievements}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Challenges Faced</label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {review.selfAssessment.challenges}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Key Learnings & Growth</label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {review.selfAssessment.learnings}
            </div>
          </div>
        </div>
      </div>

      {/* Manager Review Form or Read-Only */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manager Review</h2>
          
          <div className="space-y-6">
            {/* Manager Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Manager Rating {isPendingReview && <span className="text-red-500">*</span>}
              </label>
              {isPendingReview ? (
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, managerRating: rating })}
                      onMouseEnter={() => setHoverRating(rating)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          rating <= (hoverRating || formData.managerRating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {formData.managerRating > 0 && (
                    <span className="ml-4 text-lg font-semibold text-gray-900">
                      {formData.managerRating}/5
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center">
                  {renderStars(formData.managerRating)}
                  <span className="ml-2 text-sm text-gray-600">{formData.managerRating}/5</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                1 = Needs Improvement, 3 = Meets Expectations, 5 = Exceeds Expectations
              </p>
            </div>

            {/* Manager Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manager Feedback {isPendingReview && <span className="text-red-500">*</span>}
              </label>
              {isPendingReview ? (
                <textarea
                  required
                  value={formData.managerFeedback}
                  onChange={(e) => setFormData({ ...formData, managerFeedback: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Provide detailed feedback on strengths, areas for improvement, and overall performance..."
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {formData.managerFeedback}
                </div>
              )}
            </div>

            {/* Rating Justification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating Justification {isPendingReview && <span className="text-red-500">*</span>}
              </label>
              {isPendingReview ? (
                <textarea
                  required
                  value={formData.ratingJustification}
                  onChange={(e) => setFormData({ ...formData, ratingJustification: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Explain why you gave this rating..."
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {formData.ratingJustification}
                </div>
              )}
            </div>

            {/* Compensation Recommendations */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compensation Recommendations
              </label>
              {isPendingReview ? (
                <textarea
                  value={formData.compensationRecommendations}
                  onChange={(e) => setFormData({ ...formData, compensationRecommendations: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., Merit increase: 5%, Bonus: $2000"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {formData.compensationRecommendations}
                </div>
              )}
            </div>

            {/* Next Period Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goals for Next Period
              </label>
              {isPendingReview ? (
                <textarea
                  value={formData.nextPeriodGoals}
                  onChange={(e) => setFormData({ ...formData, nextPeriodGoals: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Suggest goals and development areas for the next review period..."
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                  {formData.nextPeriodGoals}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isPendingReview && (
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => {
                console.log('Saving draft');
                alert('Draft saved!');
              }}
              className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Draft
            </button>
            <button
              type="submit"
              disabled={formData.managerRating === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Review
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
