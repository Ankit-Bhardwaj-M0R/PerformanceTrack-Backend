package com.project.notificationservice.scheduler;

import com.project.notificationservice.service.NotificationService;
import com.project.notificationservice.enums.NotificationType;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.project.notificationservice.client.AuthUserClient;
import com.project.notificationservice.client.CoreServiceClient;
import com.project.notificationservice.dto.GoalSummaryDTO;
import com.project.notificationservice.dto.UserSummaryDTO;
import com.project.notificationservice.dto.ReviewCycleSummaryDTO;
import com.project.notificationservice.dto.ApiResponse;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final AuthUserClient authUserClient;
    private final CoreServiceClient coreServiceClient;
    private final NotificationService notificationService;

    private static final Set<Long> REMINDER_DAYS = Set.of(30L, 15L, 7L, 3L);

    @Scheduled(cron = "0 0 9 * * *")
    public void sendPendingApprovalReminders() {
        log.info("Running: pending approval reminders");

        try {
            ApiResponse<List<GoalSummaryDTO>> response =
                    coreServiceClient.getGoalsPendingApproval(2);

            List<GoalSummaryDTO> staleGoals = response.getData();

            // Group by manager
            Map<Integer, Long> countsByManager = staleGoals.stream()
                    .collect(Collectors.groupingBy(
                            GoalSummaryDTO::getAssignedManagerId, Collectors.counting()));

            countsByManager.forEach((managerId, count) -> {
                try {
                    notificationService.sendNotification(
                            managerId,
                            NotificationType.REVIEW_REMINDER,
                            "You have " + count + " goal(s) pending approval for over 2 days",
                            "Goal", null, "HIGH", true);
                } catch (Exception e) {
                    log.error("Failed to send notification to manager {}: {}",
                            managerId, e.getMessage());
                }
            });

            log.info("Completed: pending approval reminders. Notified {} managers",
                    countsByManager.size());
        } catch (Exception e) {
            log.error("Failed to fetch pending goals: {}", e.getMessage());
        }
    }

    @Scheduled(cron = "0 0 10 * * *")
    public void sendReviewCycleEndingReminders() {
        log.info("Running: review cycle ending reminders");

        try {
            ApiResponse<ReviewCycleSummaryDTO> response =
                    coreServiceClient.getActiveReviewCycle();

            ReviewCycleSummaryDTO cycle = response.getData();

            if (cycle != null) {
                long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), cycle.getEndDate());

                if (REMINDER_DAYS.contains(daysLeft)) {
                    // Get all users from auth-user-service
                    // Note: You'll need to add a getAllUsers endpoint in auth-user-service
                    // For now, we can skip this or implement it differently

                    log.info("Review cycle '{}' ends in {} days", cycle.getTitle(), daysLeft);
                    // Implementation depends on how you want to get all users
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch active review cycle: {}", e.getMessage());
        }
    }



    // Task 3: Remind managers about completions waiting for approval for 3+ days
//    @Scheduled(cron = "0 0 9 * * MON") // Every Monday at 9 AM
//    public void sendPendingCompletionReminders() {
//        log.info("Running: pending completion reminders");
//
//        try {
//            ApiResponse<List<GoalSummaryDTO>> response =
//                    coreServiceClient.getGoalsPendingCompletionApproval(3);
//
//            List<GoalSummaryDTO> staleCompletions = response.getData();
//
//            // Group by manager
//            Map<Integer, Long> countsByManager = staleCompletions.stream()
//                    .collect(Collectors.groupingBy(
//                            GoalSummaryDTO::getAssignedManagerId, Collectors.counting()));
//
//            countsByManager.forEach((managerId, count) -> {
//                try {
//                    notificationService.sendNotification(
//                            managerId,
//                            NotificationType.REVIEW_REMINDER,
//                            "You have " + count + " goal(s) pending completion approval for over 3 days",
//                            "Goal", null, "HIGH", true);
//                } catch (Exception e) {
//                    log.error("Failed to send notification to manager {}: {}",
//                            managerId, e.getMessage());
//                }
//            });
//
//            log.info("Completed: pending completion reminders. Notified {} managers",
//                    countsByManager.size());
//        } catch (Exception e) {
//            log.error("Failed to fetch pending completion goals: {}", e.getMessage());
//        }
//    }



}
