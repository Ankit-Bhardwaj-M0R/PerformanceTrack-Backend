import React, { useState } from 'react';
import { Filter, Star } from 'lucide-react';
import { User } from '../../App';

interface ManagerReviewsProps {
  user: User;
  onNavigate: (view: string, id?: number) => void;
}

export function ManagerReviews({ user, onNavigate }: ManagerReviewsProps) {
  const [cycleFilter, setCycleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const reviews = [
    {
      id: 1,
      employee: 'John Employee',
      employeeId: 3,
      cycle: 'Q1 2026',
      status: 'PENDING_MANAGER_REVIEW',
      selfRating: 4,
      managerRating: null,
      submittedDate: '2026-01-20',
    },
    {
      id: 2,
      employee: 'Sarah Williams',
      employeeId: 6,
      cycle: 'Q1 2026',
      status: 'COMPLETED',
      selfRating: 4,
      managerRating: 4,
      submittedDate: '2026-01-18',
    },
    {
      id: 3,
      employee: 'Rahul Kumar',
      employeeId: 4,
      cycle: 'Q1 2026',
      status: 'PENDING_MANAGER_REVIEW',
      selfRating: 3,
      managerRating: null,
      submittedDate: '2026-01-21',
    },
    {
      id: 4,
      employee: 'John Employee',
      employeeId: 3,
      cycle: 'Q4 2025',
      status: 'COMPLETED_AND_ACKNOWLEDGED',
      selfRating: 4,
      managerRating: 4,
      submittedDate: '2025-12-15',
    },
    {
      id: 5,
      employee: 'Priya Shah',
      employeeId: 5,
      cycle: 'Q1 2026',
      status: 'SELF_ASSESSMENT_PENDING',
      selfRating: null,
      managerRating: null,
      submittedDate: null,
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      SELF_ASSESSMENT_PENDING: 'bg-yellow-100 text-yellow-700',
      PENDING_MANAGER_REVIEW: 'bg-orange-100 text-orange-700',
      COMPLETED: 'bg-green-100 text-green-700',
      COMPLETED_AND_ACKNOWLEDGED: 'bg-green-600 text-white',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-gray-400 text-sm">N/A</span>;
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesCycle = cycleFilter === 'ALL' || review.cycle === cycleFilter;
    const matchesStatus = statusFilter === 'ALL' || review.status === statusFilter;
    return matchesCycle && matchesStatus;
  });

  const pendingReviews = reviews.filter(r => r.status === 'PENDING_MANAGER_REVIEW').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Performance Reviews</h1>
        <p className="text-gray-600 mt-1">Review and provide feedback on team member performance</p>
      </div>

      {/* Alert for Pending Reviews */}
      {pendingReviews > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Star className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-800">
                You have {pendingReviews} review{pendingReviews !== 1 ? 's' : ''} awaiting your feedback
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Review Cycle</label>
            <select
              value={cycleFilter}
              onChange={(e) => setCycleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="ALL">All Cycles</option>
              <option value="Q1 2026">Q1 2026</option>
              <option value="Q4 2025">Q4 2025</option>
              <option value="Q3 2025">Q3 2025</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="SELF_ASSESSMENT_PENDING">Self-Assessment Pending</option>
              <option value="PENDING_MANAGER_REVIEW">Pending Manager Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="COMPLETED_AND_ACKNOWLEDGED">Completed & Acknowledged</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 mr-2 text-gray-600" />
              Advanced Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Self Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReviews.map((review, index) => (
                <tr key={review.id} className={`hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {review.employee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {review.cycle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(review.status)}`}>
                      {review.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStars(review.selfRating)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStars(review.managerRating)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {review.submittedDate || 'Not submitted'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {review.status === 'PENDING_MANAGER_REVIEW' ? (
                      <button
                        onClick={() => onNavigate('manager-review-detail', review.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Review Now →
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigate('manager-review-detail', review.id)}
                        className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                      >
                        View Details →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews found matching your filters</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{reviews.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending Action</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{pendingReviews}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {reviews.filter(r => r.status.includes('COMPLETED')).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Rating Given</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">4.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}