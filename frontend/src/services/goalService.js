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
   * Backend CreateGoalRequest fields: title, desc, cat, pri, startDt, endDt, mgrId
   */
  createGoal: async (goalData) => {
    const response = await api.post('/goals', {
      title: goalData.title,
      desc: goalData.description,
      cat: goalData.category,
      pri: goalData.priority,
      startDt: goalData.startDate || null,
      endDt: goalData.endDate || null,
      mgrId: goalData.assignedManagerId ? parseInt(goalData.assignedManagerId) : null,
    })
    return response.data
  },

  /**
   * PUT /api/v1/goals/{goalId}
   * Update a goal (EMPLOYEE, only when goal is in PENDING or requested_changes state).
   * Backend CreateGoalRequest fields: title, desc, cat, pri, startDt, endDt, mgrId
   */
  updateGoal: async (goalId, goalData) => {
    const response = await api.put(`/goals/${goalId}`, {
      title: goalData.title,
      desc: goalData.description,
      cat: goalData.category,
      pri: goalData.priority,
      startDt: goalData.startDate || null,
      endDt: goalData.endDate || null,
      mgrId: goalData.assignedManagerId ? parseInt(goalData.assignedManagerId) : null,
    })
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
   * Backend ApproveCompletionRequest field: mgrComments
   */
  approveCompletion: async (goalId, comments) => {
    const response = await api.post(`/goals/${goalId}/approve-completion`, { mgrComments: comments })
    return response.data
  },

  /**
   * POST /api/v1/goals/{goalId}/reject-completion
   * Manager rejects the completion request.
   * Backend reads body.get("reason")
   */
  rejectCompletion: async (goalId, comments) => {
    const response = await api.post(`/goals/${goalId}/reject-completion`, { reason: comments })
    return response.data
  },

  /**
   * POST /api/v1/goals/{goalId}/request-additional-evidence
   * Manager requests more evidence before approving completion.
   * Backend reads body.get("reason")
   */
  requestAdditionalEvidence: async (goalId, message) => {
    const response = await api.post(`/goals/${goalId}/request-additional-evidence`, { reason: message })
    return response.data
  },

  /**
   * PUT /api/v1/goals/{goalId}/evidence/verify
   * Manager verifies the submitted evidence.
   * Backend reads body.get("status") and body.get("notes")
   */
  verifyEvidence: async (goalId, verificationStatus, notes) => {
    const response = await api.put(`/goals/${goalId}/evidence/verify`, {
      status: verificationStatus,
      notes,
    })
    return response.data
  },

  // ─── EMPLOYEE ACTIONS ──────────────────────────────────────────────────────

  /**
   * POST /api/v1/goals/{goalId}/progress
   * Add a progress update to a goal (EMPLOYEE).
   * Backend reads body.get("note") — singular, not "notes"
   */
  addProgress: async (goalId, notes, progressPercentage) => {
    const response = await api.post(`/goals/${goalId}/progress`, {
      note: notes,
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
   * Backend SubmitCompletionRequest fields: evLink, linkDesc, compNotes
   */
  submitCompletion: async (goalId, completionData) => {
    const response = await api.post(`/goals/${goalId}/submit-completion`, {
      evLink: completionData.evidenceLink,
      linkDesc: completionData.evidenceLinkDescription,
      compNotes: completionData.completionNotes,
    })
    return response.data
  },

  /**
   * PUT /api/v1/goals/{goalId}/resubmit-evidence
   * Employee resubmits evidence when manager requests additional evidence.
   * Backend SubmitCompletionRequest fields: evLink, linkDesc, compNotes
   */
  resubmitEvidence: async (goalId, completionData) => {
    const response = await api.put(`/goals/${goalId}/resubmit-evidence`, {
      evLink: completionData.evidenceLink,
      linkDesc: completionData.evidenceLinkDescription,
      compNotes: completionData.completionNotes,
    })
    return response.data
  },
}

export default goalService
