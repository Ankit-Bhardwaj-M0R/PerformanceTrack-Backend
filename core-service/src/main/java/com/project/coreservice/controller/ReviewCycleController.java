package com.project.coreservice.controller;

import com.project.coreservice.dto.ApiResponse;
import com.project.coreservice.dto.CreateReviewCycleRequest;
import com.project.coreservice.dto.ReviewCycleSummaryDTO;
import com.project.coreservice.entity.ReviewCycle;
import com.project.coreservice.service.ReviewCycleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/review-cycles")
@RequiredArgsConstructor
public class ReviewCycleController {

    private final ReviewCycleService cycleSvc;

    //get all review cycles
    @GetMapping
    public ApiResponse<List<ReviewCycle>> getAllCycles(){
        List<ReviewCycle> cycles = cycleSvc.getAllCycles();
        return ApiResponse.success("Review cycles retrieved", cycles);
    }

    //get cycle by id
    @GetMapping("/{cycleId}")
    public ApiResponse<ReviewCycle> getCycleById(@PathVariable Integer cycleId) {
        ReviewCycle cycle = cycleSvc.getCycleById(cycleId);
        return ApiResponse.success("Review cycle retrieved", cycle);
    }

    // Get active cycle
    @GetMapping("/active")
    public ApiResponse<ReviewCycle> getActiveCycle() {
        ReviewCycle cycle = cycleSvc.getActiveCycle();
        return ApiResponse.success("Active cycle retrieved", cycle);
    }

    //create review cycle (Admin)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ReviewCycle> createCycle(@Valid @RequestBody CreateReviewCycleRequest req,
                                                HttpServletRequest httpReq) {
        Integer adminId = (Integer) httpReq.getAttribute("userId");
        ReviewCycle cycle = cycleSvc.createCycle(req, adminId);
        return ApiResponse.success("Review cycle created", cycle);
    }
    // Update review cycle (Admin)
    @PutMapping("/{cycleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ReviewCycle> updateCycle(@PathVariable Integer cycleId,
                                                @Valid @RequestBody CreateReviewCycleRequest req,
                                                HttpServletRequest httpReq) {
        Integer adminId = (Integer) httpReq.getAttribute("userId");
        ReviewCycle cycle = cycleSvc.updateCycle(cycleId, req, adminId);
        return ApiResponse.success("Review cycle updated", cycle);
    }

    @GetMapping("/internal/review-cycles/active")
    public ResponseEntity<ApiResponse<ReviewCycleSummaryDTO>> getActiveReviewCycle() {
        ReviewCycle cycle = cycleSvc.getActiveReviewCycle();
        if (cycle == null) {
            return ResponseEntity.ok(new ApiResponse<>("success", "No active cycle", null));
        }
        ReviewCycleSummaryDTO dto = new ReviewCycleSummaryDTO(
                cycle.getCycleId(), cycle.getTitle(), cycle.getStartDate(),
                cycle.getEndDate(), cycle.getStatus().name()
        );
        return ResponseEntity.ok(new ApiResponse<>("success", "Active cycle retrieved", dto));
    }


}