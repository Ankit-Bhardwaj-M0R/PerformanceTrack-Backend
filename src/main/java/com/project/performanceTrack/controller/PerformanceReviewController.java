package com.project.performanceTrack.controller;

import com.project.performanceTrack.dto.ApiResponse;
import com.project.performanceTrack.dto.ManagerReviewRequest;
import com.project.performanceTrack.dto.PerformanceReviewResponseDTO;
import com.project.performanceTrack.dto.SelfAssessmentRequest;
import com.project.performanceTrack.entity.PerformanceReview;
import com.project.performanceTrack.service.PerformanceReviewService;
import com.project.performanceTrack.util.PerformanceReviewMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/performance-reviews")
@RequiredArgsConstructor
public class PerformanceReviewController {

    private final PerformanceReviewService reviewSvc;

    //get reviews
    @GetMapping
    public ApiResponse<List<PerformanceReviewResponseDTO>> getReviews(HttpServletRequest httpReq,
                                                           @RequestParam(required = false) Integer userId,
                                                           @RequestParam(required = false) Integer cycleId) {
        String role = (String) httpReq.getAttribute("userRole");
        Integer currentUserId = (Integer) httpReq.getAttribute("userId");


        List<PerformanceReview> reviews;
        if (cycleId != null) {
            // Manager: get only their team's reviews for this cycle
            if (role.equals("MANAGER")) {
                reviews = reviewSvc.getReviewsByCycleAndManager(cycleId, currentUserId);
            } else {
                // Admin: get all reviews for this cycle
                reviews = reviewSvc.getReviewsByCycle(cycleId);
            }
        }else if(userId != null && role.equals("ADMIN")){
            reviews = reviewSvc.getReviewsByUser(userId);
        }else{
            reviews = reviewSvc.getReviewsByUser(currentUserId);
        }

        List<PerformanceReviewResponseDTO> dtos = reviews.stream()
                .map(PerformanceReviewMapper::toDTO)
                .collect(Collectors.toList());

        return ApiResponse.success("Reviews retrieved", dtos);
    }

    //get review by ID
    @GetMapping("/{reviewId}")
    public  ApiResponse<PerformanceReviewResponseDTO> getReviewById(@PathVariable Integer reviewId){
        PerformanceReview review = reviewSvc.getReviewById(reviewId);
        return ApiResponse.success("Review retrieved", PerformanceReviewMapper.toDTO(review));

    }
    // Submit self-assessment (Employee)
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ApiResponse<PerformanceReviewResponseDTO> submitSelfAssessment(@Valid @RequestBody SelfAssessmentRequest req,
                                                               HttpServletRequest httpReq) {
        Integer empId = (Integer) httpReq.getAttribute("userId");
        PerformanceReview review = reviewSvc.submitSelfAssessment(req, empId);
        return ApiResponse.success("Self-assessment submitted", PerformanceReviewMapper.toDTO(review));
    }

    // Update self-assessment draft (Employee)
    @PutMapping("/{reviewId}/draft")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ApiResponse<PerformanceReviewResponseDTO> updateDraft(@PathVariable Integer reviewId,
                                                      @Valid @RequestBody SelfAssessmentRequest req,
                                                      HttpServletRequest httpReq){
        Integer empId = (Integer) httpReq.getAttribute("userId");
        PerformanceReview review = reviewSvc.updateSelfAssessmentDraft(reviewId, req, empId);
        return ApiResponse.success("Draft updated", PerformanceReviewMapper.toDTO(review));

    }


    //submit manager review (Manager)
    @PutMapping("/{reviewId}")
    @PreAuthorize("hasRole('MANAGER')")
    public ApiResponse<PerformanceReviewResponseDTO> submitManagerReview(@PathVariable Integer reviewId,
                                                              @Valid @RequestBody ManagerReviewRequest req,
                                                              HttpServletRequest httpReq){
        Integer mgrId = (Integer) httpReq.getAttribute("userId");
        PerformanceReview review = reviewSvc.submitManagerReview(reviewId, req, mgrId);
        return ApiResponse.success("Manager review submitted", PerformanceReviewMapper.toDTO(review));
    }

    // Acknowledge review (Employee)
    @PostMapping("/{reviewId}/acknowledge")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ApiResponse<PerformanceReviewResponseDTO> acknowledgeReview(@PathVariable Integer reviewId,
                                                            @RequestBody Map<String, String> body,
                                                            HttpServletRequest httpReq) {
        Integer empId = (Integer) httpReq.getAttribute("userId");
        String response = body.get("response");
        PerformanceReview review = reviewSvc.acknowledgeReview(reviewId, empId, response);
        return ApiResponse.success("Review acknowledged", PerformanceReviewMapper.toDTO(review));
    }


}