package com.project.performanceTrack.dto;

import com.project.performanceTrack.enums.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponseDTO {

    // ── Identity ──────────────────────────────────────────────────────────────
    private Integer goalId;

    // ── Goal Definition ───────────────────────────────────────────────────────
    private String title;
    private String description;
    private GoalCategory category;
    private GoalPriority priority;
    private LocalDate startDate;
    private LocalDate endDate;
    private GoalStatus status;

    // ── Assigned Employee (flat — no nested object) ───────────────────────────
    private Integer assignedToUserId;
    private String  assignedToUserName;
    private String  assignedToUserEmail;

    // ── Assigned Manager (flat — no nested object) ────────────────────────────
    private Integer assignedManagerId;
    private String  assignedManagerName;
    private String  assignedManagerEmail;

    // ── Phase 3: Initial Approval ─────────────────────────────────────────────
    private Integer approvedByUserId;
    private String  approvedByUserName;
    private LocalDateTime approvedDate;
    private Boolean requestChanges;
    private Integer lastReviewedByUserId;
    private String  lastReviewedByUserName;
    private LocalDateTime lastReviewedDate;
    private LocalDateTime resubmittedDate;

    // ── Phase 4: Progress ─────────────────────────────────────────────────────
    private String progressNotes;

    // ── Phase 5: Evidence Submission ──────────────────────────────────────────
    private String evidenceLink;
    private String evidenceLinkDescription;
    private String evidenceAccessInstructions;
    private String completionNotes;
    private LocalDateTime completionSubmittedDate;

    // ── Phase 6: Evidence Verification ───────────────────────────────────────
    private EvidenceVerificationStatus evidenceLinkVerificationStatus;
    private String evidenceLinkVerificationNotes;
    private Integer evidenceLinkVerifiedByUserId;
    private String  evidenceLinkVerifiedByUserName;
    private LocalDateTime evidenceLinkVerifiedDate;

    // ── Phase 7: Final Completion Approval ────────────────────────────────────
    private CompletionApprovalStatus completionApprovalStatus;
    private Integer completionApprovedByUserId;
    private String  completionApprovedByUserName;
    private LocalDateTime completionApprovedDate;
    private LocalDateTime finalCompletionDate;
    private String managerCompletionComments;

    // ── Audit ─────────────────────────────────────────────────────────────────
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
}
