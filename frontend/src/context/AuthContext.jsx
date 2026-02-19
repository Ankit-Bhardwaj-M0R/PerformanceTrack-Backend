import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'
import toast from 'react-hot-toast'

// ─── AUTH CONTEXT ──────────────────────────────────────────────────────────────
// This is like a "global variable" that stores the logged-in user's info.
// Any component in the app can access who's logged in using useAuth() hook.
// ─────────────────────────────────────────────────────────────────────────────

// Step 1: Create the context (empty container)
const AuthContext = createContext(null)

// Step 2: Create the Provider (wraps the whole app and provides the data)
export function AuthProvider({ children }) {
  // State: current logged-in user (or null if not logged in)
  const [user, setUser] = useState(null)
  // State: whether we're still checking if user is logged in
  const [loading, setLoading] = useState(true)

  // When the app starts, check if there's already a saved login session
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        // If the saved data is corrupted, clear it
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  /**
   * Login function
   * - Calls the auth API
   * - Saves token + user to localStorage (persists across browser refresh)
   * - Updates the user state
   */
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password)

      // The API returns: { token, userId, name, email, role, department, managerId }
      const userData = {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,       // "ADMIN" | "MANAGER" | "EMPLOYEE"
        department: data.department,
        managerId: data.managerId,
      }

      // Save to localStorage so user stays logged in after page refresh
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(userData))

      setUser(userData)
      toast.success(`Welcome back, ${userData.name}!`)
      return userData
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(message)
      throw error
    }
  }

  /**
   * Logout function
   * - Calls the logout API
   * - Clears localStorage
   * - Resets user state
   */
  const logout = async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
      toast.success('Logged out successfully')
    }
  }

  // Helper functions to check the user's role (makes code more readable)
  const isAdmin = () => user?.role === 'ADMIN'
  const isManager = () => user?.role === 'MANAGER'
  const isEmployee = () => user?.role === 'EMPLOYEE'
  const isAdminOrManager = () => user?.role === 'ADMIN' || user?.role === 'MANAGER'

  // The value object: everything we want to share with the whole app
  const value = {
    user,
    login,
    logout,
    loading,
    isAdmin,
    isManager,
    isEmployee,
    isAdminOrManager,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Step 3: Custom hook so components can easily access auth data
// Usage: const { user, login, logout, isAdmin } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>. Check your App.jsx.')
  }
  return context
}
