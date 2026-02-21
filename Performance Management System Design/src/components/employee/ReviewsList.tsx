import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { User } from '../../App';

interface ReviewsListProps {
  user: User;
  onNavigate: (view: string, id?: number) => void;
}

export function ReviewsList({ user, onNavigate }: ReviewsListProps) {
  const reviews = [
    { id: 1, cycle: 'Q1 2026', status: 'SELF_ASSESSMENT_PENDING', dueDate: '2026-03-31', progress: 0 },
    { id: 2, cycle: 'Q4 2025', status: 'COMPLETED_AND_ACKNOWLEDGED', dueDate: '-', progress: 100 },
    { id: 3, cycle: 'Q3 2025', status: 'COMPLETED', dueDate: '-', progress: 100 },
  ];

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      SELF_ASSESSMENT_PENDING: 'bg-yellow-100 text-yellow-700',
      MANAGER_REVIEW_PENDING: 'bg-orange-100 text-orange-700',
      COMPLETED: 'bg-green-100 text-green-700',
      COMPLETED_AND_ACKNOWLEDGED: 'bg-green-600 text-white',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Performance Reviews</h1>
        <p className="text-gray-600 mt-1">View and manage your performance reviews</p>
      </div>

      {/* Active Cycle Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Current Cycle: Q1 2026</h3>
            <p className="text-sm text-blue-700 mt-1">Status: Self-Assessment Pending</p>
            <p className="text-sm text-blue-600 mt-1">Due Date: March 31, 2026</p>
          </div>
          <button 
            onClick={() => onNavigate('self-assessment')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Start Self-Assessment
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cycle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {review.cycle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(review.status)}`}>
                      {review.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{review.dueDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${review.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{review.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        if (review.status === 'SELF_ASSESSMENT_PENDING') {
                          onNavigate('self-assessment');
                        } else {
                          onNavigate('review-detail', review.id);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {review.status === 'SELF_ASSESSMENT_PENDING' ? 'Start Assessment →' : 'View Details →'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}