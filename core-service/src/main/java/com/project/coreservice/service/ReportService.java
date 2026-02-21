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
import com.project.coreservice.enums.PerformanceReviewStatus;          // FIX: was missing
import com.project.coreservice.exception.ResourceNotFoundException;
import com.project.coreservice.repository.GoalRepository;
import com.project.coreservice.repository.PerformanceReviewRepository;
import com.project.coreservice.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepo;
    private final GoalRepository goalRepo;
    private final PerformanceReviewRepository reviewRepo;
    private final AuthUserClient authUserClient;

    public List<Report> getAllReports() {
        return reportRepo.findAll();
    }

    public Report getReportById(Integer reportId) {
        return reportRepo.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
    }

    public List<Report> getReportsByUser(Integer userId) {
        return reportRepo.findByGeneratedByUserIdOrderByGeneratedDateDesc(userId);
    }

    public Report generateReport(String scope, String metrics, String format, Integer userId) {
        ApiResponse<UserSummaryDTO> userResponse = authUserClient.getUserById(userId);
        if (userResponse == null || userResponse.getData() == null) {
            throw new ResourceNotFoundException("User not found");
        }

        Report report = new Report();
        report.setScope(scope);
        report.setMetrics(metrics);
        report.setFormat(format);
        report.setGeneratedByUserId(userId);
        report.setGeneratedDate(LocalDateTime.now());
        report.setFilePath("/reports/" + System.currentTimeMillis() + "." + format.toLowerCase());

        Report saved = reportRepo.save(report);

        createAuditLog(userId, "REPORT_GENERATED",
                "Generated " + scope + " report in " + format + " format",
                "Report", saved.getReportId());

        return saved;
    }

    public Map<String, Object> getDashboardMetrics(Integer userId, String role) {
        Map<String, Object> metrics = new HashMap<>();

        if ("EMPLOYEE".equals(role)) {
            List<Goal> myGoals = goalRepo.findByAssignedToUserId(userId);
            long completedGoals  = myGoals.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();
            long inProgressGoals = myGoals.stream().filter(g -> g.getStatus() == GoalStatus.IN_PROGRESS).count();
            long pendingGoals    = myGoals.stream().filter(g -> g.getStatus() == GoalStatus.PENDING).count();

            // FIX: PerformanceReview has userId (not employeeUserId)
            // Pending = employee must still submit self-assessment
            // MANAGER_REVIEW_COMPLETED = employee must acknowledge
            long pendingReviews = reviewRepo.findByUserId(userId).stream()
                    .filter(r -> r.getStatus() == PerformanceReviewStatus.PENDING
                            || r.getStatus() == PerformanceReviewStatus.MANAGER_REVIEW_COMPLETED)
                    .count();

            metrics.put("totalGoals",      myGoals.size());
            metrics.put("completedGoals",  completedGoals);
            metrics.put("inProgressGoals", inProgressGoals);
            metrics.put("pendingGoals",    pendingGoals);
            metrics.put("completionRate",  myGoals.size() > 0 ? (completedGoals * 100.0 / myGoals.size()) : 0);
            metrics.put("pendingReviews",  pendingReviews);

        } else if ("MANAGER".equals(role)) {
            List<Goal> teamGoals = goalRepo.findByAssignedManagerId(userId);

            ApiResponse<List<UserSummaryDTO>> teamResponse = authUserClient.getTeamByManager(userId);
            int teamSize = (teamResponse != null && teamResponse.getData() != null)
                    ? teamResponse.getData().size() : 0;

            // FIX: no managerUserId field — derive pending reviews from team member IDs
            // SELF_ASSESSMENT_COMPLETED = employee submitted, manager must act
            List<Integer> teamMemberIds = (teamResponse != null && teamResponse.getData() != null)
                    ? teamResponse.getData().stream()
                    .map(UserSummaryDTO::getUserId)
                    .collect(Collectors.toList())
                    : Collections.emptyList();

            long pendingReviews = reviewRepo
                    .findByStatus(PerformanceReviewStatus.SELF_ASSESSMENT_COMPLETED).stream()
                    .filter(r -> teamMemberIds.contains(r.getUserId()))
                    .count();

            long pendingApprovals  = teamGoals.stream().filter(g -> g.getStatus() == GoalStatus.PENDING).count();
            long pendingCompletions = teamGoals.stream().filter(g -> g.getStatus() == GoalStatus.PENDING_COMPLETION_APPROVAL).count();
            long completedGoals    = teamGoals.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();

            metrics.put("teamSize",          teamSize);
            metrics.put("totalGoals",        teamGoals.size());   // FIX: was totalTeamGoals
            metrics.put("totalTeamGoals",    teamGoals.size());   // keep for backward compat
            metrics.put("completedGoals",    completedGoals);
            metrics.put("pendingApprovals",  pendingApprovals);
            metrics.put("pendingCompletions", pendingCompletions);
            metrics.put("pendingReviews",    pendingReviews);

        } else {
            // ADMIN
            List<Goal> allGoals = goalRepo.findAll();
            List<PerformanceReview> allReviews = reviewRepo.findAll();

            long completedGoals = allGoals.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();

            // FIX: "ACKNOWLEDGED" is not a valid status — correct value is COMPLETED_AND_ACKNOWLEDGED
            long pendingReviews = allReviews.stream()
                    .filter(r -> r.getStatus() != PerformanceReviewStatus.COMPLETED_AND_ACKNOWLEDGED)
                    .count();

            // FIX: fetch real user count from auth-user-service
            int totalUsers = 0;
            try {
                ApiResponse<List<UserSummaryDTO>> usersResponse = authUserClient.getAllUsers();
                if (usersResponse != null && usersResponse.getData() != null) {
                    totalUsers = usersResponse.getData().size();
                }
            } catch (Exception e) {
                log.warn("Could not fetch user count from auth-user-service: {}", e.getMessage());
            }

            metrics.put("totalUsers",    totalUsers);
            metrics.put("totalGoals",    allGoals.size());
            metrics.put("totalReviews",  allReviews.size());
            metrics.put("completedGoals", completedGoals);
            metrics.put("pendingReviews", pendingReviews);
        }

        return metrics;
    }

    public Map<String, Object> getPerformanceSummary(Integer cycleId, String dept) {
        Map<String, Object> summary = new HashMap<>();

        List<PerformanceReview> reviews = (cycleId != null)
                ? reviewRepo.findByCycle_CycleId(cycleId)
                : reviewRepo.findAll();

        if (dept != null && !dept.isEmpty()) {
            log.warn("Department filtering requires cross-service calls - not implemented in this version");
        }

        long totalReviews = reviews.size();

        double avgSelfRating = reviews.stream()
                .filter(r -> r.getEmployeeSelfRating() != null)
                .mapToInt(PerformanceReview::getEmployeeSelfRating)
                .average().orElse(0.0);

        double avgManagerRating = reviews.stream()
                .filter(r -> r.getManagerRating() != null)
                .mapToInt(PerformanceReview::getManagerRating)
                .average().orElse(0.0);

        // Rating distribution grouped by manager rating value (e.g. "1" → 3, "4" → 7 ...)
        Map<String, Long> ratingDistribution = reviews.stream()
                .filter(r -> r.getManagerRating() != null)
                .collect(Collectors.groupingBy(
                        r -> String.valueOf(r.getManagerRating()),
                        Collectors.counting()));

        summary.put("totalReviews",       totalReviews);
        summary.put("avgSelfRating",      avgSelfRating);
        summary.put("avgManagerRating",   avgManagerRating);
        summary.put("ratingDistribution", ratingDistribution);
        summary.put("cycleId",            cycleId);
        summary.put("department",         dept);

        return summary;
    }

    public Map<String, Object> getGoalAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        List<Goal> allGoals = goalRepo.findAll();

        long pending           = allGoals.stream().filter(g -> g.getStatus() == GoalStatus.PENDING).count();
        long inProgress        = allGoals.stream().filter(g -> g.getStatus() == GoalStatus.IN_PROGRESS).count();
        long pendingCompletion = allGoals.stream().filter(g -> g.getStatus() == GoalStatus.PENDING_COMPLETION_APPROVAL).count();
        long completed         = allGoals.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();
        long rejected          = allGoals.stream().filter(g -> g.getStatus() == GoalStatus.REJECTED).count();

        Map<String, Long> statusBreakdown = new LinkedHashMap<>();
        statusBreakdown.put("PENDING",            pending);
        statusBreakdown.put("IN_PROGRESS",         inProgress);
        statusBreakdown.put("PENDING_COMPLETION",  pendingCompletion);
        statusBreakdown.put("COMPLETED",           completed);
        statusBreakdown.put("REJECTED",            rejected);

        // FIX: GoalCategory is an enum — use .name() to get the String key
        Map<String, Long> categoryBreakdown = allGoals.stream()
                .filter(g -> g.getCategory() != null)     // FIX: enum has no .isBlank()
                .collect(Collectors.groupingBy(
                        g -> g.getCategory().name(),       // FIX: Goal::getCategory returns enum, not String
                        Collectors.counting()));

        analytics.put("totalGoals",       allGoals.size());
        analytics.put("pending",          pending);
        analytics.put("inProgress",       inProgress);
        analytics.put("pendingCompletion", pendingCompletion);
        analytics.put("completed",        completed);
        analytics.put("rejected",         rejected);
        analytics.put("completionRate",   allGoals.size() > 0 ? (completed * 100.0 / allGoals.size()) : 0);
        analytics.put("statusBreakdown",  statusBreakdown);
        analytics.put("categoryBreakdown", categoryBreakdown);

        return analytics;
    }

    public List<Map<String, Object>> getDepartmentPerformance() {
        List<Map<String, Object>> performance = new ArrayList<>();

        try {
            ApiResponse<List<UserSummaryDTO>> usersResponse = authUserClient.getAllUsers();
            if (usersResponse == null || usersResponse.getData() == null) {
                log.warn("No users returned from auth-user-service for department performance");
                return performance;
            }

            Map<String, List<UserSummaryDTO>> byDept = usersResponse.getData().stream()
                    .filter(u -> u.getDepartment() != null && !u.getDepartment().isBlank())
                    .collect(Collectors.groupingBy(UserSummaryDTO::getDepartment));

            List<PerformanceReview> allReviews = reviewRepo.findAll();
            List<Goal> allGoals = goalRepo.findAll();

            for (Map.Entry<String, List<UserSummaryDTO>> entry : byDept.entrySet()) {
                String dept = entry.getKey();
                List<Integer> userIds = entry.getValue().stream()
                        .map(UserSummaryDTO::getUserId)
                        .collect(Collectors.toList());

                // FIX: PerformanceReview has userId (not employeeUserId)
                long completedGoals = allGoals.stream()
                        .filter(g -> userIds.contains(g.getAssignedToUserId())
                                && g.getStatus() == GoalStatus.COMPLETED)
                        .count();

                double avgRating = allReviews.stream()
                        .filter(r -> userIds.contains(r.getUserId())   // FIX: getUserId() not getEmployeeUserId()
                                && r.getManagerRating() != null)
                        .mapToInt(PerformanceReview::getManagerRating)
                        .average().orElse(0.0);

                Map<String, Object> deptData = new HashMap<>();
                deptData.put("department",     dept);
                deptData.put("completedGoals", completedGoals);
                deptData.put("avgRating",      avgRating);
                deptData.put("employeeCount",  userIds.size());
                performance.add(deptData);
            }

        } catch (Exception e) {
            log.error("Failed to fetch department performance: {}", e.getMessage());
        }

        return performance;
    }

    private void createAuditLog(Integer userId, String action, String details,
                                String entityType, Integer entityId) {
        try {
            AuditLogRequest auditReq = new AuditLogRequest(
                    userId, action, details, entityType, entityId, "SUCCESS", null);
            authUserClient.createAuditLog(auditReq);
        } catch (Exception e) {
            log.error("Failed to create audit log: {}", e.getMessage());
        }
    }
}
