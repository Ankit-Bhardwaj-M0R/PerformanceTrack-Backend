package com.project.performanceTrack.dto;

import com.project.performanceTrack.enums.PerformanceReviewStatus;
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
public class PerformanceReviewResponseDTO {
    
    // ── Review Identity ───────────────────────────────────────────────────────
    private Integer reviewId;
    
    // ── Review Cycle Info (flattened) ─────────────────────────────────────────
    private Integer cycleId;
    private String cycleTitle;
    private LocalDate cycleStartDate;
    private LocalDate cycleEndDate;
    
    // ── Employee Info (flattened) ─────────────────────────────────────────────
    private Integer userId;
    private String userName;
    private String userEmail;
    private String userDepartment;
    
    // ── Manager Info (flattened) ──────────────────────────────────────────────
    private Integer managerId;
    private String managerName;
    private String managerEmail;
    
    // ── Self-Assessment Content ───────────────────────────────────────────────
    private String selfAssessment;
    private Integer employeeSelfRating;
    
    // ── Manager Review Content ────────────────────────────────────────────────
    private String managerFeedback;
    private Integer managerRating;
    private String ratingJustification;
    private String compensationRecommendations;
    private String nextPeriodGoals;
    
    // ── Reviewer Info (flattened) ─────────────────────────────────────────────
    private Integer reviewedByUserId;
    private String reviewedByUserName;
    private LocalDateTime reviewCompletedDate;
    
    // ── Employee Acknowledgment ───────────────────────────────────────────────
    private Integer acknowledgedByUserId;
    private String acknowledgedByUserName;
    private LocalDateTime acknowledgedDate;
    private String employeeResponse;
    
    // ── Metadata ──────────────────────────────────────────────────────────────
    private PerformanceReviewStatus status;
    private LocalDateTime submittedDate;
    private Integer timeSpentMinutes;
    private LocalDateTime createdDate;
    private LocalDateTime lastModifiedDate;
}
