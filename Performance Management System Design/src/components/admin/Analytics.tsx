import React, { useState } from 'react';
import { Download, BarChart3 } from 'lucide-react';

export function Analytics() {
  const [activeTab, setActiveTab] = useState('goal-analytics');

  const goalStats = {
    total: 428,
    completed: 192,
    inProgress: 128,
    pending: 64,
    changesRequested: 44,
  };

  const categoryData = [
    { category: 'Technical', count: 170, percentage: 40 },
    { category: 'Behavioral', count: 107, percentage: 25 },
    { category: 'Process', count: 86, percentage: 20 },
    { category: 'Development', count: 65, percentage: 15 },
  ];

  const departmentPerformance = [
    { dept: 'Engineering', goals: 120, completion: 82, avgRating: 4.2, trend: '+5%' },
    { dept: 'Sales', goals: 85, completion: 75, avgRating: 3.9, trend: '+2%' },
    { dept: 'Marketing', goals: 72, completion: 80, avgRating: 4.1, trend: '+3%' },
    { dept: 'Product', goals: 68, completion: 85, avgRating: 4.3, trend: '+8%' },
    { dept: 'Operations', goals: 48, completion: 70, avgRating: 3.8, trend: '-1%' },
  ];

  const tabs = [
    { id: 'goal-analytics', label: 'Goal Analytics' },
    { id: 'performance-summary', label: 'Performance Summary' },
    { id: 'department-performance', label: 'Department Performance' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive performance insights and metrics</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium">
            <Download className="w-5 h-5 mr-2" />
            PDF
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium">
            <Download className="w-5 h-5 mr-2" />
            CSV
          </button>
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

        {/* Goal Analytics Tab */}
        {activeTab === 'goal-analytics' && (
          <div className="p-6 space-y-6">
            {/* Goal Status Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Status Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pie Chart Simulation */}
                <div className="col-span-1">
                  <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center h-64">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">Status Distribution</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="col-span-2 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-700 mt-1">{goalStats.completed}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700">
                        {Math.round((goalStats.completed / goalStats.total) * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-blue-700 mt-1">{goalStats.inProgress}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-700">
                        {Math.round((goalStats.inProgress / goalStats.total) * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-700 mt-1">{goalStats.pending}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-700">
                        {Math.round((goalStats.pending / goalStats.total) * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Changes Requested</p>
                      <p className="text-2xl font-bold text-orange-700 mt-1">{goalStats.changesRequested}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-700">
                        {Math.round((goalStats.changesRequested / goalStats.total) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
              <div className="space-y-4">
                {categoryData.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <span className="text-sm text-gray-600">{item.count} goals ({item.percentage}%)</span>
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

            {/* Completion Rate Trend */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Rate Trend</h3>
              <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-green-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Line chart showing completion trend over time</p>
                  <p className="text-xs text-gray-500 mt-2">Last 6 months data visualization</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Summary Tab */}
        {activeTab === 'performance-summary' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-4xl font-bold text-blue-700 mt-2">4.1</p>
                <p className="text-xs text-green-600 mt-2">↑ 0.3 from last quarter</p>
              </div>
              <div className="bg-green-50 rounded-lg p-6">
                <p className="text-sm text-gray-600">Reviews Completed</p>
                <p className="text-4xl font-bold text-green-700 mt-2">152</p>
                <p className="text-xs text-gray-600 mt-2">Out of 156 total</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-6">
                <p className="text-sm text-gray-600">On-Time Completion</p>
                <p className="text-4xl font-bold text-purple-700 mt-2">94%</p>
                <p className="text-xs text-green-600 mt-2">↑ 2% improvement</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 w-16">{rating} stars</span>
                    <div className="flex-1 mx-4 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-yellow-500 h-3 rounded-full"
                        style={{ width: `${rating === 5 ? 40 : rating === 4 ? 35 : rating === 3 ? 15 : rating === 2 ? 8 : 2}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {rating === 5 ? 40 : rating === 4 ? 35 : rating === 3 ? 15 : rating === 2 ? 8 : 2}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Department Performance Tab */}
        {activeTab === 'department-performance' && (
          <div className="p-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Goals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completion Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departmentPerformance.map((dept, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.dept}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dept.goals}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${dept.completion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{dept.completion}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{dept.avgRating}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${dept.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {dept.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
