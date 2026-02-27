import api from './api'
import type {
  DashboardMetrics,
  GoalAnalytics,
  PerformanceSummary,
  DeptPerformanceEntry,
  ReportResponseDTO,
  PageResponse,
} from '../types'

// ─── REPORT SERVICE ───────────────────────────────────────────────────────────
// Connects to: core-service via API Gateway at /api/v1/reports
// ─────────────────────────────────────────────────────────────────────────────

const reportService = {
  /**
   * GET /api/v1/reports/dashboard
   * Get high-level dashboard metrics.
   * Returns: total goals, completed goals, pending reviews, etc.
   */
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await api.get<DashboardMetrics>('/reports/dashboard')
    return response.data
  },

  /**
   * GET /api/v1/reports/performance-summary
   * Get a summary of performance data (for charts/graphs).
   */
  getPerformanceSummary: async (): Promise<PerformanceSummary> => {
    const response = await api.get<PerformanceSummary>('/reports/performance-summary')
    return response.data
  },

  /**
   * GET /api/v1/reports/goal-analytics
   * Get analytics about goals (completion rates, categories, etc.).
   */
  getGoalAnalytics: async (): Promise<GoalAnalytics> => {
    const response = await api.get<GoalAnalytics>('/reports/goal-analytics')
    return response.data
  },

  /**
   * GET /api/v1/reports/department-performance
   * Get performance data grouped by department (ADMIN/MANAGER).
   */
  getDepartmentPerformance: async (): Promise<DeptPerformanceEntry[]> => {
    const response = await api.get<DeptPerformanceEntry[]>('/reports/department-performance')
    return response.data
  },

  /**
   * GET /api/v1/reports
   * Get all generated reports (ADMIN/MANAGER).
   */
  getAllReports: async (page = 0, size = 10): Promise<PageResponse<ReportResponseDTO>> => {
    const response = await api.get<PageResponse<ReportResponseDTO>>('/reports', {
      params: { page, size },
    })
    return response.data
  },

  /**
   * GET /api/v1/reports/{reportId}
   * Get a specific report by ID.
   */
  getReportById: async (reportId: number): Promise<ReportResponseDTO> => {
    const response = await api.get<ReportResponseDTO>(`/reports/${reportId}`)
    return response.data
  },

  /**
   * POST /api/v1/reports/generate
   * Generate a new report.
   * Body: { scope, format } where scope = "TEAM" | "DEPARTMENT" | "COMPANY"
   */
  generateReport: async (
    scope: 'TEAM' | 'DEPARTMENT' | 'COMPANY',
    format = 'JSON'
  ): Promise<ReportResponseDTO> => {
    const response = await api.post<ReportResponseDTO>('/reports/generate', { scope, format })
    return response.data
  },
}

export default reportService
