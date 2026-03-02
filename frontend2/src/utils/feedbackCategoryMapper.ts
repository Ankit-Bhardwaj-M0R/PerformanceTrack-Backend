/**
 * Maps backend FeedbackType enums to frontend feedback categories
 * Used for displaying feedback with appropriate styling
 */

// Mapping of backend FeedbackType enum values to frontend categories
const FEEDBACK_TYPE_TO_CATEGORY: Record<string, string> = {
  // General feedback - self-assessments and acknowledgments
  REVIEW_SELF_ASSESSMENT: 'GENERAL',
  REVIEW_ACKNOWLEDGMENT: 'GENERAL',

  // Constructive feedback - requests for changes or rejections
  GOAL_CHANGE_REQUEST: 'CONSTRUCTIVE',
  GOAL_FINAL_REJECT: 'CONSTRUCTIVE',

  // Positive feedback - approvals and manager verdicts
  GOAL_FINAL_APPROVE: 'POSITIVE',
  REVIEW_MANAGER_VERDICT: 'POSITIVE',
}

/**
 * Converts a backend FeedbackType to frontend category
 */
export function getFeedbackCategory(feedbackType?: string | null): string {
  if (!feedbackType) return 'GENERAL'
  return FEEDBACK_TYPE_TO_CATEGORY[feedbackType] || 'GENERAL'
}

/**
 * Batch converts feedback records by mapping their feedbackType to category
 */
export function enrichFeedbackWithCategories<T extends { feedbackType?: string }>(
  feedbackList: T[]
): (T & { feedbackCategory: string })[] {
  return feedbackList.map(fb => ({
    ...fb,
    feedbackCategory: getFeedbackCategory(fb.feedbackType),
  }))
}
