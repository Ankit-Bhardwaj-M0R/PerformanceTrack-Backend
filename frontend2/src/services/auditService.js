import api from './api'

// ─── AUDIT LOG SERVICE ────────────────────────────────────────────────────────
// Connects to: auth-user-service via API Gateway at /api/v1/audit-logs
// ADMIN access only
// ─────────────────────────────────────────────────────────────────────────────

const auditService = {
  /**
   * GET /api/v1/audit-logs
   * Get all audit logs with pagination (ADMIN only).
   * Supports filtering by userId, action, dateFrom, dateTo.
   */
  getAuditLogs: async (page = 0, size = 20, filters = {}) => {
    const params = { page, size, ...filters }
    const response = await api.get('/audit-logs', { params })
    return response.data
  },

  /**
   * POST /api/v1/audit-logs/export
   * Export audit logs (ADMIN only).
   * Body: { dateFrom, dateTo, userId, action }
   */
  exportAuditLogs: async (filters = {}) => {
    const response = await api.post('/audit-logs/export', filters)
    return response.data
  },
}

export default auditService
