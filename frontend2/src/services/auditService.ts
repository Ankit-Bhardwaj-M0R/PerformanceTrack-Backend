import api from './api'
import type { AuditLog, PageResponse, AuditFilters } from '../types'

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
  getAuditLogs: async (
    page = 0,
    size = 20,
    filters: Partial<AuditFilters> = {}
  ): Promise<PageResponse<AuditLog>> => {
    const params: Record<string, unknown> = { page, size, ...filters }
    const response = await api.get<PageResponse<AuditLog>>('/audit-logs', { params })
    return response.data
  },

  /**
   * POST /api/v1/audit-logs/export
   * Export audit logs (ADMIN only).
   * Body: { dateFrom, dateTo, userId, action }
   */
  exportAuditLogs: async (filters: Partial<AuditFilters> = {}): Promise<AuditLog[]> => {
    const response = await api.post<AuditLog[]>('/audit-logs/export', filters)
    return response.data
  },
}

export default auditService
