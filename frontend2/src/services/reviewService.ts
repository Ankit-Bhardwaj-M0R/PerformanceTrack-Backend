import api from './api'
import type {
  ReviewCycle,
  PerformanceReviewResponseDTO,
  PageResponse,
  SelfAssessmentRequest,
  ManagerReviewRequest,
  ReviewCycleFormState,
  SelfAssessmentFormState,
  ManagerReviewFormState,
} from '../types'

// ─── REVIEW CYCLE SERVICE ─────────────────────────────────────────────────────
// Connects to: core-service via API Gateway
// /api/v1/review-cycles  &  /api/v1/performance-reviews
// ─────────────────────────────────────────────────────────────────────────────

// ── Review Cycles (Admin manages) ──────────────────────────────────────────────
export const reviewCycleService = {
  /**
   * GET /api/v1/review-cycles
   * Get all review cycles.
   */
  getAllCycles: async (): Promise<ReviewCycle[]> => {
    const response = await api.get<ReviewCycle[]>('/review-cycles')
    return response.data
  },

  /**
   * GET /api/v1/review-cycles/active
   * Get the currently active review cycle.
   */
  getActiveCycle: async (): Promise<ReviewCycle> => {
    const response = await api.get<ReviewCycle>('/review-cycles/active')
    return response.data
  },

  /**
   * GET /api/v1/review-cycles/{cycleId}
   * Get a specific review cycle by ID.
   */
  getCycleById: async (cycleId: number): Promise<ReviewCycle> => {
    const response = await api.get<ReviewCycle>(`/review-cycles/${cycleId}`)
    return response.data
  },

  /**
   * POST /api/v1/review-cycles
   * Create a new review cycle (ADMIN only).
   * Backend CreateReviewCycleRequest fields: title, startDt, endDt, status, reqCompAppr, evReq
   */
  createCycle: async (cycleData: ReviewCycleFormState): Promise<ReviewCycle> => {
    const response = await api.post<ReviewCycle>('/review-cycles', {
      title: cycleData.title,
      startDt: cycleData.startDate,
      endDt: cycleData.endDate,
      status: 'ACTIVE',
      reqCompAppr: cycleData.requiresCompletionApproval,
      evReq: cycleData.evidenceRequired,
    })
    return response.data
  },

  /**
   * PUT /api/v1/review-cycles/{cycleId}
   * Update a review cycle (ADMIN only).
   * Backend CreateReviewCycleRequest fields: title, startDt, endDt, status, reqCompAppr, evReq
   * existingStatus: the current status of the cycle (preserved on update)
   */
  updateCycle: async (
    cycleId: number,
    cycleData: ReviewCycleFormState,
    existingStatus = 'ACTIVE'
  ): Promise<ReviewCycle> => {
    const response = await api.put<ReviewCycle>(`/review-cycles/${cycleId}`, {
      title: cycleData.title,
      startDt: cycleData.startDate,
      endDt: cycleData.endDate,
      status: existingStatus,
      reqCompAppr: cycleData.requiresCompletionApproval,
      evReq: cycleData.evidenceRequired,
    })
    return response.data
  },
}

// ── Performance Reviews ─────────────────────────────────────────────────────────
export const performanceReviewService = {
  /**
   * GET /api/v1/performance-reviews
   * Get all performance reviews (filtered by role).
   * Employee: their own reviews
   * Manager: reviews for their team
   * Admin: all reviews
   */
  getReviews: async (
    page = 0,
    size = 10,
    cycleId: number | null = null
  ): Promise<PageResponse<PerformanceReviewResponseDTO>> => {
    const params: Record<string, unknown> = { page, size }
    if (cycleId) params.cycleId = cycleId
    const response = await api.get<PageResponse<PerformanceReviewResponseDTO>>(
      '/performance-reviews',
      { params }
    )
    return response.data
  },

  /**
   * GET /api/v1/performance-reviews/{reviewId}
   * Get a specific review by ID.
   */
  getReviewById: async (reviewId: number): Promise<PerformanceReviewResponseDTO> => {
    const response = await api.get<PerformanceReviewResponseDTO>(
      `/performance-reviews/${reviewId}`
    )
    return response.data
  },

  /**
   * POST /api/v1/performance-reviews
   * Employee submits their self-assessment.
   * Backend SelfAssessmentRequest fields: cycleId, selfAssmt, selfRating
   */
  submitSelfAssessment: async (
    assessmentData: SelfAssessmentFormState & { cycleId: number }
  ): Promise<PerformanceReviewResponseDTO> => {
    const payload: SelfAssessmentRequest = {
      cycleId: assessmentData.cycleId,
      selfAssmt: assessmentData.selfAssessment,
      selfRating: assessmentData.employeeSelfRating,
    }
    const response = await api.post<PerformanceReviewResponseDTO>(
      '/performance-reviews',
      payload
    )
    return response.data
  },

  /**
   * PUT /api/v1/performance-reviews/{reviewId}/draft
   * Save a draft self-assessment (Employee).
   */
  saveDraft: async (
    reviewId: number,
    draftData: Partial<SelfAssessmentRequest>
  ): Promise<PerformanceReviewResponseDTO> => {
    const response = await api.put<PerformanceReviewResponseDTO>(
      `/performance-reviews/${reviewId}/draft`,
      draftData
    )
    return response.data
  },

  /**
   * PUT /api/v1/performance-reviews/{reviewId}
   * Manager submits their review and rating for an employee.
   * Backend ManagerReviewRequest fields: mgrFb, mgrRating, ratingJust, compRec, nextGoals
   */
  submitManagerReview: async (
    reviewId: number,
    reviewData: ManagerReviewFormState
  ): Promise<PerformanceReviewResponseDTO> => {
    const payload: ManagerReviewRequest = {
      mgrFb: reviewData.managerFeedback,
      mgrRating: reviewData.managerRating,
      ratingJust: reviewData.ratingJustification,
      compRec: reviewData.compensationRecommendations,
      nextGoals: reviewData.nextPeriodGoals,
    }
    const response = await api.put<PerformanceReviewResponseDTO>(
      `/performance-reviews/${reviewId}`,
      payload
    )
    return response.data
  },

  /**
   * POST /api/v1/performance-reviews/{reviewId}/acknowledge
   * Employee acknowledges they have read the manager's review.
   * Backend reads body.get("response")
   */
  acknowledgeReview: async (
    reviewId: number,
    employeeResponse: string
  ): Promise<PerformanceReviewResponseDTO> => {
    const response = await api.post<PerformanceReviewResponseDTO>(
      `/performance-reviews/${reviewId}/acknowledge`,
      { response: employeeResponse }
    )
    return response.data
  },
}
