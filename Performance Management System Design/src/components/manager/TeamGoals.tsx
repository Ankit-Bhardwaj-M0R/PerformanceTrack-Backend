import React from 'react';
import { Users } from 'lucide-react';
import { User } from '../../App';

interface TeamGoalsProps {
  user: User;
  onNavigate: (view: string, id?: number) => void;
}

export function TeamGoals({ user, onNavigate }: TeamGoalsProps) {
  const goals = [
    { id: 1, employee: 'John Employee', title: 'API Optimization', priority: 'High', status: 'IN_PROGRESS', dueDate: '2026-03-15', progress: 65 },
    { id: 2, employee: 'Sarah Williams', title: 'Database Migration', priority: 'High', status: 'COMPLETED', dueDate: '2026-01-20', progress: 100 },
    { id: 5, employee: 'Rahul Kumar', title: 'Code Review Process', priority: 'High', status: 'PENDING', dueDate: '2026-03-20', progress: 0 },
    { id: 7, employee: 'Priya Shah', title: 'Testing Framework', priority: 'Medium', status: 'PENDING', dueDate: '2026-04-15', progress: 0 },
    { id: 8, employee: 'Alex Johnson', title: 'Documentation Update', priority: 'Low', status: 'APPROVED', dueDate: '2026-05-01', progress: 20 },
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Goals</h1>
        <p className="text-gray-600 mt-1">Monitor and manage your team's performance goals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Team Goals</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{goals.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Pending Approval</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {goals.filter(g => g.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {goals.filter(g => g.status === 'IN_PROGRESS' || g.status === 'APPROVED').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {goals.filter(g => g.status === 'COMPLETED').length}
          </p>
        </div>
      </div>

      {/* Team Goals Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {goals.map((goal, index) => (
                <tr key={goal.id} className={`hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{goal.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {goal.employee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {goal.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(goal.priority)}`}>
                      {goal.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(goal.status)}`}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {goal.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    {goal.status === 'PENDING' ? (
                      <button
                        onClick={() => onNavigate('goal-approval', goal.id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Review →
                      </button>
                    ) : goal.status === 'COMPLETED' ? (
                      <button
                        onClick={() => onNavigate('verify-evidence', goal.id)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Verify →
                      </button>
                    ) : (
                      <button 
                        onClick={() => onNavigate('goal-detail', goal.id)}
                        className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                      >
                        View →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}