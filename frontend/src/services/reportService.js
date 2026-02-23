import api from './api'

// ─── REPORT SERVICE ───────────────────────────────────────────────────────────
// Connects to: core-service via API Gateway at /api/v1/reports
// ─────────────────────────────────────────────────────────────────────────────

const reportService = {
  /**
   * GET /api/v1/reports/dashboard
   * Get high-level dashboard metrics.
   * Returns: total goals, completed goals, pending reviews, etc.
   */
  getDashboardMetrics: async () => {
    const response = await api.get('/reports/dashboard')
    return response.data
  },

  /**
   * GET /api/v1/reports/performance-summary
   * Get a summary of performance data (for charts/graphs).
   */
  getPerformanceSummary: async () => {
    const response = await api.get('/reports/performance-summary')
    return response.data
  },

  /**
   * GET /api/v1/reports/goal-analytics
   * Get analytics about goals (completion rates, categories, etc.).
   */
  getGoalAnalytics: async () => {
    const response = await api.get('/reports/goal-analytics')
    return response.data
  },

  /**
   * GET /api/v1/reports/department-performance
   * Get performance data grouped by department (ADMIN/MANAGER).
   */
  getDepartmentPerformance: async () => {
    const response = await api.get('/reports/department-performance')
    return response.data
  },

  /**
   * GET /api/v1/reports
   * Get all generated reports (ADMIN/MANAGER).
   */
  getAllReports: async (page = 0, size = 10) => {
    const response = await api.get('/reports', { params: { page, size } })
    return response.data
  },

  /**
   * GET /api/v1/reports/{reportId}
   * Get a specific report by ID.
   */
  getReportById: async (reportId) => {
    const response = await api.get(`/reports/${reportId}`)
    return response.data
  },

  /**
   * POST /api/v1/reports/generate
   * Generate a new report.
   * Body: { scope, format } where scope = "TEAM" | "DEPARTMENT" | "COMPANY"
   */
  generateReport: async (scope, format = 'JSON') => {
    const response = await api.post('/reports/generate', { scope, format })
    return response.data
  },
}

export default reportService
