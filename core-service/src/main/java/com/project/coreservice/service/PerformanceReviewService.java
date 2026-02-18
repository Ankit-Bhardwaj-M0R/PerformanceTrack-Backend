package com.project.coreservice.service;

import com.project.coreservice.client.AuthUserClient;
import com.project.coreservice.dto.*;
import com.project.coreservice.entity.PerformanceReview;
import com.project.coreservice.entity.ReviewCycle;
import com.project.coreservice.enums.PerformanceReviewStatus;
import com.project.coreservice.exception.BadRequestException;
import com.project.coreservice.exception.ResourceNotFoundException;
import com.project.coreservice.exception.UnauthorizedException;
import com.project.coreservice.repository.PerformanceReviewRepository;
import com.project.coreservice.repository.ReviewCycleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PerformanceReviewService {

    private final PerformanceReviewRepository reviewRepo;
    private final ReviewCycleRepository cycleRepo;
    private final AuthUserClient authUserClient;

    // Get all reviews
    public List<PerformanceReview> getAllReviews() {
        return reviewRepo.findAll();
    }

    // Get review by ID
    public PerformanceReview getReviewById(Integer reviewId) {
        return reviewRepo.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Performance Review not found"));
    }

    // Get reviews by user
    public List<PerformanceReview> getReviewsByUser(Integer userId) {
        return reviewRepo.findByUserId(userId);
    }

    // Get reviews by cycle
    public List<PerformanceReview> getReviewsByCycle(Integer cycleId) {
        return reviewRepo.findByCycle_CycleId(cycleId);
    }

    // Create performance review for a user in a cycle
    @Transactional
    public PerformanceReview createReview(Integer userId, Integer cycleId, Integer createdByUserId) {
        // Validate user exists
        ApiResponse<UserSummaryDTO> userResponse = authUserClient.getUserById(userId);
        if (userResponse == null || userResponse.getData() == null) {
            throw new ResourceNotFoundException("User not found");
        }

        // Validate creator exists
        ApiResponse<UserSummaryDTO> creatorResponse = authUserClient.getUserById(createdByUserId);
        if (creatorResponse == null || creatorResponse.getData() == null) {
            throw new ResourceNotFoundException("Creator user not found");
        }

        // Get cycle
        ReviewCycle cycle = cycleRepo.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Review Cycle not found"));

        // Check if review already exists for this user and cycle
        reviewRepo.findByCycle_CycleIdAndUserId(cycleId, userId).ifPresent(existing -> {
            throw new BadRequestException("Performance review already exists for this user in this cycle");
        });

        // Create review
        PerformanceReview review = new PerformanceReview();
        review.setUserId(userId);
        review.setCycle(cycle);
        review.setStatus(PerformanceReviewStatus.PENDING);
        review.setReviewedByUserId(createdByUserId);

        // Save review
        PerformanceReview saved = reviewRepo.save(review);

        // Create audit log
        createAuditLog(createdByUserId, "PERFORMANCE_REVIEW_CREATED",
                "Created performance review for user ID: " + userId + " in cycle ID: " + cycleId,
                "PerformanceReview", saved.getReviewId());

        return saved;
    }

    // Employee submits self-assessment
    @Transactional
    public PerformanceReview submitSelfAssessment(Integer reviewId, SelfAssessmentRequest req, Integer userId) {
        PerformanceReview review = getReviewById(reviewId);

        // Verify user owns this review
        if (!review.getUserId().equals(userId)) {
            throw new BadRequestException("You can only submit self-assessment for your own review");
        }

        // Check current status
        if (review.getStatus() != PerformanceReviewStatus.PENDING) {
            throw new BadRequestException("Review is not in PENDING status");
        }

        // Update self-assessment fields
        review.setSelfAssessment(req.getSelfAssmt());
        review.setEmployeeSelfRating(req.getSelfRating());
        review.setStatus(PerformanceReviewStatus.SELF_ASSESSMENT_COMPLETED);
        review.setSubmittedDate(LocalDateTime.now());

        // Save review
        PerformanceReview updated = reviewRepo.save(review);

        // Create audit log
        createAuditLog(userId, "SELF_ASSESSMENT_SUBMITTED",
                "Submitted self-assessment for review ID: " + reviewId,
                "PerformanceReview", reviewId);

        return updated;
    }

    // Manager submits manager review/feedback
    @Transactional
    public PerformanceReview submitManagerReview(Integer reviewId, ManagerReviewRequest req, Integer managerId) {
        PerformanceReview review = getReviewById(reviewId);

        // Verify manager is authorized (check if they are the user's manager)
        ApiResponse<UserSummaryDTO> userResponse = authUserClient.getUserById(review.getUserId());
        if (userResponse == null || userResponse.getData() == null) {
            throw new ResourceNotFoundException("Review user not found");
        }

        UserSummaryDTO user = userResponse.getData();
        if (user.getManagerId() == null || !user.getManagerId().equals(managerId)) {
            throw new BadRequestException("You can only submit manager review for your direct reports");
        }

        // Check current status - should be after self-assessment
        if (review.getStatus() != PerformanceReviewStatus.SELF_ASSESSMENT_COMPLETED) {
            throw new BadRequestException("Self-assessment must be completed before manager review");
        }

        // Update manager review fields
        review.setManagerFeedback(req.getMgrFb());
        review.setManagerRating(req.getMgrRating());
        review.setRatingJustification(req.getRatingJust());
        review.setCompensationRecommendations(req.getCompRec());
        review.setNextPeriodGoals(req.getNextGoals());
        review.setStatus(PerformanceReviewStatus.MANAGER_REVIEW_COMPLETED);
        review.setReviewedByUserId(managerId);
        review.setReviewCompletedDate(LocalDateTime.now());

        // Save review
        PerformanceReview updated = reviewRepo.save(review);

        // Create audit log
        createAuditLog(managerId, "MANAGER_REVIEW_SUBMITTED",
                "Submitted manager review for review ID: " + reviewId,
                "PerformanceReview", reviewId);

        return updated;
    }

    // Employee acknowledges completed review
    @Transactional
    public PerformanceReview acknowledgeReview(Integer reviewId, Integer userId, String employeeResponse) {
        PerformanceReview review = getReviewById(reviewId);

        // Verify user owns this review
        if (!review.getUserId().equals(userId)) {
            throw new BadRequestException("You can only acknowledge your own review");
        }

        // Check status - should be manager review completed
        if (review.getStatus() != PerformanceReviewStatus.MANAGER_REVIEW_COMPLETED &&
                review.getStatus() != PerformanceReviewStatus.COMPLETED) {
            throw new BadRequestException("Review must be completed before acknowledgment");
        }

        // Update acknowledgment fields
        review.setAcknowledgedByUserId(userId);
        review.setAcknowledgedDate(LocalDateTime.now());
        review.setEmployeeResponse(employeeResponse);
        review.setStatus(PerformanceReviewStatus.COMPLETED_AND_ACKNOWLEDGED);

        // Save review
        PerformanceReview updated = reviewRepo.save(review);

        // Create audit log
        createAuditLog(userId, "REVIEW_ACKNOWLEDGED",
                "Acknowledged review ID: " + reviewId,
                "PerformanceReview", reviewId);

        return updated;
    }

    // Update review status (Admin)
    @Transactional
    public PerformanceReview updateReviewStatus(Integer reviewId, PerformanceReviewStatus newStatus, Integer adminId) {
        PerformanceReview review = getReviewById(reviewId);
        PerformanceReviewStatus oldStatus = review.getStatus();
        review.setStatus(newStatus);

        if (newStatus == PerformanceReviewStatus.COMPLETED && review.getReviewCompletedDate() == null) {
            review.setReviewCompletedDate(LocalDateTime.now());
        }

        // Save review
        PerformanceReview updated = reviewRepo.save(review);

        // Create audit log
        createAuditLog(adminId, "REVIEW_STATUS_UPDATED",
                "Changed review status from " + oldStatus + " to " + newStatus + " for review ID: " + reviewId,
                "PerformanceReview", reviewId);

        return updated;
    }

    // Delete review (Admin only)
    @Transactional
    public void deleteReview(Integer reviewId, Integer adminId) {
        PerformanceReview review = getReviewById(reviewId);
        reviewRepo.delete(review);

        // Create audit log
        createAuditLog(adminId, "PERFORMANCE_REVIEW_DELETED",
                "Deleted performance review ID: " + reviewId,
                "PerformanceReview", reviewId);
    }

    // Helper method to create audit logs via AuthUserClient
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


    @Transactional
    public PerformanceReview updateSelfAssessmentDraft(Integer reviewId, SelfAssessmentRequest req, Integer empId){
        PerformanceReview review = getReviewById(reviewId);

        //check authorization
        ApiResponse<UserSummaryDTO> userResponse = authUserClient.getUserById(review.getUserId());
        if (userResponse == null || userResponse.getData() == null) {
            throw new ResourceNotFoundException("Review user not found");
        }

        UserSummaryDTO user = userResponse.getData();
        if (user.getManagerId() == null || !user.getUserId().equals(empId)) {
            throw new BadRequestException("You can only submit manager review for your direct reports");
        }

        // Can only update if still in pending or self-assessment status
        if (review.getStatus() != PerformanceReviewStatus.PENDING &&
                review.getStatus() != PerformanceReviewStatus.SELF_ASSESSMENT_COMPLETED) {
            throw new BadRequestException("Cannot update - review already completed");
        }

        //update self assessment
        review.setSelfAssessment((req.getSelfAssmt()));
        review.setEmployeeSelfRating(req.getSelfRating());

        //save without changing status
        PerformanceReview updated = reviewRepo.save(review);

        //auditLog
        createAuditLog(empId, "SELF_ASSESSMENT_DRAFT_UPDATED",
                "Updated self-assessment draft", "PerformanceReview", reviewId);


        return updated;
    }



}
