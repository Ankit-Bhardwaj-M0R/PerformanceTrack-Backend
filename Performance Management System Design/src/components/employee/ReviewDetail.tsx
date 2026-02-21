import React, { useState } from 'react';
import { ArrowLeft, Star } from 'lucide-react';
import { User } from '../../App';

interface ReviewDetailProps {
  reviewId: number;
  user: User;
  onNavigate: (view: string, id?: number) => void;
}

export function ReviewDetail({ reviewId, user, onNavigate }: ReviewDetailProps) {
  const [showAcknowledge, setShowAcknowledge] = useState(false);
  const [response, setResponse] = useState('');

  const review = {
    id: reviewId,
    cycle: 'Q4 2025',
    status: 'COMPLETED',
    period: 'October 1 - December 31, 2025',
    selfAssessment: 'During Q4 2025, I successfully completed the API optimization project, achieving 35% improvement in response times. I also mentored two junior developers and contributed to the team documentation initiative.',
    selfRating: 4,
    managerFeedback: 'John demonstrated exceptional technical skills and leadership during this quarter. The API optimization project exceeded expectations and showed strong problem-solving abilities. His mentorship of junior team members has been valuable for team growth.',
    managerRating: 4,
    ratingJustification: 'Consistently exceeded performance expectations in technical delivery and team collaboration. Strong initiative in identifying and solving performance bottlenecks.',
    compensationRecommendations: 'Recommend 8% salary increase based on exceptional performance and expanded responsibilities.',
    nextCycleGoals: 'Focus on: 1) Leading the microservices migration project, 2) Developing advanced system architecture skills, 3) Continuing mentorship of junior developers',
    acknowledged: false,
  };

  const handleAcknowledge = () => {
    console.log('Acknowledging review with response:', response);
    setShowAcknowledge(false);
    onNavigate('my-reviews');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => onNavigate('my-reviews')}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Reviews
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{review.cycle} Performance Review</h1>
        <p className="text-gray-600">Review Period: {review.period}</p>
        <div className="flex items-center space-x-3 mt-3">
          <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700">
            {review.status}
          </span>
          <span className="text-sm text-gray-600">Overall Rating: {review.managerRating}/5</span>
        </div>
      </div>

      {/* Self Assessment */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Self-Assessment</h2>
        <p className="text-gray-700 leading-relaxed mb-4">{review.selfAssessment}</p>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Self-Rating:</p>
          {renderStars(review.selfRating)}
        </div>
      </div>

      {/* Manager's Feedback */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Manager's Feedback</h2>
        <p className="text-gray-700 leading-relaxed mb-4">{review.managerFeedback}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Manager Rating:</p>
            {renderStars(review.managerRating)}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Rating Justification</h3>
          <p className="text-gray-700">{review.ratingJustification}</p>
        </div>
      </div>

      {/* Compensation Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Compensation Recommendations</h2>
        <p className="text-gray-700">{review.compensationRecommendations}</p>
      </div>

      {/* Next Cycle Goals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Next Cycle Goals</h2>
        <p className="text-gray-700">{review.nextCycleGoals}</p>
      </div>

      {/* Acknowledge Button */}
      {!review.acknowledged && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Action Required</h2>
          <p className="text-gray-700 mb-4">Please acknowledge that you have reviewed this performance assessment.</p>
          <button
            onClick={() => setShowAcknowledge(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Acknowledge Review
          </button>
        </div>
      )}

      {/* Acknowledge Modal */}
      {showAcknowledge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Acknowledge Review</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response/Comments (Optional)
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Add any comments or responses to this review..."
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAcknowledge(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAcknowledge}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Acknowledge Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
