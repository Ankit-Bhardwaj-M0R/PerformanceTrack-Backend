import React, { useState } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { User } from '../../App';

interface NotificationsProps {
  user: User;
}

export function Notifications({ user }: NotificationsProps) {
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Manager approved your goal "API Optimization"', time: '2 hours ago', unread: true, type: 'success' },
    { id: 2, message: 'New feedback on Goal #3', time: '1 day ago', unread: true, type: 'info' },
    { id: 3, message: 'Evidence verification required for Goal #3', time: '1 day ago', unread: false, type: 'warning' },
    { id: 4, message: 'Performance review cycle Q1 2026 is now active', time: '2 days ago', unread: false, type: 'info' },
    { id: 5, message: 'Goal "Team Documentation" is due in 5 days', time: '3 days ago', unread: false, type: 'warning' },
    { id: 6, message: 'Manager requested changes for Goal #7', time: '4 days ago', unread: false, type: 'warning' },
    { id: 7, message: 'Your self-assessment for Q4 2025 was submitted', time: '5 days ago', unread: false, type: 'success' },
    { id: 8, message: 'New goal created: "Security Training"', time: '6 days ago', unread: false, type: 'info' },
    { id: 9, message: 'Progress note added to Goal #1', time: '1 week ago', unread: false, type: 'info' },
    { id: 10, message: 'Goal "Performance Metrics" marked as completed', time: '1 week ago', unread: false, type: 'success' },
  ]);

  const handleMarkRead = (id: number) => {
    console.log('Marking notification as read:', id);
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const handleMarkAllRead = () => {
    console.log('Marking all notifications as read');
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, unread: false }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <Bell className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-6 hover:bg-gray-50 transition-colors ${
              notification.unread ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${notification.unread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </div>
              {notification.unread && (
                <button
                  onClick={() => handleMarkRead(notification.id)}
                  className="ml-4 px-3 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark Read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State (if no notifications) */}
      {notifications.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No notifications yet</p>
          <p className="text-sm text-gray-500 mt-2">You'll see notifications here when you have updates</p>
        </div>
      )}
    </div>
  );
}