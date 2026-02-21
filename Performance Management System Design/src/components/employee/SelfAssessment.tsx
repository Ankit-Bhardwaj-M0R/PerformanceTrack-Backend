import React, { useState } from 'react';
import { ArrowLeft, Star, Save } from 'lucide-react';
import { User } from '../../App';

interface SelfAssessmentProps {
  user: User;
  onNavigate: (view: string) => void;
}

export function SelfAssessment({ user, onNavigate }: SelfAssessmentProps) {
  const [formData, setFormData] = useState({
    achievements: '',
    challenges: '',
    learnings: '',
    selfRating: 0,
  });

  const [hoverRating, setHoverRating] = useState(0);

  // Mock goals for reference
  const cycleGoals = [
    { id: 1, title: 'API Optimization', status: 'COMPLETED', achievement: '35% improvement achieved' },
    { id: 2, title: 'Team Documentation', status: 'IN_PROGRESS', achievement: 'Ongoing - 60% complete' },
  ];

  const handleSubmit = (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    
    const assessment = {
      selfAssmt: JSON.stringify({
        achievements: formData.achievements,
        challenges: formData.challenges,
        learnings: formData.learnings,
      }),
      selfRating: formData.selfRating,
    };

    console.log(isDraft ? 'Saving draft:' : 'Submitting assessment:', assessment);
    
    // Show success message
    alert(isDraft ? 'Draft saved successfully!' : 'Self-assessment submitted successfully!');
    onNavigate('my-reviews');
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('my-reviews')}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Reviews
      </button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Q1 2026 Self-Assessment</h1>
        <p className="text-gray-600">Review Period: January 1 - March 31, 2026</p>
        <p className="text-sm text-gray-500 mt-2">
          Reflect on your accomplishments, challenges, and growth during this review period.
        </p>
      </div>

      {/* Your Goals This Cycle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Goals This Cycle</h2>
        <div className="space-y-3">
          {cycleGoals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  goal.status === 'COMPLETED' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{goal.title}</p>
                  <p className="text-xs text-gray-600">{goal.achievement}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                goal.status === 'COMPLETED' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {goal.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Self-Assessment Form */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Self-Assessment</h2>
          
          <div className="space-y-6">
            {/* Achievements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Achievements <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.achievements}
                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Describe your major accomplishments, goals achieved, and impact made..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: Completed API optimization project with 35% improvement, mentored 2 junior developers
              </p>
            </div>

            {/* Challenges */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenges Faced <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.challenges}
                onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="What challenges did you face and how did you overcome them?"
              />
            </div>

            {/* Learnings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Learnings & Growth <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.learnings}
                onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="What did you learn? How have you grown professionally?"
              />
            </div>

            {/* Self Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Self-Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, selfRating: rating })}
                    onMouseEnter={() => setHoverRating(rating)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        rating <= (hoverRating || formData.selfRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {formData.selfRating > 0 && (
                  <span className="ml-4 text-lg font-semibold text-gray-900">
                    {formData.selfRating}/5
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                1 = Needs Improvement, 3 = Meets Expectations, 5 = Exceeds Expectations
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Draft
          </button>
          <button
            type="submit"
            disabled={formData.selfRating === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Assessment
          </button>
        </div>
      </form>
    </div>
  );
}