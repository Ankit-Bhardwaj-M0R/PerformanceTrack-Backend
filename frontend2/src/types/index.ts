// ─────────────────────────────────────────────────────────────────────────────
// ENUMS — mirroring backend enums exactly
// ─────────────────────────────────────────────────────────────────────────────

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum GoalStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_COMPLETION_APPROVAL = 'PENDING_COMPLETION_APPROVAL',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum GoalCategory {
  TECHNICAL = 'TECHNICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  PROFESSIONAL_DEVELOPMENT = 'PROFESSIONAL_DEVELOPMENT',
  OTHER = 'OTHER',
}

export enum GoalPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum CompletionApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ADDITIONAL_EVIDENCE_REQUIRED = 'ADDITIONAL_EVIDENCE_REQUIRED',
  REJECTED = 'REJECTED',
}

export enum EvidenceVerificationStatus {
  VERIFIED = 'VERIFIED',
  NEEDS_ADDITIONAL_LINK = 'NEEDS_ADDITIONAL_LINK',
  REJECTED = 'REJECTED',
}

export enum PerformanceReviewStatus {
  PENDING = 'PENDING',
  SELF_ASSESSMENT_COMPLETED = 'SELF_ASSESSMENT_COMPLETED',
  MANAGER_REVIEW_COMPLETED = 'MANAGER_REVIEW_COMPLETED',
  COMPLETED = 'COMPLETED',
  COMPLETED_AND_ACKNOWLEDGED = 'COMPLETED_AND_ACKNOWLEDGED',
}

export enum ReviewCycleStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
}

export enum NotificationType {
  ACCOUNT_CREATED = 'ACCOUNT_CREATED',
  GOAL_SUBMITTED = 'GOAL_SUBMITTED',
  GOAL_APPROVED = 'GOAL_APPROVED',
  GOAL_CHANGE_REQUESTED = 'GOAL_CHANGE_REQUESTED',
  GOAL_RESUBMITTED = 'GOAL_RESUBMITTED',
  GOAL_COMPLETION_SUBMITTED = 'GOAL_COMPLETION_SUBMITTED',
  GOAL_COMPLETION_APPROVED = 'GOAL_COMPLETION_APPROVED',
  ADDITIONAL_EVIDENCE_REQUIRED = 'ADDITIONAL_EVIDENCE_REQUIRED',
  REVIEW_REMINDER = 'REVIEW_REMINDER',
  SELF_ASSESSMENT_SUBMITTED = 'SELF_ASSESSMENT_SUBMITTED',
  PERFORMANCE_REVIEW_COMPLETED = 'PERFORMANCE_REVIEW_COMPLETED',
  REVIEW_ACKNOWLEDGED = 'REVIEW_ACKNOWLEDGED',
}

export enum FeedbackType {
  GOAL_CHANGE_REQUEST = 'GOAL_CHANGE_REQUEST',
  GOAL_FINAL_APPROVE = 'GOAL_FINAL_APPROVE',
  GOAL_FINAL_REJECT = 'GOAL_FINAL_REJECT',
  REVIEW_SELF_ASSESSMENT = 'REVIEW_SELF_ASSESSMENT',
  REVIEW_MANAGER_VERDICT = 'REVIEW_MANAGER_VERDICT',
  REVIEW_ACKNOWLEDGMENT = 'REVIEW_ACKNOWLEDGMENT',
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE DTOs — matching backend response DTO classes
// ─────────────────────────────────────────────────────────────────────────────

/** Standard API response wrapper — matches ApiResponse<T> */
export interface ApiResponse<T> {
  status: 'success' | 'error'
  msg: string
  data: T
}

/** Paginated response wrapper — matches PageResponse<T> */
export interface PageResponse<T> {
  content: T[]
  pageNumber: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

/** JWT login response — matches LoginResponse */
export interface LoginResponse {
  token: string
  userId: number
  name: string
  email: string
  role: UserRole
  department: string | null
  managerId: number | null
}

/** Authenticated user stored in context/localStorage */
export interface AuthUser {
  userId: number
  name: string
  email: string
  role: UserRole
  department: string | null
  managerId: number | null
}

/** Goal response — matches GoalResponseDTO (flattened, no nested objects) */
export interface GoalResponseDTO {
  // Identity
  goalId: number

  // Goal Definition
  title: string
  description: string | null
  category: GoalCategory
  priority: GoalPriority
  startDate: string | null  // ISO date string (LocalDate)
  endDate: string | null
  status: GoalStatus

  // Assigned Employee
  assignedToUserId: number
  assignedToUserName: string | null
  assignedToUserEmail: string | null

  // Assigned Manager
  assignedManagerId: number
  assignedManagerName: string | null
  assignedManagerEmail: string | null

  // Phase 3: Initial Approval
  approvedByUserId: number | null
  approvedByUserName: string | null
  approvedDate: string | null  // ISO datetime
  requestChanges: boolean | null
  lastReviewedByUserId: number | null
  lastReviewedByUserName: string | null
  lastReviewedDate: string | null
  resubmittedDate: string | null

  // Phase 4: Progress
  progressNotes: string | null

  // Phase 5: Evidence Submission
  evidenceLink: string | null
  evidenceLinkDescription: string | null
  evidenceAccessInstructions: string | null
  completionNotes: string | null
  completionSubmittedDate: string | null

  // Phase 6: Evidence Verification
  evidenceLinkVerificationStatus: EvidenceVerificationStatus | null
  evidenceLinkVerificationNotes: string | null
  evidenceLinkVerifiedByUserId: number | null
  evidenceLinkVerifiedByUserName: string | null
  evidenceLinkVerifiedDate: string | null

  // Phase 7: Final Completion Approval
  completionApprovalStatus: CompletionApprovalStatus | null
  completionApprovedByUserId: number | null
  completionApprovedByUserName: string | null
  completionApprovedDate: string | null
  finalCompletionDate: string | null
  managerCompletionComments: string | null

  // Audit
  createdDate: string | null
  lastModifiedDate: string | null
}

/** Performance review response — matches PerformanceReviewResponseDTO */
export interface PerformanceReviewResponseDTO {
  // Review Identity
  reviewId: number

  // Review Cycle Info (flattened)
  cycleId: number
  cycleTitle: string | null
  cycleStartDate: string | null
  cycleEndDate: string | null

  // Employee Info (flattened)
  userId: number
  userName: string | null
  userEmail: string | null
  userDepartment: string | null

  // Manager Info (flattened)
  managerId: number | null
  managerName: string | null
  managerEmail: string | null

  // Self-Assessment Content
  selfAssessment: string | null
  employeeSelfRating: number | null

  // Manager Review Content
  managerFeedback: string | null
  managerRating: number | null
  ratingJustification: string | null
  compensationRecommendations: string | null
  nextPeriodGoals: string | null

  // Reviewer Info
  reviewedByUserId: number | null
  reviewedByUserName: string | null
  reviewCompletedDate: string | null

  // Employee Acknowledgment
  acknowledgedByUserId: number | null
  acknowledgedByUserName: string | null
  acknowledgedDate: string | null
  employeeResponse: string | null

  // Metadata
  status: PerformanceReviewStatus
  submittedDate: string | null
  timeSpentMinutes: number | null
  createdDate: string | null
  lastModifiedDate: string | null
}

/** Review cycle entity */
export interface ReviewCycle {
  cycleId: number
  title: string
  startDate: string    // ISO date string
  endDate: string
  status: ReviewCycleStatus
  requiresCompletionApproval: boolean
  evidenceRequired: boolean
}

/** Notification response — matches NotificationResponseDTO */
export interface NotificationResponseDTO {
  notificationId: number
  type: NotificationType
  message: string
  relatedEntityType: string | null
  relatedEntityId: number | null
  status: NotificationStatus
  priority: string | null
  actionRequired: boolean | null
  createdDate: string | null
  readDate: string | null
  userId: number
}

/** Feedback response — matches FeedbackResponseDTO */
export interface FeedbackResponseDTO {
  feedbackId: number
  comments: string
  feedbackType: string   // Not restricted to FeedbackType enum in the feedback page
  date: string | null
  giverId: number
  giverName: string | null
  goalTitle: string | null
  goalId: number | null
  // additional fields used in EmployeeFeedbackPage
  fromUserName?: string | null
  reviewId?: number | null
  createdDate?: string | null
}

/** Report response — matches ReportResponseDTO */
export interface ReportResponseDTO {
  reportId: number
  scope: string
  metrics: string | null
  format: string
  generatedDate: string | null
  filePath: string | null
  generatedById: number
  generatedByName: string | null
}

/** User entity (used in admin user management) */
export interface UserDTO {
  userId: number
  name: string
  email: string
  role: UserRole
  department: string | null
  status: UserStatus
  manager?: {
    userId: number
    name: string
  } | null
}

/** Audit log entry */
export interface AuditLog {
  auditId?: number
  timestamp: string | null
  action: string
  details: string | null
  relatedEntityType: string | null
  relatedEntityId: number | null
  ipAddress: string | null
  status: string | null
  userId?: number | null
  user?: {
    userId: number
    name: string
  } | null
}

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST DTOs — matching backend request DTO classes
// ─────────────────────────────────────────────────────────────────────────────

/** Login request — matches LoginRequest */
export interface LoginRequest {
  email: string
  password: string
}

/** Create goal request — matches CreateGoalRequest (backend field names) */
export interface CreateGoalRequest {
  title: string
  desc: string
  cat: GoalCategory
  pri: GoalPriority
  startDt: string | null
  endDt: string | null
  mgrId: number | null
}

/** Create user request — matches CreateUserRequest (backend field names) */
export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: UserRole
  dept: string | null
  mgrId: number | null
  status: UserStatus
}

/** Self-assessment request — matches SelfAssessmentRequest */
export interface SelfAssessmentRequest {
  cycleId: number
  selfAssmt: string
  selfRating: number
}

/** Manager review request — matches ManagerReviewRequest */
export interface ManagerReviewRequest {
  mgrFb: string
  mgrRating: number
  ratingJust: string | null
  compRec: string | null
  nextGoals: string | null
}

/** Submit completion request — matches SubmitCompletionRequest */
export interface SubmitCompletionRequest {
  evLink: string
  linkDesc: string
  accessInstr: string | null
  compNotes: string | null
}

/** Approve completion request — matches ApproveCompletionRequest */
export interface ApproveCompletionRequest {
  mgrComments: string | null
}

/** Create review cycle request — matches CreateReviewCycleRequest */
export interface CreateReviewCycleRequest {
  title: string
  startDt: string
  endDt: string
  status: ReviewCycleStatus
  reqCompAppr: boolean
  evReq: boolean
}

/** Feedback request */
export interface FeedbackRequest {
  comments: string
  feedbackType: string
  goalId: number | null
  reviewId: number | null
}

// ─────────────────────────────────────────────────────────────────────────────
// FRONTEND FORM STATE TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Goal form state used in GoalFormModal */
export interface GoalFormState {
  title: string
  description: string
  category: GoalCategory | string
  priority: GoalPriority | string
  startDate: string
  endDate: string
  assignedManagerId: string | number
}

/** Progress form state used in ProgressModal */
export interface ProgressFormState {
  notes: string
  progressPercentage: number
}

/** Completion form state used in CompletionModal */
export interface CompletionFormState {
  completionNotes: string
  evidenceLink: string
  evidenceLinkDescription: string
}

/** Manager action form state used in ManagerActionModal */
export interface ManagerActionFormState {
  comments: string
  message: string
}

/** Evidence verification form state used in EvidenceModal */
export interface EvidenceFormState {
  verificationStatus: EvidenceVerificationStatus | string
  notes: string
}

/** Self-assessment form state */
export interface SelfAssessmentFormState {
  selfAssessment: string
  employeeSelfRating: number
  cycleId?: number
}

/** Manager review form state */
export interface ManagerReviewFormState {
  managerFeedback: string
  managerRating: number
  ratingJustification: string
  compensationRecommendations: string
  nextPeriodGoals: string
}

/** Acknowledge review form state */
export interface AcknowledgeFormState {
  employeeResponse: string
}

/** User form state used in UserFormModal */
export interface UserFormState {
  name: string
  email: string
  password: string
  role: UserRole | string
  department: string
  managerId: string | number
  status: UserStatus | string
}

/** Review cycle form state */
export interface ReviewCycleFormState {
  title: string
  startDate: string
  endDate: string
  requiresCompletionApproval: boolean
  evidenceRequired: boolean
}

/** Password change form state */
export interface PasswordFormState {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD / REPORT TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Dashboard metrics from GET /reports/dashboard */
export interface DashboardMetrics {
  totalUsers?: number
  totalGoals?: number
  totalReviews?: number
  completedGoals?: number
  pendingReviews?: number
  inProgressGoals?: number
  pendingGoals?: number
  rejectedGoals?: number
  pendingApprovals?: number
  pendingCompletions?: number
  teamSize?: number
  completionRate?: number
}

/** Goal analytics from GET /reports/goal-analytics */
export interface GoalAnalytics {
  pending?: number
  inProgress?: number
  pendingCompletion?: number
  completed?: number
  rejected?: number
  categoryBreakdown?: Record<string, number>
}

/** Performance summary from GET /reports/performance-summary */
export interface PerformanceSummary {
  totalReviews?: number
  avgSelfRating?: number
  avgManagerRating?: number
  ratingDistribution?: Record<string, number>
}

/** Department performance entry */
export interface DeptPerformanceEntry {
  department: string
  employeeCount?: number
  completedGoals: number
  avgRating: number
}

/** Chart data point */
export interface ChartDataPoint {
  name: string
  value: number
}

/** Rating data point */
export interface RatingDataPoint {
  rating?: string
  name?: string
  count?: number
  value?: number
}

/** Department bar chart data */
export interface DeptChartData {
  dept: string
  avgRating: number
  completedGoals: number
  employeeCount?: number
}

/** Audit filters */
export interface AuditFilters {
  search?: string
  userId?: string
  action?: string
  dateFrom?: string
  dateTo?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// MANAGER ACTION TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type ManagerActionType =
  | 'APPROVE'
  | 'REQUEST_CHANGES'
  | 'APPROVE_COMPLETION'
  | 'REJECT_COMPLETION'
  | 'REQUEST_EVIDENCE'

export type AvatarSize = 'sm' | 'md' | 'lg'
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'
