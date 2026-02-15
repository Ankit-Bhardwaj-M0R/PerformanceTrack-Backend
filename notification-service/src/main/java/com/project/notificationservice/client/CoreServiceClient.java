package com.project.notificationservice.client;

import com.project.notificationservice.dto.ApiResponse;
import com.project.notificationservice.dto.GoalSummaryDTO;
import com.project.notificationservice.dto.ReviewCycleSummaryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "core-service")
public interface CoreServiceClient {

    @GetMapping("/internal/goals/pending-approval")
    ApiResponse<List<GoalSummaryDTO>> getGoalsPendingApproval(@RequestParam("pendingDays") int days);

    @GetMapping("/internal/review-cycles/active")
    ApiResponse<ReviewCycleSummaryDTO> getActiveReviewCycle();
}
