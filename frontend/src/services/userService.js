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
   * Backend CreateUserRequest fields: name, email, password, role, dept, mgrId, status
   */
  createUser: async (userData) => {
    const response = await api.post('/users', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      dept: userData.department,
      mgrId: userData.managerId ? parseInt(userData.managerId) : null,
      status: userData.status || 'ACTIVE',
    })
    return response.data
  },

  /**
   * PUT /api/v1/users/{userId}
   * Update an existing user (ADMIN only).
   * Backend CreateUserRequest fields: name, email, password, role, dept, mgrId, status
   */
  updateUser: async (userId, userData) => {
    const body = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      dept: userData.department,
      mgrId: userData.managerId ? parseInt(userData.managerId) : null,
      status: userData.status || 'ACTIVE',
    }
    if (userData.password) body.password = userData.password
    const response = await api.put(`/users/${userId}`, body)
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
