// ORIGINAL (Monolith):
// package com.project.performanceTrack.service;
// private final UserRepository userRepo;
// private final AuditLogRepository auditRepo;
// User user = userRepo.findById(userId).orElseThrow(...);
// report.setGeneratedBy(user);
// List<Goal> myGoals = goalRepo.findByAssignedToUser_UserId(userId);
// List<User> teamMembers = userRepo.findByManager_UserId(userId);

// MODIFIED FOR CORE SERVICE:
package com.project.coreservice.service;

import com.project.coreservice.client.AuthUserClient;
import com.project.coreservice.dto.AuditLogRequest;
import com.project.coreservice.dto.ApiResponse;
import com.project.coreservice.dto.UserSummaryDTO;
import com.project.coreservice.entity.Goal;
import com.project.coreservice.entity.PerformanceReview;
import com.project.coreservice.entity.Report;
import com.project.coreservice.enums.GoalStatus;
import com.project.coreservice.exception.ResourceNotFoundException;
import com.project.coreservice.repository.GoalRepository;
import com.project.coreservice.repository.PerformanceReviewRepository;
import com.project.coreservice.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepo;
    private final GoalRepository goalRepo;
    private final PerformanceReviewRepository reviewRepo;
    private final AuthUserClient authUserClient; // CHANGED: Replaces UserRepository and AuditLogRepository

    // Get all reports
    public List<Report> getAllReports() {
        return reportRepo.findAll();
    }

    // Get report by ID
    public Report getReportById(Integer reportId) {
        return reportRepo.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
    }

    // Get reports by user - CHANGED: Updated repository method name
    public List<Report> getReportsByUser(Integer userId) {
        return reportRepo.findByGeneratedByUserIdOrderByGeneratedDateDesc(userId);
    }

    // Generate report (Admin/Manager)
    public Report generateReport(String scope, String metrics, String format, Integer userId) {
        // CHANGED: Validate user exists via AuthUserClient
        ApiResponse<UserSummaryDTO> userResponse = authUserClient.getUserById(userId);
        if (userResponse == null || userResponse.getData() == null) {
            throw new ResourceNotFoundException("User not found");
        }

        // Create report - CHANGED: Store userId instead of User entity
        Report report = new Report();
        report.setScope(scope);
        report.setMetrics(metrics);
        report.setFormat(format);
        report.setGeneratedByUserId(userId); // CHANGED: Use Integer userId field
        report.setGeneratedDate(LocalDateTime.now());
        report.setFilePath("/reports/" + System.currentTimeMillis() + "." + format.toLowerCase());

        // Save report
        Report saved = reportRepo.save(report);

        // CHANGED: Create audit log via AuthUserClient
        createAuditLog(userId, "REPORT_GENERATED",
                "Generated " + scope + " report in " + format + " format",
                "Report", saved.getReportId());

        return saved;
    }

    // Get dashboard metrics
    public Map<String, Object> getDashboardMetrics(Integer userId, String role) {
        Map<String, Object> metrics = new HashMap<>();

        if (role.equals("EMPLOYEE")) {
            // Employee dashboard metrics - CHANGED: Updated repository method
            List<Goal> myGoals = goalRepo.findByAssignedToUserId(userId);
            long completedGoals = myGoals.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();
            long inProgressGoals = myGoals.stream().filter(g -> g.getStatus() == GoalStatus.IN_PROGRESS).count();
            long pendingGoals = myGoals.stream().filter(g -> g.getStatus() == GoalStatus.PENDING).count();

            metrics.put("totalGoals", myGoals.size());
            metrics.put("completedGoals", completedGoals);
            metrics.put("inProgressGoals", inProgressGoals);
            metrics.put("pendingGoals", pendingGoals);
            metrics.put("completionRate", myGoals.size() > 0 ? (completedGoals * 100.0 / myGoals.size()) : 0);

        } else if (role.equals("MANAGER")) {
            // Manager dashboard metrics - CHANGED: Updated repository method
            List<Goal> teamGoals = goalRepo.findByAssignedManagerId(userId);

            // CHANGED: Get team members via AuthUserClient
            ApiResponse<List<UserSummaryDTO>> teamResponse = authUserClient.getTeamByManager(userId);
            int teamSize = (teamResponse != null && teamResponse.getData() != null) ? teamResponse.getData().size() : 0;

            metrics.put("teamSize", teamSize);
            metrics.put("totalTeamGoals", teamGoals.size());
            metrics.put("pendingApprovals", teamGoals.stream().filter(g -> g.getStatus() == GoalStatus.PENDING).count());
            metrics.put("pendingCompletions", teamGoals.stream().filter(g -> g.getStatus() == GoalStatus.AWAITING_COMPLETION_APPROVAL).count());

        } else {
            // Admin dashboard metrics - CHANGED: Cannot get all users from AuthUserClient directly
            // Only report on goals and reviews in core_db
            List<Goal> allGoals = goalRepo.findAll();
            List<PerformanceReview> allReviews = reviewRepo.findAll();

            metrics.put("totalUsers", "N/A"); // Would require separate call to auth-user-service
            metrics.put("totalGoals", allGoals.size());
            metrics.put("totalReviews", allReviews.size());
            metrics.put("completedGoals", allGoals.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count());
        }

        return metrics;
    }

    // Get performance summary
    public Map<String, Object> getPerformanceSummary(Integer cycleId, String dept) {
        Map<String, Object> summary = new HashMap<>();

        List<PerformanceReview> reviews;
        if (cycleId != null) {
            reviews = reviewRepo.findByCycle_CycleId(cycleId);
        } else {
            reviews = reviewRepo.findAll();
        }

        // Filter by department if provided - CHANGED: Department filtering requires user data
        // This would require fetching user details for each review from AuthUserClient
        // For now, skip department filtering or implement lazy loading
        if (dept != null && !dept.isEmpty()) {
            log.warn("Department filtering requires cross-service calls - not implemented in this version");
        }

        // Calculate metrics
        long totalReviews = reviews.size();
        double avgSelfRating = reviews.stream()
                .filter(r -> r.getEmployeeSelfRating() != null)
                .mapToInt(PerformanceReview::getEmployeeSelfRating)
                .average()
                .orElse(0.0);

        double avgManagerRating = reviews.stream()
                .filter(r -> r.getManagerRating() != null)
                .mapToInt(PerformanceReview::getManagerRating)
                .average()
                .orElse(0.0);

        summary.put("totalReviews", totalReviews);
        summary.put("avgSelfRating", avgSelfRating);
        summary.put("avgManagerRating", avgManagerRating);
        summary.put("cycleId", cycleId);
        summary.put("department", dept);

        return summary;
    }

    // Get goal analytics
    public Map<String, Object> getGoalAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        List<Goal> allGoals = goalRepo.findAll();

        // Status breakdown
        long pending = allGoals.stream().filter(g -> g.getStatus() == GoalStatus.PENDING).count();
        long inProgress = allGoals.stream().filter(g -> g.getStatus() == GoalStatus.IN_PROGRESS).count();
        long pendingCompletion = allGoals.stream().filter(g -> g.getStatus() == GoalStatus.AWAITING_COMPLETION_APPROVAL).count();
        long completed = allGoals.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();
        long rejected = allGoals.stream().filter(g -> g.getStatus() == GoalStatus.REJECTED).count();

        analytics.put("totalGoals", allGoals.size());
        analytics.put("pending", pending);
        analytics.put("inProgress", inProgress);
        analytics.put("pendingCompletion", pendingCompletion);
        analytics.put("completed", completed);
        analytics.put("rejected", rejected);
        analytics.put("completionRate", allGoals.size() > 0 ? (completed * 100.0 / allGoals.size()) : 0);

        return analytics;
    }

    // Get department performance - CHANGED: Requires cross-service calls
    public List<Map<String, Object>> getDepartmentPerformance() {
        List<Map<String, Object>> performance = new ArrayList<>();

        // CHANGED: This method requires significant refactoring as it needs:
        // 1. List of all users with departments (from auth-user-service)
        // 2. Goals for each user
        // This would require multiple Feign calls and may be performance-intensive

        log.warn("getDepartmentPerformance requires cross-service calls - returning empty list");
        // TODO: Implement with batch user fetching from AuthUserClient if needed

        return performance;
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
