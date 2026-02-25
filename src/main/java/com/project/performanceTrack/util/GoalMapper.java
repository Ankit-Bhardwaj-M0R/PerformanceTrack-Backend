package com.project.performanceTrack.util;

import com.project.performanceTrack.dto.GoalResponseDTO;
import com.project.performanceTrack.entity.Goal;
import com.project.performanceTrack.entity.User;

public class GoalMapper {

    private GoalMapper() {}   // utility class — no instantiation

    /**
     * Maps a Goal entity to a flat GoalResponseDTO.
     * Nested User relationships are flattened to userId / name / email fields
     * so the frontend never receives raw entity graphs.
     */
    public static GoalResponseDTO toDTO(Goal g) {
        if (g == null) return null;

        return GoalResponseDTO.builder()
                // Identity
                .goalId(g.getGoalId())

                // Goal definition
                .title(g.getTitle())
                .description(g.getDescription())
                .category(g.getCategory())
                .priority(g.getPriority())
                .startDate(g.getStartDate())
                .endDate(g.getEndDate())
                .status(g.getStatus())

                // Assigned employee (flat)
                .assignedToUserId(userId(g.getAssignedToUser()))
                .assignedToUserName(userName(g.getAssignedToUser()))
                .assignedToUserEmail(userEmail(g.getAssignedToUser()))

                // Assigned manager (flat)
                .assignedManagerId(userId(g.getAssignedManager()))
                .assignedManagerName(userName(g.getAssignedManager()))
                .assignedManagerEmail(userEmail(g.getAssignedManager()))

                // Phase 3 — Initial approval
                .approvedByUserId(userId(g.getApprovedBy()))
                .approvedByUserName(userName(g.getApprovedBy()))
                .approvedDate(g.getApprovedDate())
                .requestChanges(g.getRequestChanges())
                .lastReviewedByUserId(userId(g.getLastReviewedBy()))
                .lastReviewedByUserName(userName(g.getLastReviewedBy()))
                .lastReviewedDate(g.getLastReviewedDate())
                .resubmittedDate(g.getResubmittedDate())

                // Phase 4 — Progress
                .progressNotes(g.getProgressNotes())

                // Phase 5 — Evidence submission
                .evidenceLink(g.getEvidenceLink())
                .evidenceLinkDescription(g.getEvidenceLinkDescription())
                .evidenceAccessInstructions(g.getEvidenceAccessInstructions())
                .completionNotes(g.getCompletionNotes())
                .completionSubmittedDate(g.getCompletionSubmittedDate())

                // Phase 6 — Evidence verification
                .evidenceLinkVerificationStatus(g.getEvidenceLinkVerificationStatus())
                .evidenceLinkVerificationNotes(g.getEvidenceLinkVerificationNotes())
                .evidenceLinkVerifiedByUserId(userId(g.getEvidenceLinkVerifiedBy()))
                .evidenceLinkVerifiedByUserName(userName(g.getEvidenceLinkVerifiedBy()))
                .evidenceLinkVerifiedDate(g.getEvidenceLinkVerifiedDate())

                // Phase 7 — Final completion approval
                .completionApprovalStatus(g.getCompletionApprovalStatus())
                .completionApprovedByUserId(userId(g.getCompletionApprovedBy()))
                .completionApprovedByUserName(userName(g.getCompletionApprovedBy()))
                .completionApprovedDate(g.getCompletionApprovedDate())
                .finalCompletionDate(g.getFinalCompletionDate())
                .managerCompletionComments(g.getManagerCompletionComments())

                // Audit
                .createdDate(g.getCreatedDate())
                .lastModifiedDate(g.getLastModifiedDate())

                .build();
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private static Integer userId(User u) {
        return u != null ? u.getUserId() : null;
    }

    private static String userName(User u) {
        return u != null ? u.getName() : null;
    }

    private static String userEmail(User u) {
        return u != null ? u.getEmail() : null;
    }
}
