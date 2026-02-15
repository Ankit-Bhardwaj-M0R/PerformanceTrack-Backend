package com.project.authuserservice.client;

import com.project.authuserservice.dto.ApiResponse;
import com.project.authuserservice.dto.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")  // name matches Eureka registration
public interface NotificationClient {
    @PostMapping("/internal/notifications")
    ApiResponse<Void> sendNotification(@RequestBody NotificationRequest request);
}
