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
   * Body: { title, startDate, endDate, requiresCompletionApproval, evidenceRequired }
   */
  createCycle: async (cycleData) => {
    const response = await api.post('/review-cycles', cycleData)
    return response.data
  },

  /**
   * PUT /api/v1/review-cycles/{cycleId}
   * Update a review cycle (ADMIN only).
   */
  updateCycle: async (cycleId, cycleData) => {
    const response = await api.put(`/review-cycles/${cycleId}`, cycleData)
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
  getReviews: async (page = 0, size = 10) => {
    const response = await api.get('/performance-reviews', { params: { page, size } })
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
   * Body: { cycleId, selfAssessment, employeeSelfRating }
   */
  submitSelfAssessment: async (assessmentData) => {
    const response = await api.post('/performance-reviews', assessmentData)
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
   * Body: { managerFeedback, managerRating, ratingJustification, compensationRecommendations, nextPeriodGoals }
   */
  submitManagerReview: async (reviewId, reviewData) => {
    const response = await api.put(`/performance-reviews/${reviewId}`, reviewData)
    return response.data
  },

  /**
   * POST /api/v1/performance-reviews/{reviewId}/acknowledge
   * Employee acknowledges they have read the manager's review.
   * Body: { employeeResponse }
   */
  acknowledgeReview: async (reviewId, employeeResponse) => {
    const response = await api.post(`/performance-reviews/${reviewId}/acknowledge`, {
      employeeResponse,
    })
    return response.data
  },
}
