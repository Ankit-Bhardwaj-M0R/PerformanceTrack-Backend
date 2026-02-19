import api from './api'

// ─── AUTH SERVICE ─────────────────────────────────────────────────────────────
// Connects to: auth-user-service via API Gateway at /api/v1/auth
// ─────────────────────────────────────────────────────────────────────────────

const authService = {
  /**
   * POST /api/v1/auth/login
   * Login with email + password. Returns JWT token + user details.
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  /**
   * POST /api/v1/auth/logout
   * Logout the current user (invalidates token on server side).
   */
  logout: async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      // Always clear local storage, even if the server call fails
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  /**
   * PUT /api/v1/auth/change-password
   * Change the current user's password.
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return response.data
  },
}

export default authService
