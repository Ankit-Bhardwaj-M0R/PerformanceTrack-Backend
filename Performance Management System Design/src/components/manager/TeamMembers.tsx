import React from 'react';
import { Mail, User as UserIcon } from 'lucide-react';
import { User } from '../../App';

interface TeamMembersProps {
  user: User;
  onNavigate: (view: string, id?: number) => void;
}

export function TeamMembers({ user, onNavigate }: TeamMembersProps) {
  const teamMembers = [
    { id: 1, name: 'John Employee', email: 'john@test.com', department: 'Engineering', activeGoals: 5, completionRate: 80 },
    { id: 4, name: 'Rahul Kumar', email: 'rahul@test.com', department: 'Engineering', activeGoals: 4, completionRate: 75 },
    { id: 5, name: 'Priya Shah', email: 'priya@test.com', department: 'Engineering', activeGoals: 3, completionRate: 85 },
    { id: 6, name: 'Sarah Williams', email: 'sarah@test.com', department: 'Engineering', activeGoals: 4, completionRate: 90 },
    { id: 8, name: 'Alex Johnson', email: 'alex@test.com', department: 'Engineering', activeGoals: 3, completionRate: 70 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-600 mt-1">Manage and monitor your team</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Team Members</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{teamMembers.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Active Goals</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {teamMembers.reduce((acc, m) => acc + m.activeGoals, 0)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Avg. Completion Rate</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {Math.round(teamMembers.reduce((acc, m) => acc + m.completionRate, 0) / teamMembers.length)}%
          </p>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.department}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center text-sm text-gray-600 mb-4">
              <Mail className="w-4 h-4 mr-2" />
              {member.email}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Goals</span>
                <span className="text-sm font-semibold text-gray-900">{member.activeGoals}</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-semibold text-green-600">{member.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${member.completionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <button
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              onClick={() => onNavigate('team-member-detail', member.id)}
            >
              View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}