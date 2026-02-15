// ORIGINAL (Monolith):
// package com.project.performanceTrack.service;
// private final UserRepository userRepo;
// private final AuditLogService auditLogService;
// User emp = userRepo.findById(empId).orElseThrow(...);
// User mgr = userRepo.findById(mgrId).orElseThrow(...);
// review.setEmployee(emp);
// review.setManager(mgr);

// MODIFIED FOR CORE SERVICE:
package com.project.coreservice.service;

import com.project.coreservice.client.AuthUserClient;
import com.project.coreservice.dto.*;
import com.project.coreservice.entity.PerformanceReview;
import com.project.coreservice.entity.ReviewCycle;
import com.project.coreservice.enums.ReviewStatus;
import com.project.coreservice.exception.BadRequestException;
import com.project.coreservice.exception.ResourceNotFoundException;
import com.project.coreservice.repository.PerformanceReviewRepository;
import com.project.coreservice.repository.ReviewCycleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PerformanceReviewService {

    private final PerformanceReviewRepository reviewRepo;
    private final ReviewCycleRepository cycleRepo;
    private final AuthUserClient authUserClient; // CHANGED: Replaces UserRepository
    private final ModelMapper modelMapper;

    // Get all reviews
    public List<PerformanceReview> getAllReviews() {
        return reviewRepo.findAll();
    }

    // Get review by ID
    public PerformanceReview getReviewById(Integer reviewId) {
        return reviewRepo.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Performance Review not found"));
    }

    // Get reviews by employee - CHANGED: Updated repository method
    public List<PerformanceReview> getReviewsByEmployee(Integer employeeId) {
        return reviewRepo.findByEmployeeId(employeeId);
    }

    // Get reviews by manager - CHANGED: Updated repository method
    public List<PerformanceReview> getReviewsByManager(Integer managerId) {
        return reviewRepo.findByManagerId(managerId);
    }

    // Get reviews by cycle
    public List<PerformanceReview> getReviewsByCycle(Integer cycleId) {
        return reviewRepo.findByCycle_CycleId(cycleId);
    }

    // Create performance review (Manager/Admin)
    @Transactional
    public PerformanceReview createReview(CreatePerformanceReviewRequest req, Integer managerId) {
        // CHANGED: Validate employee and manager via AuthUserClient
        ApiResponse<UserSummaryDTO> empResponse = authUserClient.getUserById(req.getEmployeeId());
        if (empResponse == null || empResponse.getData() == null) {
            throw new ResourceNotFoundException("Employee not found");
        }

        ApiResponse<UserSummaryDTO> mgrResponse = authUserClient.getUserById(managerId);
        if (mgrResponse == null || mgrResponse.getData() == null) {
            throw new ResourceNotFoundException("Manager not found");
        }

        // CHANGED: Verify manager relationship
        UserSummaryDTO employee = empResponse.getData();
        if (employee.getManagerId() == null || !employee.getManagerId().equals(managerId)) {
            throw new BadRequestException("You can only create reviews for your direct reports");
        }

        // Get cycle
        ReviewCycle cycle = cycleRepo.findById(req.getCycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Review Cycle not found"));

        // Create review - CHANGED: Store IDs instead of User entities
        PerformanceReview review = new PerformanceReview();
        review.setEmployeeId(req.getEmployeeId()); // CHANGED: Use Integer field
        review.setManagerId(managerId); // CHANGED: Use Integer field
        review.setCycle(cycle);
        review.setReviewPeriodStart(req.getReviewPeriodStart());
        review.setReviewPeriodEnd(req.getReviewPeriodEnd());
        review.setStatus(ReviewStatus.PENDING_SELF_REVIEW);
        review.setCreatedDate(LocalDate.now());

        // Save review
        PerformanceReview saved = reviewRepo.save(review);

        // CHANGED: Create audit log via AuthUserClient
        createAuditLog(managerId, "PERFORMANCE_REVIEW_CREATED",
                "Created performance review for employee ID: " + req.getEmployeeId(),
                "PerformanceReview", saved.getReviewId());

        return saved;
    }

    // Employee submits self-review
    @Transactional
    public PerformanceReview submitSelfReview(Integer reviewId, SelfReviewRequest req, Integer employeeId) {
        PerformanceReview review = getReviewById(reviewId);

        // CHANGED: Verify employee owns this review
        if (!review.getEmployeeId().equals(employeeId)) {
            throw new BadRequestException("You can only submit self-review for your own review");
        }

        if (review.getStatus() != ReviewStatus.PENDING_SELF_REVIEW) {
            throw new BadRequestException("Review is not in PENDING_SELF_REVIEW status");
        }

        // Update self-review fields
        review.setEmployeeSelfRating(req.getSelfRating());
        review.setEmployeeComments(req.getSelfComments());
        review.setStatus(ReviewStatus.PENDING_MANAGER_REVIEW);

        // Save review
        PerformanceReview updated = reviewRepo.save(review);

        // CHANGED: Create audit log via AuthUserClient
        createAuditLog(employeeId, "SELF_REVIEW_SUBMITTED",
                "Submitted self-review for review ID: " + reviewId,
                "PerformanceReview", reviewId);

        return updated;
    }

    // Manager submits manager review
    @Transactional
    public PerformanceReview submitManagerReview(Integer reviewId, ManagerReviewRequest req, Integer managerId) {
        PerformanceReview review = getReviewById(reviewId);

        // CHANGED: Verify manager owns this review
        if (!review.getManagerId().equals(managerId)) {
            throw new BadRequestException("You can only submit manager review for your team members");
        }

        if (review.getStatus() != ReviewStatus.PENDING_MANAGER_REVIEW) {
            throw new BadRequestException("Review is not in PENDING_MANAGER_REVIEW status");
        }

        // Update manager review fields
        review.setManagerRating(req.getManagerRating());
        review.setManagerComments(req.getManagerComments());
        review.setStatus(ReviewStatus.COMPLETED);
        review.setCompletedDate(LocalDate.now());

        // Save review
        PerformanceReview updated = reviewRepo.save(review);

        // CHANGED: Create audit log via AuthUserClient
        createAuditLog(managerId, "MANAGER_REVIEW_SUBMITTED",
                "Submitted manager review for review ID: " + reviewId,
                "PerformanceReview", reviewId);

        return updated;
    }

    // Update review status (Admin)
    @Transactional
    public PerformanceReview updateReviewStatus(Integer reviewId, ReviewStatus newStatus, Integer adminId) {
        PerformanceReview review = getReviewById(reviewId);
        ReviewStatus oldStatus = review.getStatus();
        review.setStatus(newStatus);

        if (newStatus == ReviewStatus.COMPLETED && review.getCompletedDate() == null) {
            review.setCompletedDate(LocalDate.now());
        }

        // Save review
        PerformanceReview updated = reviewRepo.save(review);

        // CHANGED: Create audit log via AuthUserClient
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

        // CHANGED: Create audit log via AuthUserClient
        createAuditLog(adminId, "PERFORMANCE_REVIEW_DELETED",
                "Deleted performance review ID: " + reviewId,
                "PerformanceReview", reviewId);
    }

    // CHANGED: Helper method to create audit logs via AuthUserClient
    private void createAuditLog(Integer userId, String action, String details, String entityType, Integer entityId) {
        try {
            AuditLogRequest auditReq = new AuditLogRequest(
                    userId, action, details, entityType, entityId, "SUCCESS", null
            );
            authUserClient.createAuditLog(auditReq);
        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage());
        }
    }
}
