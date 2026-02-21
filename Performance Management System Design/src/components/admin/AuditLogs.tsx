import React, { useState } from 'react';
import { Download, Search, Calendar } from 'lucide-react';

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const logs = [
    { id: 1, date: '2026-01-22 14:35', user: 'Jane Manager', action: 'Approved Goal #12', category: 'GOAL_APPROVAL' },
    { id: 2, date: '2026-01-22 13:20', user: 'Sam Admin', action: 'Created user: Alex Thompson', category: 'USER_MANAGEMENT' },
    { id: 3, date: '2026-01-22 11:45', user: 'John Employee', action: 'Submitted goal completion #5', category: 'GOAL_SUBMISSION' },
    { id: 4, date: '2026-01-22 10:15', user: 'Jane Manager', action: 'Verified evidence for Goal #8', category: 'EVIDENCE_VERIFICATION' },
    { id: 5, date: '2026-01-22 09:30', user: 'Sam Admin', action: 'Created review cycle: Q1 2026', category: 'REVIEW_CYCLE' },
    { id: 6, date: '2026-01-21 16:50', user: 'John Employee', action: 'Created new goal: API Optimization', category: 'GOAL_CREATION' },
    { id: 7, date: '2026-01-21 15:22', user: 'Jane Manager', action: 'Requested changes for Goal #15', category: 'GOAL_APPROVAL' },
    { id: 8, date: '2026-01-21 14:10', user: 'Sam Admin', action: 'Updated user role: Priya Shah to MANAGER', category: 'USER_MANAGEMENT' },
    { id: 9, date: '2026-01-21 13:05', user: 'John Employee', action: 'Submitted self-assessment for Q4 2025', category: 'REVIEW_SUBMISSION' },
    { id: 10, date: '2026-01-21 11:40', user: 'Jane Manager', action: 'Completed performance review for Sarah Williams', category: 'REVIEW_SUBMISSION' },
    { id: 11, date: '2026-01-21 10:25', user: 'Sam Admin', action: 'Exported audit logs', category: 'SYSTEM' },
    { id: 12, date: '2026-01-21 09:15', user: 'John Employee', action: 'Added progress note to Goal #3', category: 'GOAL_UPDATE' },
    { id: 13, date: '2026-01-20 17:30', user: 'Jane Manager', action: 'Approved Goal #20', category: 'GOAL_APPROVAL' },
    { id: 14, date: '2026-01-20 16:10', user: 'Sam Admin', action: 'Updated review cycle settings', category: 'REVIEW_CYCLE' },
    { id: 15, date: '2026-01-20 15:00', user: 'John Employee', action: 'Acknowledged performance review Q4 2025', category: 'REVIEW_ACKNOWLEDGMENT' },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter === '' || log.date.split(' ')[0] === dateFilter;
    return matchesSearch && matchesDate;
  });

  const handleExport = () => {
    console.log('Exporting audit logs...');
    // Simulate CSV export
    const csv = 'Date,User,Action,Category\n' + 
      filteredLogs.map(log => `${log.date},${log.user},"${log.action}",${log.category}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-logs.csv';
    a.click();
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      GOAL_CREATION: 'text-blue-600',
      GOAL_APPROVAL: 'text-green-600',
      GOAL_SUBMISSION: 'text-purple-600',
      GOAL_UPDATE: 'text-blue-600',
      EVIDENCE_VERIFICATION: 'text-green-600',
      USER_MANAGEMENT: 'text-red-600',
      REVIEW_CYCLE: 'text-orange-600',
      REVIEW_SUBMISSION: 'text-purple-600',
      REVIEW_ACKNOWLEDGMENT: 'text-green-600',
      SYSTEM: 'text-gray-600',
    };
    return colors[category] || 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit & Compliance Logs</h1>
          <p className="text-gray-600 mt-1">System activity tracking and compliance monitoring</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          <Download className="w-5 h-5 mr-2" />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log, index) => (
                <tr key={log.id} className={`hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {log.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-medium ${getCategoryColor(log.category)}`}>
                      {log.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No audit logs found matching your filters</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Logs</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{logs.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Filtered Results</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{filteredLogs.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Date Range</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">Last 30 days</p>
          </div>
        </div>
      </div>
    </div>
  );
}