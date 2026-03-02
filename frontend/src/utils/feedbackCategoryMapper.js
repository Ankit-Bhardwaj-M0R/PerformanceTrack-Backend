/**
 * Maps backend FeedbackType enums to frontend feedback categories
 * Used for displaying feedback with appropriate styling
 */

// Mapping of backend FeedbackType enum values to frontend categories
const FEEDBACK_TYPE_TO_CATEGORY = {
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
 * @param {string} feedbackType - Backend FeedbackType enum value
 * @returns {string} Frontend category: 'POSITIVE', 'CONSTRUCTIVE', or 'GENERAL'
 */
export function getFeedbackCategory(feedbackType) {
  return FEEDBACK_TYPE_TO_CATEGORY[feedbackType] || 'GENERAL'
}

/**
 * Batch converts feedback records by mapping their feedbackType to category
 * @param {Array} feedbackList - Array of feedback objects with feedbackType
 * @returns {Array} Feedback objects with added feedbackCategory property
 */
export function enrichFeedbackWithCategories(feedbackList) {
  return feedbackList.map(fb => ({
    ...fb,
    feedbackCategory: getFeedbackCategory(fb.feedbackType),
  }))
}
