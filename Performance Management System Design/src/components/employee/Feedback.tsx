import React, { useState } from 'react';
import { MessageSquare, ThumbsUp, AlertCircle } from 'lucide-react';
import { User } from '../../App';

interface FeedbackProps {
  user: User;
}

export function Feedback({ user }: FeedbackProps) {
  const [selectedGoal, setSelectedGoal] = useState('all');

  const feedbackList = [
    {
      id: 1,
      goalId: 1,
      goalTitle: 'API Optimization',
      from: 'Jane Manager',
      date: '2026-01-22',
      type: 'POSITIVE',
      message: 'Great work on the Redis implementation! The 35% improvement is impressive and shows excellent problem-solving skills.',
    },
    {
      id: 2,
      goalId: 1,
      goalTitle: 'API Optimization',
      from: 'Jane Manager',
      date: '2026-02-01',
      type: 'CONSTRUCTIVE',
      message: 'Consider documenting the caching strategy for the team. This will help others understand the implementation.',
    },
    {
      id: 3,
      goalId: 2,
      goalTitle: 'Team Documentation',
      from: 'Jane Manager',
      date: '2026-02-10',
      type: 'POSITIVE',
      message: 'The documentation structure you created is very well organized. Good job!',
    },
    {
      id: 4,
      goalId: 3,
      goalTitle: 'Code Review Process',
      from: 'Jane Manager',
      date: '2026-02-15',
      type: 'CONSTRUCTIVE',
      message: 'Try to provide more detailed comments in your code reviews. Focus on explaining the "why" behind suggestions.',
    },
  ];

  const goals = [
    { id: 1, title: 'API Optimization' },
    { id: 2, title: 'Team Documentation' },
    { id: 3, title: 'Code Review Process' },
  ];

  const filteredFeedback = selectedGoal === 'all' 
    ? feedbackList 
    : feedbackList.filter(f => f.goalId === parseInt(selectedGoal));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-600 mt-1">Manager feedback on your goals and performance</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Goal</label>
        <select
          value={selectedGoal}
          onChange={(e) => setSelectedGoal(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="all">All Goals</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Feedback</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{feedbackList.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Positive Feedback</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {feedbackList.filter(f => f.type === 'POSITIVE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Constructive Feedback</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {feedbackList.filter(f => f.type === 'CONSTRUCTIVE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.map((feedback) => (
          <div
            key={feedback.id}
            className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
              feedback.type === 'POSITIVE'
                ? 'border-green-200 bg-green-50/30'
                : 'border-orange-200 bg-orange-50/30'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    feedback.type === 'POSITIVE' ? 'bg-green-100' : 'bg-orange-100'
                  }`}
                >
                  {feedback.type === 'POSITIVE' ? (
                    <ThumbsUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{feedback.from}</p>
                  <p className="text-xs text-gray-600">
                    Goal: {feedback.goalTitle} • {feedback.date}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  feedback.type === 'POSITIVE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {feedback.type}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{feedback.message}</p>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredFeedback.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No feedback yet for this goal</p>
          <p className="text-sm text-gray-500 mt-2">
            Your manager will provide feedback as you progress on your goals
          </p>
        </div>
      )}
    </div>
  );
}
