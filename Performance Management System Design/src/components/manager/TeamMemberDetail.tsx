import React from 'react';
import { ArrowLeft, Mail, Target, TrendingUp, Award } from 'lucide-react';
import { User } from '../../App';

interface TeamMemberDetailProps {
  memberId: number;
  user: User;
  onNavigate: (view: string) => void;
}

export function TeamMemberDetail({ memberId, user, onNavigate }: TeamMemberDetailProps) {
  // Mock team member data
  const member = {
    id: memberId,
    name: 'John Employee',
    email: 'john@test.com',
    department: 'Engineering',
    role: 'EMPLOYEE',
    joinDate: '2024-03-15',
    manager: 'Jane Manager',
  };

  const goals = [
    { id: 1, title: 'API Optimization', status: 'IN_PROGRESS', progress: 65, dueDate: '2026-03-15' },
    { id: 2, title: 'Team Documentation', status: 'APPROVED', progress: 30, dueDate: '2026-04-01' },
    { id: 3, title: 'Code Review Process', status: 'COMPLETED', progress: 100, dueDate: '2026-02-15' },
  ];

  const reviews = [
    { id: 1, cycle: 'Q4 2025', rating: 4, status: 'COMPLETED_AND_ACKNOWLEDGED', date: '2025-12-20' },
    { id: 2, cycle: 'Q3 2025', rating: 4, status: 'COMPLETED', date: '2025-09-25' },
  ];

  const recentFeedback = [
    { id: 1, date: '2026-01-22', type: 'POSITIVE', message: 'Great work on the Redis implementation!' },
    { id: 2, date: '2026-01-15', type: 'CONSTRUCTIVE', message: 'Consider documenting the caching strategy.' },
  ];

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-gray-100 text-gray-700',
      APPROVED: 'bg-green-100 text-green-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-600 text-white',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('team-members')}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Team Members
      </button>

      {/* Member Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mr-6">
              <span className="text-3xl font-bold text-blue-600">
                {member.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {member.email}
                </div>
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                  {member.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Department</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{member.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Manager</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{member.manager}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Join Date</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{member.joinDate}</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Goals</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {goals.filter(g => g.status !== 'COMPLETED').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-2">80%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Rating</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">4.0</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Current Goals */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Current Goals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {goals.map((goal) => (
                <tr key={goal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{goal.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.status)}`}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{goal.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{goal.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Reviews */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Performance Review History</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{review.cycle}</p>
                  <p className="text-xs text-gray-600 mt-1">{review.date}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">Rating: {review.rating}/5</p>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      {review.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Feedback</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className={`p-4 rounded-lg border-2 ${
                  feedback.type === 'POSITIVE'
                    ? 'border-green-200 bg-green-50'
                    : 'border-orange-200 bg-orange-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">{feedback.date}</span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      feedback.type === 'POSITIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {feedback.type}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{feedback.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}