import React, { useState } from 'react';
import { Download, BarChart3, TrendingUp, Users } from 'lucide-react';
import { User } from '../../App';

interface ManagerReportsProps {
  user: User;
}

export function ManagerReports({ user }: ManagerReportsProps) {
  const [activeTab, setActiveTab] = useState('team-overview');

  const teamMetrics = {
    totalMembers: 8,
    activeGoals: 24,
    completionRate: 78,
    avgRating: 4.1,
  };

  const teamPerformance = [
    { name: 'John Employee', goals: 5, completed: 3, rating: 4.0, trend: '+10%' },
    { name: 'Sarah Williams', goals: 4, completed: 4, rating: 4.5, trend: '+15%' },
    { name: 'Rahul Kumar', goals: 4, completed: 3, rating: 3.8, trend: '+5%' },
    { name: 'Priya Shah', goals: 3, completed: 2, rating: 4.2, trend: '+8%' },
    { name: 'Alex Johnson', goals: 3, completed: 2, rating: 3.9, trend: '+3%' },
  ];

  const goalsByCategory = [
    { category: 'Technical', count: 12, completed: 9, percentage: 75 },
    { category: 'Behavioral', count: 6, completed: 5, percentage: 83 },
    { category: 'Process', count: 4, completed: 3, percentage: 75 },
    { category: 'Development', count: 2, completed: 2, percentage: 100 },
  ];

  const tabs = [
    { id: 'team-overview', label: 'Team Overview' },
    { id: 'goal-analytics', label: 'Goal Analytics' },
    { id: 'performance-trends', label: 'Performance Trends' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Reports</h1>
          <p className="text-gray-600 mt-1">Analytics and insights for your team</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium">
            <Download className="w-5 h-5 mr-2" />
            Export PDF
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium">
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{teamMetrics.totalMembers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Goals</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{teamMetrics.activeGoals}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{teamMetrics.completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Team Rating</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{teamMetrics.avgRating}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Team Overview Tab */}
        {activeTab === 'team-overview' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Performance</h3>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Goals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teamPerformance.map((member, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.goals}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{member.completed}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{member.rating}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-green-600">{member.trend}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Goal Analytics Tab */}
        {activeTab === 'goal-analytics' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals by Category</h3>
              <div className="space-y-4">
                {goalsByCategory.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm text-gray-600">
                        {item.completed}/{item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">On Track Goals</p>
                <p className="text-3xl font-bold text-blue-600">18</p>
                <p className="text-xs text-gray-600 mt-1">75% of active goals</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">At Risk Goals</p>
                <p className="text-3xl font-bold text-yellow-600">6</p>
                <p className="text-xs text-gray-600 mt-1">25% of active goals</p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Trends Tab */}
        {activeTab === 'performance-trends' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Performance Trend</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="w-full h-64">
                <svg className="w-full h-full" viewBox="0 0 800 300">
                  {/* Chart Grid */}
                  <line x1="50" y1="50" x2="50" y2="250" stroke="#d1d5db" strokeWidth="2"/>
                  <line x1="50" y1="250" x2="750" y2="250" stroke="#d1d5db" strokeWidth="2"/>
                  
                  {/* Y-axis labels */}
                  <text x="30" y="60" fontSize="12" fill="#6b7280">5.0</text>
                  <text x="30" y="110" fontSize="12" fill="#6b7280">4.0</text>
                  <text x="30" y="160" fontSize="12" fill="#6b7280">3.0</text>
                  <text x="30" y="210" fontSize="12" fill="#6b7280">2.0</text>
                  <text x="30" y="255" fontSize="12" fill="#6b7280">1.0</text>
                  
                  {/* Grid lines */}
                  <line x1="50" y1="100" x2="750" y2="100" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5"/>
                  <line x1="50" y1="150" x2="750" y2="150" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5"/>
                  <line x1="50" y1="200" x2="750" y2="200" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="5,5"/>
                  
                  {/* Data points */}
                  {/* Q2: 3.7 (rating), Q3: 3.8, Q4: 4.0, Q1: 4.1 */}
                  <polyline
                    points="200,170 350,165 500,150 650,145"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                  />
                  
                  {/* Data point circles */}
                  <circle cx="200" cy="170" r="6" fill="#3b82f6"/>
                  <circle cx="350" cy="165" r="6" fill="#3b82f6"/>
                  <circle cx="500" cy="150" r="6" fill="#3b82f6"/>
                  <circle cx="650" cy="145" r="6" fill="#3b82f6"/>
                  
                  {/* X-axis labels */}
                  <text x="175" y="275" fontSize="12" fill="#6b7280" textAnchor="middle">Q2 2025</text>
                  <text x="330" y="275" fontSize="12" fill="#6b7280" textAnchor="middle">Q3 2025</text>
                  <text x="485" y="275" fontSize="12" fill="#6b7280" textAnchor="middle">Q4 2025</text>
                  <text x="640" y="275" fontSize="12" fill="#6b7280" textAnchor="middle">Q1 2026</text>
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">Q2 2025</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">3.7</p>
                <p className="text-xs text-red-600 mt-1">↓ 2% from Q1</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">Q3 2025</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">3.8</p>
                <p className="text-xs text-green-600 mt-1">↑ 3% from Q2</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">Q4 2025</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">4.0</p>
                <p className="text-xs text-green-600 mt-1">↑ 5% from Q3</p>
              </div>
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <p className="text-sm text-gray-600">Q1 2026</p>
                <p className="text-2xl font-bold text-green-600 mt-2">4.1</p>
                <p className="text-xs text-green-600 mt-1">↑ 2.5% from Q4</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}