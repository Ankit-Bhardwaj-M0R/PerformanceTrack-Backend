package com.project.notificationservice.client;

import com.project.notificationservice.dto.ApiResponse;
import com.project.notificationservice.dto.UserSummaryDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "auth-user-service")
public interface AuthUserClient {

    @GetMapping("/internal/users/{userId}")
    ApiResponse<UserSummaryDTO> getUserById(@PathVariable("userId") Long userId);

    @GetMapping("/internal/users/by-manager/{managerId}")
    ApiResponse<List<UserSummaryDTO>> getTeamByManager(@PathVariable("managerId") Long managerId);
}
