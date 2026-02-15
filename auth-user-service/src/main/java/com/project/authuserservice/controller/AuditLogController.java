package com.project.authuserservice.controller;

import com.project.authuserservice.dto.ApiResponse;
import com.project.authuserservice.dto.AuditLogRequest;
import com.project.authuserservice.dto.PageResponse;
import com.project.authuserservice.entity.AuditLog;
import com.project.authuserservice.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    // Endpoint: GET /api/v1/audit-logs
    // Access: Strictly restricted to users with the 'ADMIN' role.
    // Supports optional query parameters for filtering logs by user, action, or date.
    @GetMapping
    public ApiResponse<PageResponse<AuditLog>> getAuditLogs(
            @RequestParam(required = false) Integer userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
                Sort.by("timestamp").descending());

        Page<AuditLog> logs = auditLogService.getAuditLogs(userId, action, startDt, endDt, pageable);
        return ApiResponse.successPage("Audit logs retrieved", logs);
    }

    // Endpoint: POST /api/v1/audit-logs/export
    // Access: Restricted to 'ADMIN' role for data security.
    // Triggers the generation of an audit report in the requested file format.
    @PostMapping("/export")
    public ApiResponse<String> exportLogs(@RequestBody Map<String, String> body) {
        String format = body.getOrDefault("format", "CSV");
        String filePath = auditLogService.initiateExport(format);
        return ApiResponse.success("Audit logs export initiated", filePath);
    }

    @PostMapping("/internal/audit-logs")
    public ResponseEntity<ApiResponse<Void>> createAuditLog(@RequestBody AuditLogRequest request) {
        auditLogService.logAudit(request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Audit logged", null));
    }
}