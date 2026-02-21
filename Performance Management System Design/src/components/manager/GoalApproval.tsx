import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, X } from 'lucide-react';
import { User } from '../../App';

interface GoalApprovalProps {
  goalId: number;
  user: User;
  onNavigate: (view: string, id?: number) => void;
}

export function GoalApproval({ goalId, user, onNavigate }: GoalApprovalProps) {
  const [showRequestChanges, setShowRequestChanges] = useState(false);
  const [comments, setComments] = useState('');

  const goal = {
    id: goalId,
    title: 'Code Review Process',
    description: 'Implement automated code review process with PR templates and quality gates. Set up linting rules and automated testing integration.',
    category: 'PROCESS',
    priority: 'High',
    startDate: '2026-02-01',
    endDate: '2026-03-20',
    employee: 'Rahul Kumar',
    submittedDate: '2026-01-21',
  };

  const handleApprove = () => {
    console.log('Approving goal:', goalId);
    onNavigate('team-goals');
  };

  const handleRequestChanges = () => {
    if (comments.trim()) {
      console.log('Requesting changes:', comments);
      setShowRequestChanges(false);
      onNavigate('team-goals');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('team-goals')}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Team Goals
      </button>

      {/* Review Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Review Goal #{goal.id}: {goal.title}</h1>
        <p className="text-gray-600">Submitted by {goal.employee} on {goal.submittedDate}</p>
      </div>

      {/* Goal Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Employee</p>
            <p className="text-base font-medium text-gray-900">{goal.employee}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Category</p>
            <p className="text-base font-medium text-gray-900">{goal.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Priority</p>
            <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-700">
              {goal.priority}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Timeline</p>
            <p className="text-base font-medium text-gray-900">
              {goal.startDate} to {goal.endDate}
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <p className="text-gray-700 leading-relaxed">{goal.description}</p>
        </div>
      </div>

      {/* Manager Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Manager Actions</h2>
        <p className="text-sm text-gray-600 mb-6">
          Review the goal details and approve or request changes from the employee.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowRequestChanges(true)}
            className="flex items-center px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-medium"
          >
            <X className="w-5 h-5 mr-2" />
            Request Changes
          </button>
          <button
            onClick={handleApprove}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Approve Goal
          </button>
        </div>
      </div>

      {/* Request Changes Modal */}
      {showRequestChanges && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Request Changes</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Provide detailed feedback on what needs to be changed..."
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRequestChanges(false);
                  setComments('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={!comments.trim()}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}