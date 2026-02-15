package com.project.coreservice.client;

import com.project.coreservice.dto.ApiResponse;
import com.project.coreservice.dto.AuditLogRequest;
import com.project.coreservice.dto.UserSummaryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "auth-user-service")
public interface AuthUserClient {

    @GetMapping("/internal/users/{userId}")
    ApiResponse<UserSummaryDTO> getUserById(@PathVariable("userId") Integer userId);

    @GetMapping("/internal/users/by-manager/{managerId}")
    ApiResponse<List<UserSummaryDTO>> getTeamByManager(@PathVariable("managerId") Integer managerId);

    @PostMapping("/internal/audit-logs")
    ApiResponse<Void> createAuditLog(@RequestBody AuditLogRequest request);
}
