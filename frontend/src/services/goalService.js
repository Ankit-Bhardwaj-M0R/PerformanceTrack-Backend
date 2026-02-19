import api from './api'

// ─── GOAL SERVICE ─────────────────────────────────────────────────────────────
// Connects to: core-service via API Gateway at /api/v1/goals
// Goals have a 7-phase workflow:
//   1. Creation (Employee)
//   2. Approval (Manager)
//   3. Work & Progress (Employee)
//   4. Completion Submission (Employee)
//   5. Evidence Verification (Manager)
//   6. Final Approval (Manager)
//   7. Metadata/Audit (System)
// ─────────────────────────────────────────────────────────────────────────────

const goalService = {
  /**
   * GET /api/v1/goals
   * Get all goals (role-based filtering applied on backend).
   * Employee: sees their own goals
   * Manager: sees team goals
   * Admin: sees all goals
   */
  getGoals: async (page = 0, size = 10, status = null) => {
    const params = { page, size }
    if (status) params.status = status
    const response = await api.get('/goals', { params })
    return response.data
  },

  /**
   * GET /api/v1/goals/{goalId}
   * Get detailed information about a specific goal.
   */
  getGoalById: async (goalId) => {
    const response = await api.get(`/goals/${goalId}`)
    return response.data
  },

  /**
   * POST /api/v1/goals
   * Create a new goal (EMPLOYEE only).
   * Body: { title, description, category, priority, startDate, endDate, assignedManagerId }
   */
  createGoal: async (goalData) => {
    const response = await api.post('/goals', goalData)
    return response.data
  },

  /**
   * PUT /api/v1/goals/{goalId}
   * Update a goal (EMPLOYEE, only when goal is in PENDING or requested_changes state).
   */
  updateGoal: async (goalId, goalData) => {
    const response = await api.put(`/goals/${goalId}`, goalData)
    return response.data
  },

  /**
   * DELETE /api/v1/goals/{goalId}
   * Delete a goal.
   */
  deleteGoal: async (goalId) => {
    const response = await api.delete(`/goals/${goalId}`)
    return response.data
  },

  // ─── MANAGER ACTIONS ───────────────────────────────────────────────────────

  /**
   * PUT /api/v1/goals/{goalId}/approve
   * Manager approves a goal (moves from PENDING → IN_PROGRESS).
   */
  approveGoal: async (goalId) => {
    const response = await api.put(`/goals/${goalId}/approve`)
    return response.data
  },

  /**
   * PUT /api/v1/goals/{goalId}/request-changes
   * Manager requests changes to a goal.
   * Body: { comments }
   */
  requestChanges: async (goalId, comments) => {
    const response = await api.put(`/goals/${goalId}/request-changes`, { comments })
    return response.data
  },

  /**
   * POST /api/v1/goals/{goalId}/approve-completion
   * Manager approves the goal completion.
   * Body: { comments }
   */
  approveCompletion: async (goalId, comments) => {
    const response = await api.post(`/goals/${goalId}/approve-completion`, { comments })
    return response.data
  },

  /**
   * POST /api/v1/goals/{goalId}/reject-completion
   * Manager rejects the completion request.
   * Body: { comments }
   */
  rejectCompletion: async (goalId, comments) => {
    const response = await api.post(`/goals/${goalId}/reject-completion`, { comments })
    return response.data
  },

  /**
   * POST /api/v1/goals/{goalId}/request-additional-evidence
   * Manager requests more evidence before approving completion.
   * Body: { message }
   */
  requestAdditionalEvidence: async (goalId, message) => {
    const response = await api.post(`/goals/${goalId}/request-additional-evidence`, { message })
    return response.data
  },

  /**
   * PUT /api/v1/goals/{goalId}/evidence/verify
   * Manager verifies the submitted evidence.
   * Body: { verificationStatus, notes }
   */
  verifyEvidence: async (goalId, verificationStatus, notes) => {
    const response = await api.put(`/goals/${goalId}/evidence/verify`, {
      verificationStatus,
      notes,
    })
    return response.data
  },

  // ─── EMPLOYEE ACTIONS ──────────────────────────────────────────────────────

  /**
   * POST /api/v1/goals/{goalId}/progress
   * Add a progress update to a goal (EMPLOYEE).
   * Body: { notes, progressPercentage }
   */
  addProgress: async (goalId, notes, progressPercentage) => {
    const response = await api.post(`/goals/${goalId}/progress`, {
      notes,
      progressPercentage,
    })
    return response.data
  },

  /**
   * GET /api/v1/goals/{goalId}/progress
   * Get all progress updates for a goal.
   */
  getProgress: async (goalId) => {
    const response = await api.get(`/goals/${goalId}/progress`)
    return response.data
  },

  /**
   * POST /api/v1/goals/{goalId}/submit-completion
   * Employee submits their goal for completion approval.
   * Body: { completionNotes, evidenceLink, evidenceLinkDescription }
   */
  submitCompletion: async (goalId, completionData) => {
    const response = await api.post(`/goals/${goalId}/submit-completion`, completionData)
    return response.data
  },
}

export default goalService
