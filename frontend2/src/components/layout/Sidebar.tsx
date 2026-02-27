import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Target, ClipboardList, RefreshCw, Users,
  BarChart2, Bell, Shield, LogOut, User, MessageSquare,
} from 'lucide-react'
import { ElementType } from 'react'

// ─── NAV ITEM TYPE ───────────────────────────────────────────────────────────

interface NavItem {
  label: string
  icon: ElementType
  path: string
}

// Role-specific navigation menus
const MANAGER_NAV: NavItem[] = [
  { label: 'Dashboard',     icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Team Goals',    icon: Target,          path: '/team-goals' },
  { label: 'Reviews',       icon: ClipboardList,   path: '/reviews' },
  { label: 'Team Members',  icon: Users,           path: '/team-members' },
  { label: 'Team Reports',  icon: BarChart2,       path: '/team-reports' },
  { label: 'Notifications', icon: Bell,            path: '/notifications' },
]

const EMPLOYEE_NAV: NavItem[] = [
  { label: 'Dashboard',     icon: LayoutDashboard, path: '/dashboard' },
  { label: 'My Goals',      icon: Target,          path: '/goals' },
  { label: 'Reviews',       icon: ClipboardList,   path: '/reviews' },
  { label: 'Feedback',      icon: MessageSquare,   path: '/feedback' },
  { label: 'Notifications', icon: Bell,            path: '/notifications' },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard',       icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Users',           icon: Users,           path: '/users' },
  { label: 'Review Cycles',   icon: RefreshCw,       path: '/review-cycles' },
  { label: 'Reports',         icon: BarChart2,       path: '/reports' },
  { label: 'Audit Logs',      icon: Shield,          path: '/audit-logs' },
  { label: 'Notifications',   icon: Bell,            path: '/notifications' },
]

const ROLE_COLORS: Record<string, string> = {
  ADMIN:    'bg-red-100 text-red-700',
  MANAGER:  'bg-purple-100 text-purple-700',
  EMPLOYEE: 'bg-green-100 text-green-700',
}

const ROLE_ACCENT: Record<string, string> = {
  ADMIN:    'from-red-700 to-red-900',
  MANAGER:  'from-purple-700 to-indigo-900',
  EMPLOYEE: 'from-blue-700 to-blue-900',
}

export default function Sidebar() {
  const { user, logout, isAdmin, isManager } = useAuth()
  const navigate = useNavigate()

  const navItems: NavItem[] =
    isAdmin() ? ADMIN_NAV : isManager() ? MANAGER_NAV : EMPLOYEE_NAV
  const accent = ROLE_ACCENT[user?.role ?? ''] || 'from-gray-800 to-gray-900'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className={`w-64 bg-gradient-to-b ${accent} text-white flex flex-col min-h-screen`}>
      {/* Logo */}
      <div className="p-6 border-b border-white border-opacity-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center font-bold text-lg">
            PT
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">PerformanceTrack</h1>
            <p className="text-xs text-white text-opacity-60">v2 — Enhanced</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white border-opacity-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                ROLE_COLORS[user?.role ?? ''] || 'bg-gray-600 text-gray-200'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>
        {user?.department && (
          <p className="text-xs text-white text-opacity-50 mt-2 pl-1">{user.department}</p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-white bg-opacity-20 text-white shadow-sm'
                    : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom: Profile & Logout */}
      <div className="p-4 border-t border-white border-opacity-10 space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-white bg-opacity-20 text-white'
                : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-10 hover:text-white'
            }`
          }
        >
          <User size={18} />
          <span>Profile</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white text-opacity-70 hover:bg-red-500 hover:bg-opacity-30 hover:text-white transition-all duration-150"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
