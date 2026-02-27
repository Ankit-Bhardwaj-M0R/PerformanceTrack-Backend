import api from './api'
import type { FeedbackResponseDTO, FeedbackRequest } from '../types'

// ─── FEEDBACK SERVICE ─────────────────────────────────────────────────────────
// Connects to: core-service via API Gateway at /api/v1/feedback
// ─────────────────────────────────────────────────────────────────────────────

const feedbackService = {
  /**
   * GET /api/v1/feedback
   * Get all feedback. Can be filtered by goalId or reviewId.
   */
  getFeedback: async (
    goalId: number | null = null,
    reviewId: number | null = null
  ): Promise<FeedbackResponseDTO[]> => {
    const params: Record<string, number> = {}
    if (goalId) params.goalId = goalId
    if (reviewId) params.reviewId = reviewId
    const response = await api.get<FeedbackResponseDTO[]>('/feedback', { params })
    return response.data
  },

  /**
   * POST /api/v1/feedback
   * Create new feedback.
   * Body: { goalId, reviewId, comments, feedbackType }
   * feedbackType: "POSITIVE" | "CONSTRUCTIVE" | "GENERAL"
   */
  createFeedback: async (feedbackData: FeedbackRequest): Promise<FeedbackResponseDTO> => {
    const response = await api.post<FeedbackResponseDTO>('/feedback', feedbackData)
    return response.data
  },
}

export default feedbackService
