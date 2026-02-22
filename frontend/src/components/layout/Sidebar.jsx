import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Target,
  ClipboardList,
  RefreshCw,
  Users,
  BarChart2,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  User,
} from 'lucide-react'

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
// Left navigation panel. Shows different menu items based on user role:
//   ADMIN:    Dashboard, Goals, Reviews, Cycles, Users, Reports, Notifications, Audit Logs
//   MANAGER:  Dashboard, Goals (team), Reviews, Reports, Notifications
//   EMPLOYEE: Dashboard, Goals (mine), Reviews, Notifications
// ─────────────────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { user, logout, isAdmin, isManager, isAdminOrManager } = useAuth()
  const navigate = useNavigate()

  // Define all navigation items
  // "show" determines if this item is visible for the current user's role
  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      show: true, // Everyone sees the dashboard
    },
    {
      label: 'Goals',
      icon: Target,
      path: '/goals',
      show: true, // Everyone sees goals (but content differs by role)
    },
    {
      label: 'Performance Reviews',
      icon: ClipboardList,
      path: '/reviews',
      show: true,
    },
    {
      label: 'Review Cycles',
      icon: RefreshCw,
      path: '/review-cycles',
      show: isAdmin(), // Only Admin can manage review cycles
    },
    {
      label: 'Users',
      icon: Users,
      path: '/users',
      show: isAdmin(), // Only Admin can manage users
    },
    {
      label: 'Reports & Analytics',
      icon: BarChart2,
      path: '/reports',
      show: isAdminOrManager(), // Admin and Manager can see reports
    },
    {
      label: 'Notifications',
      icon: Bell,
      path: '/notifications',
      show: true,
    },
    {
      label: 'Audit Logs',
      icon: Shield,
      path: '/audit-logs',
      show: isAdmin(), // Only Admin can see audit logs
    },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Role badge color
  const roleBadgeColor = {
    ADMIN: 'bg-red-100 text-red-700',
    MANAGER: 'bg-purple-100 text-purple-700',
    EMPLOYEE: 'bg-green-100 text-green-700',
  }

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      {/* ─── Logo & App Name ─── */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
            PT
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">PerformanceTrack</h1>
            <p className="text-xs text-gray-400">Employee Management</p>
          </div>
        </div>
      </div>

      {/* ─── Current User Info ─── */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColor[user?.role] || 'bg-gray-600 text-gray-200'}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Navigation Links ─── */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            )
          })}
      </nav>

      {/* ─── Bottom: Profile & Logout ─── */}
      <div className="p-4 border-t border-gray-700 space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          <User size={18} />
          <span>Profile</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-900 hover:text-red-200 transition-colors duration-150"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
