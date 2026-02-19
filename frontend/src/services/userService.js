import api from './api'

// ─── USER SERVICE ─────────────────────────────────────────────────────────────
// Connects to: auth-user-service via API Gateway at /api/v1/users
// ─────────────────────────────────────────────────────────────────────────────

const userService = {
  /**
   * GET /api/v1/users
   * Get all users (ADMIN/MANAGER only). Supports pagination.
   */
  getAllUsers: async (page = 0, size = 20) => {
    const response = await api.get('/users', { params: { page, size } })
    return response.data
  },

  /**
   * GET /api/v1/users/{userId}
   * Get a specific user by their ID.
   */
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },

  /**
   * POST /api/v1/users
   * Create a new user (ADMIN only).
   * Body: { name, email, password, role, department, managerId }
   */
  createUser: async (userData) => {
    const response = await api.post('/users', userData)
    return response.data
  },

  /**
   * PUT /api/v1/users/{userId}
   * Update an existing user (ADMIN only).
   */
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData)
    return response.data
  },

  /**
   * GET /api/v1/users/{userId}/team
   * Get all team members under a manager (MANAGER role).
   */
  getTeam: async (userId) => {
    const response = await api.get(`/users/${userId}/team`)
    return response.data
  },
}

export default userService
