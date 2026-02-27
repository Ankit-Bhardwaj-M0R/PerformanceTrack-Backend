import api from './api'
import type {
  GoalResponseDTO,
  PageResponse,
  CreateGoalRequest,
  GoalFormState,
  CompletionFormState,
  EvidenceVerificationStatus,
} from '../types'
import { GoalCategory, GoalPriority } from '../types'

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
  getGoals: async (
    page = 0,
    size = 10,
    status: string | null = null
  ): Promise<PageResponse<GoalResponseDTO>> => {
    const params: Record<string, unknown> = { page, size }
    if (status) params.status = status
    const response = await api.get<PageResponse<GoalResponseDTO>>('/goals', { params })
    return response.data
  },

  /**
   * GET /api/v1/goals/{goalId}
   * Get detailed information about a specific goal.
   */
  getGoalById: async (goalId: number): Promise<GoalResponseDTO> => {
    const response = await api.get<GoalResponseDTO>(`/goals/${goalId}`)
    return response.data
  },

  /**
   * POST /api/v1/goals
   * Create a new goal (EMPLOYEE only).
   * Backend CreateGoalRequest fields: title, desc, cat, pri, startDt, endDt, mgrId
   */
  createGoal: async (goalData: GoalFormState): Promise<GoalResponseDTO> => {
    const payload: CreateGoalRequest = {
      title: goalData.title,
      desc: goalData.description,
      cat: goalData.category as GoalCategory,
      pri: goalData.priority as GoalPriority,
      startDt: goalData.startDate || null,
      endDt: goalData.endDate || null,
      mgrId: goalData.assignedManagerId ? parseInt(goalData.assignedManagerId as string) : null,
    }
    const response = await api.post<GoalResponseDTO>('/goals', payload)
    return response.data
  },

  /**
   * PUT /api/v1/goals/{goalId}
   * Update a goal (EMPLOYEE, only when goal is in PENDING or requested_changes state).
   * Backend CreateGoalRequest fields: title, desc, cat, pri, startDt, endDt, mgrId
   */
  updateGoal: async (goalId: number, goalData: GoalFormState): Promise<GoalResponseDTO> => {
    const payload: CreateGoalRequest = {
      title: goalData.title,
      desc: goalData.description,
      cat: goalData.category as GoalCategory,
      pri: goalData.priority as GoalPriority,
      startDt: goalData.startDate || null,
      endDt: goalData.endDate || null,
      mgrId: goalData.assignedManagerId ? parseInt(goalData.assignedManagerId as string) : null,
    }
    const response = await api.put<GoalResponseDTO>(`/goals/${goalId}`, payload)
    return response.data
  },

  /**
   * DELETE /api/v1/goals/{goalId}
   * Delete a goal.
   */
  deleteGoal: async (goalId: number): Promise<void> => {
    await api.delete(`/goals/${goalId}`)
  },

  // ─── MANAGER ACTIONS ───────────────────────────────────────────────────────

  /**
   * PUT /api/v1/goals/{goalId}/approve
   * Manager approves a goal (moves from PENDING → IN_PROGRESS).
   */
  approveGoal: async (goalId: number): Promise<GoalResponseDTO> => {
    const response = await api.put<GoalResponseDTO>(`/goals/${goalId}/approve`)
    return response.data
  },

  /**
   * PUT /api/v1/goals/{goalId}/request-changes
   * Manager requests changes to a goal.
   * Body: { comments }
   */
  requestChanges: async (goalId: number, comments: string): Promise<GoalResponseDTO> => {
    const response = await api.put<GoalResponseDTO>(`/goals/${goalId}/request-changes`, {
      comments,
    })
    return response.data
  },

  /**
   * POST /api/v1/goals/{goalId}/approve-completion
   * Manager approves the goal completion.
   * Backend ApproveCompletionRequest field: mgrComments
   */
  approveCompletion: async (goalId: number, comments: string): Promise<GoalResponseDTO> => {
    const response = await api.post<GoalResponseDTO>(`/goals/${goalId}/approve-completion`, {
      mgrComments: comments,
    })
    return response.data
  },

  /**
   * POST /api/v1/goals/{goalId}/reject-completion
   * Manager rejects the completion request.
   * Backend reads body.get("reason")
   */
  rejectCompletion: async (goalId: number, comments: string): Promise<GoalResponseDTO> => {
    const response = await api.post<GoalResponseDTO>(`/goals/${goalId}/reject-completion`, {
      reason: comments,
    })
    return response.data
  },

  /**
   * POST /api/v1/goals/{goalId}/request-additional-evidence
   * Manager requests more evidence before approving completion.
   * Backend reads body.get("reason")
   */
  requestAdditionalEvidence: async (
    goalId: number,
    message: string
  ): Promise<GoalResponseDTO> => {
    const response = await api.post<GoalResponseDTO>(
      `/goals/${goalId}/request-additional-evidence`,
      { reason: message }
    )
    return response.data
  },

  /**
   * PUT /api/v1/goals/{goalId}/evidence/verify
   * Manager verifies the submitted evidence.
   * Backend reads body.get("status") and body.get("notes")
   */
  verifyEvidence: async (
    goalId: number,
    verificationStatus: EvidenceVerificationStatus,
    notes: string
  ): Promise<GoalResponseDTO> => {
    const response = await api.put<GoalResponseDTO>(`/goals/${goalId}/evidence/verify`, {
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
  addProgress: async (goalId: number, notes: string): Promise<GoalResponseDTO> => {
    const response = await api.post<GoalResponseDTO>(`/goals/${goalId}/progress`, {
      note: notes,
    })
    return response.data
  },

  /**
   * GET /api/v1/goals/{goalId}/progress
   * Get all progress updates for a goal.
   */
  getProgress: async (goalId: number): Promise<unknown[]> => {
    const response = await api.get<unknown[]>(`/goals/${goalId}/progress`)
    return response.data
  },

  /**
   * POST /api/v1/goals/{goalId}/submit-completion
   * Employee submits their goal for completion approval.
   * Backend SubmitCompletionRequest fields: evLink, linkDesc, compNotes
   */
  submitCompletion: async (
    goalId: number,
    completionData: CompletionFormState
  ): Promise<GoalResponseDTO> => {
    const response = await api.post<GoalResponseDTO>(`/goals/${goalId}/submit-completion`, {
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
  resubmitEvidence: async (
    goalId: number,
    completionData: CompletionFormState
  ): Promise<GoalResponseDTO> => {
    const response = await api.put<GoalResponseDTO>(`/goals/${goalId}/resubmit-evidence`, {
      evLink: completionData.evidenceLink,
      linkDesc: completionData.evidenceLinkDescription,
      compNotes: completionData.completionNotes,
    })
    return response.data
  },
}

export default goalService
