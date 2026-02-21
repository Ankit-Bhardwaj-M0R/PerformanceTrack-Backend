import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Plus, CheckCircle, ExternalLink } from 'lucide-react';
import { User } from '../../App';

interface GoalDetailProps {
  goalId: number;
  user: User;
  onNavigate: (view: string, id?: number) => void;
}

export function GoalDetail({ goalId, user, onNavigate }: GoalDetailProps) {
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [showSubmitCompletion, setShowSubmitCompletion] = useState(false);
  const [progressNote, setProgressNote] = useState('');

  // Mock goal data
  const goal = {
    id: goalId,
    title: 'API Optimization',
    description: 'Optimize database queries and implement Redis caching to improve API response time by 30%. Focus on high-traffic endpoints and implement query optimization strategies.',
    category: 'TECHNICAL',
    priority: 'High',
    status: 'IN_PROGRESS',
    startDate: '2026-01-10',
    endDate: '2026-03-15',
    progress: 65,
    employee: 'John Employee',
    manager: 'Jane Manager',
  };

  const progressTimeline = [
    { id: 1, date: '2026-01-15', event: 'Goal created', type: 'system' },
    { id: 2, date: '2026-01-16', event: 'Manager approved', type: 'system' },
    { id: 3, date: '2026-01-20', note: 'Completed Redis setup and initial testing. Achieved 15% performance improvement on auth endpoints.', type: 'progress' },
    { id: 4, date: '2026-01-28', note: 'Optimized database queries for user profile endpoints. Now seeing 25% improvement.', type: 'progress' },
    { id: 5, date: '2026-02-05', note: 'Implemented caching layer for product catalog. Total improvement now at 35%.', type: 'progress' },
  ];

  const feedback = [
    { id: 1, date: '2026-01-22', from: 'Jane Manager', type: 'positive', message: 'Great progress on the Redis implementation! Keep up the excellent work.' },
    { id: 2, date: '2026-02-01', from: 'Jane Manager', type: 'constructive', message: 'Consider documenting the caching strategy for the team.' },
  ];

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-gray-100 text-gray-700',
      APPROVED: 'bg-green-100 text-green-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-600 text-white',
      CHANGES_REQUESTED: 'bg-yellow-100 text-yellow-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      Low: 'bg-green-100 text-green-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      High: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const handleAddProgress = () => {
    if (progressNote.trim()) {
      console.log('Adding progress:', progressNote);
      setProgressNote('');
      setShowAddProgress(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('my-goals')}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Goals
      </button>

      {/* Goal Header Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Goal #{goal.id}: {goal.title}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(goal.status)}`}>
                {goal.status.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(goal.priority)}`}>
                {goal.priority} Priority
              </span>
              <span className="text-sm text-gray-600">Due: {goal.endDate}</span>
            </div>
          </div>
          
          {goal.status === 'PENDING' && (
            <div className="flex space-x-2">
              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                <Edit className="w-5 h-5" />
              </button>
              <button className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-900">{goal.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${goal.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Goal Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Category</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{goal.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Start Date</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{goal.startDate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Manager</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{goal.manager}</p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
        <p className="text-gray-700 leading-relaxed">{goal.description}</p>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Progress Timeline</h2>
          {goal.status === 'IN_PROGRESS' && user.role === 'EMPLOYEE' && (
            <button
              onClick={() => setShowAddProgress(!showAddProgress)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Progress Note
            </button>
          )}
        </div>

        {showAddProgress && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <textarea
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              placeholder="Describe your progress..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => {
                  setShowAddProgress(false);
                  setProgressNote('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProgress}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Add Progress
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {progressTimeline.map((item) => (
            <div key={item.id} className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">{item.date}</p>
                {item.type === 'system' ? (
                  <p className="text-sm font-medium text-gray-900 mt-1">{item.event}</p>
                ) : (
                  <p className="text-sm text-gray-700 mt-1">{item.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Section */}
      {feedback.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manager Feedback</h2>
          <div className="space-y-4">
            {feedback.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-lg border ${
                  item.type === 'positive'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{item.from}</span>
                  <span className="text-xs text-gray-600">{item.date}</span>
                </div>
                <p className="text-sm text-gray-700">{item.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {goal.status === 'IN_PROGRESS' && user.role === 'EMPLOYEE' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSubmitCompletion(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
            >
              Submit Completion
            </button>
          </div>
        </div>
      )}

      {/* Submit Completion Modal */}
      {showSubmitCompletion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Submit Goal Completion</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Link</label>
                <input
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Description</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Describe the evidence..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Access Instructions</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="How to access the evidence..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Completion Notes</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Summarize your achievement..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowSubmitCompletion(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Submitting completion');
                  setShowSubmitCompletion(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Submit Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}