package com.project.authuserservice.controller;

import com.project.authuserservice.dto.ApiResponse;
import com.project.authuserservice.dto.AuditLogRequest;
import com.project.authuserservice.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/audit-logs")
@RequiredArgsConstructor
public class InternalAuditController {

    private final AuditLogService auditLogService;

    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createAuditLog(@RequestBody AuditLogRequest request) {
        auditLogService.logAudit(request);
        return ResponseEntity.ok(new ApiResponse<>("success", "Audit logged", null));
    }
}