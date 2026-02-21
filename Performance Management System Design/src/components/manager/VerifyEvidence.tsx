import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { User } from '../../App';

interface VerifyEvidenceProps {
  goalId: number;
  user: User;
  onNavigate: (view: string, id?: number) => void;
}

export function VerifyEvidence({ goalId, user, onNavigate }: VerifyEvidenceProps) {
  const [verificationStatus, setVerificationStatus] = useState('VERIFIED');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestEvidenceModal, setShowRequestEvidenceModal] = useState(false);
  const [comments, setComments] = useState('');

  const goal = {
    id: goalId,
    title: 'API Optimization',
    employee: 'John Employee',
    evidenceLink: 'https://drive.google.com/folder/abc123',
    linkDescription: 'Performance dashboards showing 35% improvement in API response times across all endpoints',
    accessInstructions: 'Accessible to all @company.com emails. Dashboard is in the "Q1 2026 Performance" folder.',
    completionNotes: 'Achieved 35% improvement in API response time, exceeding the initial target of 30%. Implemented Redis caching, optimized database queries, and added connection pooling. All high-traffic endpoints now respond in under 200ms.',
    submittedDate: '2026-02-10',
  };

  const handleApproveCompletion = () => {
    console.log('Approving completion with status:', verificationStatus);
    onNavigate('team-goals');
  };

  const handleRejectCompletion = () => {
    if (comments.trim()) {
      console.log('Rejecting completion:', comments);
      setShowRejectModal(false);
      onNavigate('team-goals');
    }
  };

  const handleRequestAdditionalEvidence = () => {
    if (comments.trim()) {
      console.log('Requesting additional evidence:', comments);
      setShowRequestEvidenceModal(false);
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

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Completion: Goal #{goal.id}</h1>
        <p className="text-gray-600">{goal.title}</p>
        <p className="text-sm text-gray-500 mt-1">Submitted by {goal.employee} on {goal.submittedDate}</p>
      </div>

      {/* Evidence Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Evidence Submitted</h2>
        
        <div className="space-y-6">
          {/* Evidence Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Evidence Link</label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={goal.evidenceLink}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900"
              />
              <a
                href={goal.evidenceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Link
              </a>
            </div>
          </div>

          {/* Link Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link Description</label>
            <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {goal.linkDescription}
            </p>
          </div>

          {/* Access Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Access Instructions</label>
            <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
              {goal.accessInstructions}
            </p>
          </div>

          {/* Employee Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee Completion Notes</label>
            <p className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-gray-900 leading-relaxed">
              {goal.completionNotes}
            </p>
          </div>
        </div>
      </div>

      {/* Manager Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Manager Actions</h2>
        
        {/* Verification Status */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
          <select
            value={verificationStatus}
            onChange={(e) => setVerificationStatus(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="VERIFIED">Verified</option>
            <option value="PENDING">Pending Verification</option>
            <option value="NOT_VERIFIED">Not Verified</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowRequestEvidenceModal(true)}
            className="flex items-center px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-medium"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Request Additional Evidence
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Reject Completion
          </button>
          <button
            onClick={handleApproveCompletion}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Approve Completion
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Reject Goal Completion</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Explain why this goal completion is being rejected..."
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setComments('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectCompletion}
                disabled={!comments.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Completion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Additional Evidence Modal */}
      {showRequestEvidenceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Request Additional Evidence</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What additional evidence is needed? <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Describe what additional evidence or clarification you need..."
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRequestEvidenceModal(false);
                  setComments('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestAdditionalEvidence}
                disabled={!comments.trim()}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}