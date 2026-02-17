package com.project.coreservice.service;

import com.project.coreservice.client.AuthUserClient;
import com.project.coreservice.dto.*;
import com.project.coreservice.entity.Feedback;
import com.project.coreservice.entity.Goal;
import com.project.coreservice.entity.PerformanceReview;
import com.project.coreservice.exception.ResourceNotFoundException;
import com.project.coreservice.repository.FeedbackRepository;
import com.project.coreservice.repository.GoalRepository;
import com.project.coreservice.repository.PerformanceReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository fbRepo;
    private final GoalRepository goalRepo;
    private final PerformanceReviewRepository reviewRepo;
    private final AuthUserClient authUserClient; // CHANGED: Replaces UserRepository
    private final ModelMapper modelMapper;

    /**
     * Retrieves a list of feedback records filtered by Goal ID or Review ID
     */
    /**
     * Retrieves a list of feedback records filtered by Goal ID or Review ID
     */
    public List<FeedbackResponseDTO> getFilteredFeedback(Integer goalId, Integer reviewId) {
        List<Feedback> feedbackList;
        if (goalId != null) feedbackList = fbRepo.findByGoal_GoalId(goalId);
        else if (reviewId != null) feedbackList = fbRepo.findByReview_ReviewId(reviewId);
        else feedbackList = fbRepo.findAll();

        return feedbackList.stream()
                .map(fb -> {
                    FeedbackResponseDTO dto = modelMapper.map(fb, FeedbackResponseDTO.class);

                    // Fetch giver name from AuthUserClient
                    if (fb.getGivenByUserId() != null) {
                        try {
                            ApiResponse<UserSummaryDTO> userResponse = authUserClient.getUserById(fb.getGivenByUserId());
                            if (userResponse != null && userResponse.getData() != null) {
                                dto.setGiverName(userResponse.getData().getName());
                            }
                        } catch (Exception e) {
                            log.warn("Failed to fetch user name for userId: {}", fb.getGivenByUserId());
                        }
                    }

                    return dto;
                })
                .toList();
    }


    /**
     * Persists a new feedback entry
     */
    /**
     * Persists a new feedback entry
     */
    @Transactional
    public FeedbackResponseDTO saveFeedback(Integer userId, FeedbackRequest request) {
        // CHANGED: Get user info from AuthUserClient instead of UserRepository
        ApiResponse<UserSummaryDTO> userResponse = authUserClient.getUserById(userId);
        if (userResponse == null || userResponse.getData() == null) {
            throw new ResourceNotFoundException("User not found");
        }
        UserSummaryDTO user = userResponse.getData();

        // Map request to entity
        Feedback fb = modelMapper.map(request, Feedback.class);
        fb.setGivenByUserId(userId); // CHANGED: Store userId instead of User entity
        fb.setDate(LocalDateTime.now());

        if (request.getGoalId() != null) {
            Goal goal = goalRepo.findById(request.getGoalId())
                    .orElseThrow(() -> new ResourceNotFoundException("Goal not found with ID " + request.getGoalId()));
            fb.setGoal(goal);
        }
        if (request.getReviewId() != null) {
            PerformanceReview review = reviewRepo.findById(request.getReviewId())
                    .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID " + request.getReviewId()));
            fb.setReview(review);
        }

        // Save the feedback entity
        Feedback savedFb = fbRepo.save(fb);

        // CHANGED: Log audit via AuthUserClient instead of AuditLogService
        createAuditLog(userId, "FEEDBACK_CREATED",
                "Created feedback for " + (request.getGoalId() != null ? "Goal ID: " + request.getGoalId() : "Review ID: " + request.getReviewId()),
                "Feedback", savedFb.getFeedbackId());

        // Map to response DTO and populate giver name
        FeedbackResponseDTO responseDTO = modelMapper.map(savedFb, FeedbackResponseDTO.class);
        responseDTO.setGiverName(user.getName());

        return responseDTO;
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
