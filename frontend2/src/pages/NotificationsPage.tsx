import React from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import Layout from '../components/layout/Layout'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { useNotifications } from '../context/NotificationContext'
import { formatDistanceToNow } from 'date-fns'

// ─── NOTIFICATIONS PAGE ───────────────────────────────────────────────────────

interface NotifStyle {
  bg: string
  border: string
  dot: string
  emoji: string
}

const NOTIF_STYLES: Record<string, NotifStyle> = {
  GOAL_APPROVAL:           { bg: 'bg-green-50',  border: 'border-green-100',  dot: 'bg-green-500',  emoji: '✅' },
  GOAL_REJECTION:          { bg: 'bg-red-50',    border: 'border-red-100',    dot: 'bg-red-500',    emoji: '❌' },
  GOAL_COMPLETION_REQUEST: { bg: 'bg-blue-50',   border: 'border-blue-100',   dot: 'bg-blue-500',   emoji: '📋' },
  REVIEW_REQUEST:          { bg: 'bg-purple-50', border: 'border-purple-100', dot: 'bg-purple-500', emoji: '📝' },
  FEEDBACK_REQUEST:        { bg: 'bg-yellow-50', border: 'border-yellow-100', dot: 'bg-yellow-500', emoji: '💬' },
  DEFAULT:                 { bg: 'bg-gray-50',   border: 'border-gray-100',   dot: 'bg-gray-400',   emoji: '🔔' },
}

function getStyle(type: string): NotifStyle {
  return NOTIF_STYLES[type] || NOTIF_STYLES['DEFAULT']
}

function timeAgo(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  } catch {
    return dateString
  }
}

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications()

  return (
    <Layout title="Notifications">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-sm text-gray-500">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </h2>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <div className="card text-center py-20">
          <Bell size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="text-gray-500 font-medium">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">
            You'll receive real-time notifications here when there's activity on your goals or
            reviews.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const style = getStyle(notif.type)
            const isUnread = notif.status === 'UNREAD'
            const extended = notif as typeof notif & {
              priority?: string
              actionRequired?: boolean
            }

            return (
              <div
                key={notif.notificationId}
                onClick={() => isUnread && markAsRead(notif.notificationId)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm
                  ${isUnread ? `${style.bg} ${style.border}` : 'bg-white border-gray-100'}`}
              >
                {/* Type emoji / unread dot */}
                <div className="flex-shrink-0 mt-0.5 relative">
                  <span className="text-2xl">{style.emoji}</span>
                  {isUnread && (
                    <span
                      className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${style.dot} ring-2 ring-white`}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm ${
                      isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'
                    }`}
                  >
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400">
                      {timeAgo(notif.createdDate)}
                    </span>
                    {extended.priority === 'HIGH' && (
                      <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                        High Priority
                      </span>
                    )}
                    {extended.actionRequired && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">
                        Action Required
                      </span>
                    )}
                  </div>
                </div>

                {/* Unread indicator */}
                {isUnread && (
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${style.dot} self-center flex-shrink-0`}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* SSE Info Note */}
      <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-400 flex items-start gap-2">
        <Bell size={14} className="mt-0.5 flex-shrink-0" />
        <p>
          Notifications are delivered in real-time using Server-Sent Events (SSE). You don't
          need to refresh the page — new notifications appear automatically.
        </p>
      </div>
    </Layout>
  )
}
