import api from './api'
import type { UserDTO, PageResponse, UserFormState } from '../types'

// ─── USER SERVICE ─────────────────────────────────────────────────────────────
// Connects to: auth-user-service via API Gateway at /api/v1/users
// ─────────────────────────────────────────────────────────────────────────────

const userService = {
  /**
   * GET /api/v1/users
   * Get all users (ADMIN/MANAGER only). Supports pagination.
   */
  getAllUsers: async (page = 0, size = 20): Promise<PageResponse<UserDTO>> => {
    const response = await api.get<PageResponse<UserDTO>>('/users', {
      params: { page, size },
    })
    return response.data
  },

  /**
   * GET /api/v1/users/{userId}
   * Get a specific user by their ID.
   */
  getUserById: async (userId: number): Promise<UserDTO> => {
    const response = await api.get<UserDTO>(`/users/${userId}`)
    return response.data
  },

  /**
   * POST /api/v1/users
   * Create a new user (ADMIN only).
   * Backend CreateUserRequest fields: name, email, password, role, dept, mgrId, status
   */
  createUser: async (userData: UserFormState): Promise<UserDTO> => {
    const response = await api.post<UserDTO>('/users', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      dept: userData.department,
      mgrId: userData.managerId ? parseInt(userData.managerId as string) : null,
      status: userData.status || 'ACTIVE',
    })
    return response.data
  },

  /**
   * PUT /api/v1/users/{userId}
   * Update an existing user (ADMIN only).
   * Backend CreateUserRequest fields: name, email, password, role, dept, mgrId, status
   */
  updateUser: async (userId: number, userData: UserFormState): Promise<UserDTO> => {
    const body: Record<string, unknown> = {
      name: userData.name,
      email: userData.email,
      role: userData.role,
      dept: userData.department,
      mgrId: userData.managerId ? parseInt(userData.managerId as string) : null,
      status: userData.status || 'ACTIVE',
    }
    // Only include password if provided (for updates)
    if (userData.password) body.password = userData.password
    const response = await api.put<UserDTO>(`/users/${userId}`, body)
    return response.data
  },

  /**
   * GET /api/v1/users/{userId}/team
   * Get all team members under a manager (MANAGER role).
   */
  getTeam: async (userId: number): Promise<UserDTO[]> => {
    const response = await api.get<UserDTO[]>(`/users/${userId}/team`)
    return response.data
  },
}

export default userService
