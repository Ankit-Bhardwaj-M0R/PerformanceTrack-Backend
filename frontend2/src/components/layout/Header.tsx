import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

// ─── HEADER ────────────────────────────────────────────────────────────────────
// Top bar that shows:
//   - Page title (dynamic, based on URL)
//   - Notification bell with unread count badge
//   - User avatar and name
// ─────────────────────────────────────────────────────────────────────────────

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      {/* Left: Page title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Right: Notification bell + User info */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          title="Notifications"
        >
          <Bell size={22} />
          {/* Unread count badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Avatar + Name */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-gray-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.department || user?.role}</p>
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </button>
      </div>
    </header>
  )
}
