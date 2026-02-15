package com.project.coreservice.service;

import com.project.coreservice.client.AuthUserClient;
import com.project.coreservice.dto.ApiResponse;
import com.project.coreservice.dto.AuditLogRequest;
import com.project.coreservice.dto.CreateReviewCycleRequest;
import com.project.coreservice.dto.UserSummaryDTO;
import com.project.coreservice.entity.ReviewCycle;
import com.project.coreservice.enums.ReviewCycleStatus;
import com.project.coreservice.exception.ResourceNotFoundException;
import com.project.coreservice.repository.ReviewCycleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewCycleService {

    private final ReviewCycleRepository cycleRepo;
    private final AuthUserClient authUserClient; // CHANGED: Replaces UserRepository

    // Get all review cycles
    public List<ReviewCycle> getAllCycles() {
        return cycleRepo.findAll();
    }

    // Get cycle by id
    public ReviewCycle getCycleById(Integer cycleId) {
        return cycleRepo.findById(cycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Review Cycle not found"));
    }

    // Get active review cycle
    public ReviewCycle getActiveCycle() {
        return cycleRepo.findFirstByStatusOrderByStartDateDesc(ReviewCycleStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("No active review cycle found"));
    }

    // Create review cycle (Admin)
    @Transactional
    public ReviewCycle createCycle(CreateReviewCycleRequest req, Integer adminId) {
        // Create review cycle
        ReviewCycle cycle = new ReviewCycle();
        mapRequestToEntity(req, cycle);

        // Save cycle
        ReviewCycle saved = cycleRepo.save(cycle);

        // Create audit log - CHANGED: Using AuthUserClient instead of direct AuditLogService
        createAuditLog(adminId, "REVIEW_CYCLE_CREATED",
                "Created review cycle: " + cycle.getTitle(), "ReviewCycle", saved.getCycleId());

        return saved;
    }

    // Update review cycle (Admin)
    @Transactional
    public ReviewCycle updateCycle(Integer cycleId, CreateReviewCycleRequest req, Integer adminId) {
        ReviewCycle cycle = getCycleById(cycleId);
        mapRequestToEntity(req, cycle);

        // Save cycle
        ReviewCycle updated = cycleRepo.save(cycle);

        // Create audit log
        createAuditLog(adminId, "REVIEW_CYCLE_UPDATED",
                "Updated review cycle: " + cycle.getTitle(), "ReviewCycle", cycleId);

        return updated;
    }

    private void mapRequestToEntity(CreateReviewCycleRequest req, ReviewCycle cycle) {
        cycle.setTitle(req.getTitle());
        cycle.setStartDate(req.getStartDt());
        cycle.setEndDate(req.getEndDt());
        cycle.setStatus(req.getStatus());
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
