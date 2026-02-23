import api from './api'

// ─── FEEDBACK SERVICE ─────────────────────────────────────────────────────────
// Connects to: core-service via API Gateway at /api/v1/feedback
// ─────────────────────────────────────────────────────────────────────────────

const feedbackService = {
  /**
   * GET /api/v1/feedback
   * Get all feedback. Can be filtered by goalId or reviewId.
   * @param {number|null} goalId - Filter feedback for a specific goal
   * @param {number|null} reviewId - Filter feedback for a specific review
   */
  getFeedback: async (goalId = null, reviewId = null) => {
    const params = {}
    if (goalId) params.goalId = goalId
    if (reviewId) params.reviewId = reviewId
    const response = await api.get('/feedback', { params })
    return response.data
  },

  /**
   * POST /api/v1/feedback
   * Create new feedback.
   * Body: { goalId, reviewId, comments, feedbackType }
   * feedbackType: "POSITIVE" | "CONSTRUCTIVE" | "GENERAL"
   */
  createFeedback: async (feedbackData) => {
    const response = await api.post('/feedback', feedbackData)
    return response.data
  },
}

export default feedbackService
