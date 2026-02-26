package com.project.performanceTrack.util;

import com.project.performanceTrack.dto.PerformanceReviewResponseDTO;
import com.project.performanceTrack.entity.PerformanceReview;
import com.project.performanceTrack.entity.ReviewCycle;
import com.project.performanceTrack.entity.User;

public class PerformanceReviewMapper {

    private PerformanceReviewMapper() {}  // utility class — no instantiation

    /**
     * Maps a PerformanceReview entity to a flat PerformanceReviewResponseDTO.
     * Nested User and ReviewCycle relationships are flattened to simple fields
     * so the frontend never receives raw entity graphs.
     */
    public static PerformanceReviewResponseDTO toDTO(PerformanceReview r) {
        if (r == null) return null;

        User employee = r.getUser();
        User manager = (employee != null) ? employee.getManager() : null;
        ReviewCycle cycle = r.getCycle();
        User reviewedBy = r.getReviewedBy();
        User acknowledgedBy = r.getAcknowledgedBy();

        return PerformanceReviewResponseDTO.builder()
                // Review identity
                .reviewId(r.getReviewId())
                
                // Review cycle (flattened)
                .cycleId(cycle != null ? cycle.getCycleId() : null)
                .cycleTitle(cycle != null ? cycle.getTitle() : null)
                .cycleStartDate(cycle != null ? cycle.getStartDate() : null)
                .cycleEndDate(cycle != null ? cycle.getEndDate() : null)
                
                // Employee (flattened)
                .userId(employee != null ? employee.getUserId() : null)
                .userName(employee != null ? employee.getName() : null)
                .userEmail(employee != null ? employee.getEmail() : null)
                .userDepartment(employee != null ? employee.getDepartment() : null)
                
                // Manager (flattened)
                .managerId(manager != null ? manager.getUserId() : null)
                .managerName(manager != null ? manager.getName() : null)
                .managerEmail(manager != null ? manager.getEmail() : null)
                
                // Self-assessment content
                .selfAssessment(r.getSelfAssessment())
                .employeeSelfRating(r.getEmployeeSelfRating())
                
                // Manager review content
                .managerFeedback(r.getManagerFeedback())
                .managerRating(r.getManagerRating())
                .ratingJustification(r.getRatingJustification())
                .compensationRecommendations(r.getCompensationRecommendations())
                .nextPeriodGoals(r.getNextPeriodGoals())
                
                // Reviewer (flattened)
                .reviewedByUserId(reviewedBy != null ? reviewedBy.getUserId() : null)
                .reviewedByUserName(reviewedBy != null ? reviewedBy.getName() : null)
                .reviewCompletedDate(r.getReviewCompletedDate())
                
                // Acknowledgment (flattened)
                .acknowledgedByUserId(acknowledgedBy != null ? acknowledgedBy.getUserId() : null)
                .acknowledgedByUserName(acknowledgedBy != null ? acknowledgedBy.getName() : null)
                .acknowledgedDate(r.getAcknowledgedDate())
                .employeeResponse(r.getEmployeeResponse())
                
                // Metadata
                .status(r.getStatus())
                .submittedDate(r.getSubmittedDate())
                .timeSpentMinutes(r.getTimeSpentMinutes())
                .createdDate(r.getCreatedDate())
                .lastModifiedDate(r.getLastModifiedDate())
                
                .build();
    }
}
