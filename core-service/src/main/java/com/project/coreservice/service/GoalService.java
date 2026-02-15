package com.project.coreservice.service;

import com.project.coreservice.client.AuthUserClient;
import com.project.coreservice.client.NotificationClient;
import com.project.coreservice.dto.*;
import com.project.coreservice.entity.Feedback;
import com.project.coreservice.entity.Goal;
import com.project.coreservice.entity.GoalCompletionApproval;
import com.project.coreservice.enums.*;
import com.project.coreservice.exception.BadRequestException;
import com.project.coreservice.exception.ResourceNotFoundException;
import com.project.coreservice.exception.UnauthorizedException;
import com.project.coreservice.repository.FeedbackRepository;
import com.project.coreservice.repository.GoalCompletionApprovalRepository;
import com.project.coreservice.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepo;
    private final FeedbackRepository fbRepo;
    private final GoalCompletionApprovalRepository approvalRepo;
    private final AuthUserClient authUserClient;
    private final NotificationClient notificationClient;

    // Create new goal (Employee)
    @Transactional
    public Goal createGoal(CreateGoalRequest req, Integer empId) {
        // Validate employee exists
        ApiResponse<UserSummaryDTO> empResponse = authUserClient.getUserById(empId);
        if (empResponse == null || empResponse.getData() == null) {
            throw new ResourceNotFoundException("Employee not found");
        }
        UserSummaryDTO emp = empResponse.getData();

        // Validate manager exists
        ApiResponse<UserSummaryDTO> mgrResponse = authUserClient.getUserById(req.getMgrId());
        if (mgrResponse == null || mgrResponse.getData() == null) {
            throw new ResourceNotFoundException("Manager not found");
        }
        UserSummaryDTO mgr = mgrResponse.getData();

        // Validate dates
        if (req.getEndDt().isBefore(req.getStartDt())) {
            throw new BadRequestException("End date must be after start date");
        }

        // Create goal
        Goal goal = new Goal();
        goal.setTitle(req.getTitle());
        goal.setDescription(req.getDesc());
        goal.setCategory(req.getCat());
        goal.setPriority(req.getPri());
        goal.setAssignedToUserId(empId);
        goal.setAssignedManagerId(req.getMgrId());
        goal.setStartDate(req.getStartDt());
        goal.setEndDate(req.getEndDt());
        goal.setStatus(GoalStatus.PENDING);

        // Save goal
        Goal savedGoal = goalRepo.save(goal);

        // Create notification for manager
        sendNotification(
                req.getMgrId().longValue(),
                "GOAL_SUBMITTED",
                emp.getName() + " submitted goal: " + goal.getTitle(),
                req.getPri().name(),
                true,
                "Goal",
                savedGoal.getGoalId()
        );

        // Create audit log
        createAuditLog(empId, "GOAL_CREATED", "Created goal: " + goal.getTitle(), "Goal", savedGoal.getGoalId());

        return savedGoal;
    }

    // Get goals by user (non-paginated)
    public List<Goal> getGoalsByUser(Integer userId) {
        return goalRepo.findByAssignedToUserId(userId);
    }

    // Get goals by manager (non-paginated)
    public List<Goal> getGoalsByManager(Integer mgrId) {
        return goalRepo.findByAssignedManagerId(mgrId);
    }

    // Get goals by user (paginated)
    public Page<Goal> getGoalsByUser(Integer userId, Pageable pageable) {
        return goalRepo.findByAssignedToUserId(userId, pageable);
    }

    // Get goals by manager (paginated)
    public Page<Goal> getGoalsByManager(Integer mgrId, Pageable pageable) {
        return goalRepo.findByAssignedManagerId(mgrId, pageable);
    }

    // Get goal by ID
    public Goal getGoalById(Integer goalId) {
        return goalRepo.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
    }

    // Approve goal (Manager)
    @Transactional
    public Goal approveGoal(Integer goalId, Integer mgrId) {
        Goal goal = getGoalById(goalId);

        // Check if manager is authorized
        if (!goal.getAssignedManagerId().equals(mgrId)) {
            throw new UnauthorizedException("Not authorized to approve this goal");
        }

        // Check if goal is in pending status
        if (!goal.getStatus().equals(GoalStatus.PENDING)) {
            throw new BadRequestException("Goal is not in pending status");
        }

        // Update goal
        goal.setStatus(GoalStatus.IN_PROGRESS);
        goal.setApprovedByUserId(mgrId);
        goal.setApprovedDate(LocalDateTime.now());
        goal.setRequestChanges(false);
        Goal updated = goalRepo.save(goal);

        // Notify employee
        sendNotification(
                goal.getAssignedToUserId().longValue(),
                "GOAL_APPROVED",
                "Your goal '" + goal.getTitle() + "' has been approved",
                goal.getPriority().name(),
                false,
                "Goal",
                goalId
        );

        // Audit log
        createAuditLog(mgrId, "GOAL_APPROVED", "Approved goal: " + goal.getTitle(), "Goal", goalId);

        return updated;
    }

    // Request changes to goal (Manager)
    @Transactional
    public Goal requestChanges(Integer goalId, Integer mgrId, String comments) {
        Goal goal = getGoalById(goalId);

        // Check authorization
        if (!goal.getAssignedManagerId().equals(mgrId)) {
            throw new UnauthorizedException("Not authorized");
        }

        // Update goal
        goal.setRequestChanges(true);
        goal.setLastReviewedByUserId(mgrId);
        goal.setLastReviewedDate(LocalDateTime.now());
        Goal updated = goalRepo.save(goal);

        // Save feedback
        Feedback fb = new Feedback();
        fb.setGoal(goal);
        fb.setGivenByUserId(mgrId);
        fb.setComments(comments);
        fb.setFeedbackType("CHANGE_REQUEST");
        fb.setDate(LocalDateTime.now());
        fbRepo.save(fb);

        // Notify employee
        sendNotification(
                goal.getAssignedToUserId().longValue(),
                "GOAL_CHANGE_REQUESTED",
                "Changes requested for goal: " + goal.getTitle(),
                "NORMAL",
                true,
                "Goal",
                goalId
        );

        // Audit log
        createAuditLog(mgrId, "GOAL_CHANGE_REQUESTED", "Requested changes for goal: " + goal.getTitle(), "Goal", goalId);

        return updated;
    }

    // Submit goal completion with evidence (Employee)
    @Transactional
    public Goal submitCompletion(Integer goalId, SubmitCompletionRequest req, Integer empId) {
        Goal goal = getGoalById(goalId);

        // Check authorization
        if (!goal.getAssignedToUserId().equals(empId)) {
            throw new UnauthorizedException("Not authorized");
        }

        // Check if goal is in progress
        if (!goal.getStatus().equals(GoalStatus.IN_PROGRESS)) {
            throw new BadRequestException("Goal is not in progress");
        }

        // Update goal with evidence and completion info
        goal.setStatus(GoalStatus.PENDING_COMPLETION_APPROVAL);
        goal.setEvidenceLink(req.getEvLink());
        goal.setEvidenceLinkDescription(req.getLinkDesc());
        goal.setEvidenceAccessInstructions(req.getAccessInstr());
        goal.setCompletionNotes(req.getCompNotes());
        goal.setCompletionSubmittedDate(LocalDateTime.now());
        goal.setCompletionApprovalStatus(CompletionApprovalStatus.PENDING);
        goal.setEvidenceLinkVerificationStatus(EvidenceVerificationStatus.NOT_VERIFIED);
        Goal updated = goalRepo.save(goal);

        // Get employee name for notification
        ApiResponse<UserSummaryDTO> empResponse = authUserClient.getUserById(empId);
        String empName = (empResponse != null && empResponse.getData() != null)
                ? empResponse.getData().getName()
                : "Employee";

        // Notify manager
        sendNotification(
                goal.getAssignedManagerId().longValue(),
                "GOAL_COMPLETION_SUBMITTED",
                empName + " submitted completion for: " + goal.getTitle(),
                "HIGH",
                true,
                "Goal",
                goalId
        );

        // Audit log
        createAuditLog(empId, "GOAL_COMPLETION_SUBMITTED", "Submitted completion", "Goal", goalId);

        return updated;
    }

    // Approve goal completion (Manager)
    @Transactional
    public Goal approveCompletion(Integer goalId, ApproveCompletionRequest req, Integer mgrId) {
        Goal goal = getGoalById(goalId);

        // Check authorization
        if (!goal.getAssignedManagerId().equals(mgrId)) {
            throw new UnauthorizedException("Not authorized");
        }

        // Check status
        if (!goal.getStatus().equals(GoalStatus.PENDING_COMPLETION_APPROVAL)) {
            throw new BadRequestException("Goal is not pending completion approval");
        }

        // Update goal
        goal.setStatus(GoalStatus.COMPLETED);
        goal.setCompletionApprovalStatus(CompletionApprovalStatus.APPROVED);
        goal.setCompletionApprovedByUserId(mgrId);
        goal.setCompletionApprovedDate(LocalDateTime.now());
        goal.setFinalCompletionDate(LocalDateTime.now());
        goal.setManagerCompletionComments(req.getMgrComments());
        goal.setEvidenceLinkVerificationStatus(EvidenceVerificationStatus.VERIFIED);
        goal.setEvidenceLinkVerifiedByUserId(mgrId);
        goal.setEvidenceLinkVerifiedDate(LocalDateTime.now());
        Goal updated = goalRepo.save(goal);

        // Create GoalCompletionApproval record
        GoalCompletionApproval approval = new GoalCompletionApproval();
        approval.setGoal(goal);
        approval.setApprovalDecision("APPROVED");
        approval.setApprovedByUserId(mgrId);
        approval.setApprovalDate(LocalDateTime.now());
        approval.setManagerComments(req.getMgrComments());
        approval.setEvidenceLinkVerified(true);
        approval.setDecisionRationale("Evidence verified and goal completion approved");
        approvalRepo.save(approval);

        // Notify employee
        sendNotification(
                goal.getAssignedToUserId().longValue(),
                "GOAL_COMPLETION_APPROVED",
                "Your goal '" + goal.getTitle() + "' completion has been approved!",
                "HIGH",
                false,
                "Goal",
                goalId
        );

        // Audit Log
        createAuditLog(mgrId, "GOAL_COMPLETION_APPROVED", "Approved completion for goal: " + goal.getTitle(), "Goal", goalId);

        return updated;
    }

    // Request additional evidence (Manager)
    @Transactional
    public Goal requestAdditionalEvidence(Integer goalId, Integer mgrId, String reason) {
        Goal goal = getGoalById(goalId);

        // Check authorization
        if (!goal.getAssignedManagerId().equals(mgrId)) {
            throw new UnauthorizedException("Not authorized");
        }

        // Update goal
        goal.setCompletionApprovalStatus(CompletionApprovalStatus.ADDITIONAL_EVIDENCE_REQUIRED);
        goal.setEvidenceLinkVerificationStatus(EvidenceVerificationStatus.NEEDS_ADDITIONAL_LINK);
        goal.setEvidenceLinkVerificationNotes(reason);
        Goal updated = goalRepo.save(goal);

        // Notify employee
        sendNotification(
                goal.getAssignedToUserId().longValue(),
                "ADDITIONAL_EVIDENCE_REQUIRED",
                "Additional evidence needed for goal: " + goal.getTitle(),
                "NORMAL",
                true,
                "Goal",
                goalId
        );

        // Audit log
        createAuditLog(mgrId, "ADDITIONAL_EVIDENCE_REQUESTED", "Requested additional evidence", "Goal", goalId);

        return updated;
    }

    // Update goal (Employee - only when changes requested)
    @Transactional
    public Goal updateGoal(Integer goalId, CreateGoalRequest req, Integer empId) {
        Goal goal = getGoalById(goalId);

        // Check authorization
        if (!goal.getAssignedToUserId().equals(empId)) {
            throw new UnauthorizedException("Not authorized");
        }

        // Check if changes were requested
        if (!goal.getRequestChanges()) {
            throw new BadRequestException("Goal is not in change request status");
        }

        // Update goal fields
        goal.setTitle(req.getTitle());
        goal.setDescription(req.getDesc());
        goal.setCategory(req.getCat());
        goal.setPriority(req.getPri());
        goal.setStartDate(req.getStartDt());
        goal.setEndDate(req.getEndDt());
        goal.setRequestChanges(false);
        goal.setResubmittedDate(LocalDateTime.now());

        Goal updated = goalRepo.save(goal);

        // Get employee name for notification
        ApiResponse<UserSummaryDTO> empResponse = authUserClient.getUserById(empId);
        String empName = (empResponse != null && empResponse.getData() != null)
                ? empResponse.getData().getName()
                : "Employee";

        // Notify manager
        sendNotification(
                goal.getAssignedManagerId().longValue(),
                "GOAL_RESUBMITTED",
                empName + " updated and resubmitted goal: " + goal.getTitle(),
                "NORMAL",
                true,
                "Goal",
                goalId
        );

        // Audit log
        createAuditLog(empId, "GOAL_UPDATED", "Updated and resubmitted goal: " + goal.getTitle(), "Goal", goalId);

        return updated;
    }

    // Delete goal (soft delete)
    @Transactional
    public void deleteGoal(Integer goalId, Integer userId, String role) {
        Goal goal = getGoalById(goalId);

        // Check authorization - employee can delete own goals, manager/admin can delete any
        if (role.equals("EMPLOYEE") && !goal.getAssignedToUserId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to delete this goal");
        }

        // Soft delete - just mark as rejected or inactive status
        goal.setStatus(GoalStatus.REJECTED);
        goalRepo.save(goal);

        // Audit log
        createAuditLog(userId, "GOAL_DELETED", "Deleted goal: " + goal.getTitle(), "Goal", goalId);
    }

    // Verify evidence (Manager)
    @Transactional
    public Goal verifyEvidence(Integer goalId, Integer mgrId, String status, String notes) {
        Goal goal = getGoalById(goalId);

        // Check authorization
        if (!goal.getAssignedManagerId().equals(mgrId)) {
            throw new UnauthorizedException("Not authorized");
        }

        // Update evidence verification status
        EvidenceVerificationStatus evStatus = EvidenceVerificationStatus.valueOf(status.toUpperCase());
        goal.setEvidenceLinkVerificationStatus(evStatus);
        goal.setEvidenceLinkVerificationNotes(notes);
        goal.setEvidenceLinkVerifiedByUserId(mgrId);
        goal.setEvidenceLinkVerifiedDate(LocalDateTime.now());

        Goal updated = goalRepo.save(goal);

        // Audit log
        createAuditLog(mgrId, "EVIDENCE_VERIFIED", "Verified evidence for goal: " + goal.getTitle() + " - Status: " + status, "Goal", goalId);

        return updated;
    }

    // Reject goal completion (Manager)
    @Transactional
    public Goal rejectCompletion(Integer goalId, Integer mgrId, String reason) {
        Goal goal = getGoalById(goalId);

        // Check authorization
        if (!goal.getAssignedManagerId().equals(mgrId)) {
            throw new UnauthorizedException("Not authorized");
        }

        // Update goal status back to in progress
        goal.setStatus(GoalStatus.IN_PROGRESS);
        goal.setCompletionApprovalStatus(CompletionApprovalStatus.REJECTED);
        goal.setManagerCompletionComments(reason);

        Goal updated = goalRepo.save(goal);

        // Create GoalCompletionApproval record for rejection
        GoalCompletionApproval approval = new GoalCompletionApproval();
        approval.setGoal(goal);
        approval.setApprovalDecision("REJECTED");
        approval.setApprovedByUserId(mgrId);
        approval.setApprovalDate(LocalDateTime.now());
        approval.setManagerComments(reason);
        approval.setEvidenceLinkVerified(false);
        approval.setDecisionRationale("Goal completion rejected");
        approvalRepo.save(approval);

        // Notify employee
        sendNotification(
                goal.getAssignedToUserId().longValue(),
                "GOAL_COMPLETION_REJECTED",
                "Your goal '" + goal.getTitle() + "' completion was rejected. Please review feedback.",
                "HIGH",
                true,
                "Goal",
                goalId
        );

        // Audit log
        createAuditLog(mgrId, "GOAL_COMPLETION_REJECTED", "Rejected completion for goal: " + goal.getTitle(), "Goal", goalId);

        return updated;
    }

    // Add progress update (Employee)
    @Transactional
    public void addProgressUpdate(Integer goalId, Integer empId, String note) {
        Goal goal = getGoalById(goalId);

        // Check authorization
        if (!goal.getAssignedToUserId().equals(empId)) {
            throw new UnauthorizedException("Not authorized");
        }

        // Add progress note (append to existing notes with timestamp)
        String timestamp = LocalDateTime.now().toString();
        String newNote = timestamp + ": " + note;

        String existingNotes = goal.getProgressNotes();
        if (existingNotes == null || existingNotes.isEmpty()) {
            goal.setProgressNotes(newNote);
        } else {
            goal.setProgressNotes(existingNotes + "\n" + newNote);
        }

        goalRepo.save(goal);

        // Audit log
        createAuditLog(empId, "PROGRESS_ADDED", "Added progress update for goal: " + goal.getTitle(), "Goal", goalId);
    }

    // Get progress updates
    public String getProgressUpdates(Integer goalId) {
        Goal goal = getGoalById(goalId);
        return goal.getProgressNotes() != null ? goal.getProgressNotes() : "No progress updates yet";
    }

    // Helper method to send notifications
    private void sendNotification(Long userId, String type, String message, String priority,
                                  boolean actionRequired, String entityType, Integer entityId) {
        try {
            NotificationRequest notifReq = NotificationRequest.builder()
                    .userId(userId)
                    .type(type)
                    .message(message)
                    .priority(priority)
                    .actionRequired(actionRequired)
                    .relatedEntityType(entityType)
                    .relatedEntityId(entityId)
                    .build();
            notificationClient.sendNotification(notifReq);
        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage());
        }
    }

    // Helper method for Audit Logs
    private void createAuditLog(Integer userId, String action, String details, String entityType, Integer entityId) {
        try {
            AuditLogRequest auditReq = AuditLogRequest.builder()
                    .userId(userId)
                    .action(action)
                    .details(details)
                    .relatedEntityType(entityType)
                    .relatedEntityId(entityId)
                    .status("SUCCESS")
                    .ipAddress(null)
                    .build();
            authUserClient.createAuditLog(auditReq);
        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage());
        }
    }

    // Get goals by status
    public List<Goal> getGoalsByStatus(GoalStatus status) {
        return goalRepo.findByStatus(status);
    }

}
