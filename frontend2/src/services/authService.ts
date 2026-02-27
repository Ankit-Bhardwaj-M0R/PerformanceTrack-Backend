import api from './api'
import type { LoginRequest, LoginResponse } from '../types'

// ─── AUTH SERVICE ─────────────────────────────────────────────────────────────

/**
 * Authenticate a user with email and password.
 * On success the response body contains LoginResponse (token + user details).
 * We persist the JWT and the user profile in localStorage.
 */
const login = async (email: string, password: string): Promise<LoginResponse> => {
  const payload: LoginRequest = { email, password }
  const response = await api.post<LoginResponse>('/auth/login', payload)
  const data = response.data

  // Persist credentials so the Axios interceptor can attach them on every request
  localStorage.setItem('token', data.token)
  localStorage.setItem(
    'user',
    JSON.stringify({
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department,
    })
  )

  return data
}

/**
 * Log out the current user by clearing localStorage.
 */
const logout = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

/**
 * Change the authenticated user's password.
 */
const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  await api.post('/auth/change-password', { currentPassword, newPassword })
}

const authService = {
  login,
  logout,
  changePassword,
}

export default authService
