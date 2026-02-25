import api from './api'

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
  getAllCycles: async () => {
    const response = await api.get('/review-cycles')
    return response.data
  },

  /**
   * GET /api/v1/review-cycles/active
   * Get the currently active review cycle.
   */
  getActiveCycle: async () => {
    const response = await api.get('/review-cycles/active')
    return response.data
  },

  /**
   * GET /api/v1/review-cycles/{cycleId}
   * Get a specific review cycle by ID.
   */
  getCycleById: async (cycleId) => {
    const response = await api.get(`/review-cycles/${cycleId}`)
    return response.data
  },

  /**
   * POST /api/v1/review-cycles
   * Create a new review cycle (ADMIN only).
   * Backend CreateReviewCycleRequest fields: title, startDt, endDt, status, reqCompAppr, evReq
   */
  createCycle: async (cycleData) => {
    const response = await api.post('/review-cycles', {
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
  updateCycle: async (cycleId, cycleData, existingStatus = 'ACTIVE') => {
    const response = await api.put(`/review-cycles/${cycleId}`, {
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
  getReviews: async (page = 0, size = 10, cycleId = null) => {
    const params = { page, size }
    if (cycleId) params.cycleId = cycleId
    const response = await api.get('/performance-reviews', { params })
    return response.data
  },

  /**
   * GET /api/v1/performance-reviews/{reviewId}
   * Get a specific review by ID.
   */
  getReviewById: async (reviewId) => {
    const response = await api.get(`/performance-reviews/${reviewId}`)
    return response.data
  },

  /**
   * POST /api/v1/performance-reviews
   * Employee submits their self-assessment.
   * Backend SelfAssessmentRequest fields: cycleId, selfAssmt, selfRating
   */
  submitSelfAssessment: async (assessmentData) => {
    const response = await api.post('/performance-reviews', {
      cycleId: assessmentData.cycleId,
      selfAssmt: assessmentData.selfAssessment,
      selfRating: assessmentData.employeeSelfRating,
    })
    return response.data
  },

  /**
   * PUT /api/v1/performance-reviews/{reviewId}/draft
   * Save a draft self-assessment (Employee).
   */
  saveDraft: async (reviewId, draftData) => {
    const response = await api.put(`/performance-reviews/${reviewId}/draft`, draftData)
    return response.data
  },

  /**
   * PUT /api/v1/performance-reviews/{reviewId}
   * Manager submits their review and rating for an employee.
   * Backend ManagerReviewRequest fields: mgrFb, mgrRating, ratingJust, compRec, nextGoals
   */
  submitManagerReview: async (reviewId, reviewData) => {
    const response = await api.put(`/performance-reviews/${reviewId}`, {
      mgrFb: reviewData.managerFeedback,
      mgrRating: reviewData.managerRating,
      ratingJust: reviewData.ratingJustification,
      compRec: reviewData.compensationRecommendations,
      nextGoals: reviewData.nextPeriodGoals,
    })
    return response.data
  },

  /**
   * POST /api/v1/performance-reviews/{reviewId}/acknowledge
   * Employee acknowledges they have read the manager's review.
   * Backend reads body.get("response")
   */
  acknowledgeReview: async (reviewId, employeeResponse) => {
    const response = await api.post(`/performance-reviews/${reviewId}/acknowledge`, {
      response: employeeResponse,
    })
    return response.data
  },
}
