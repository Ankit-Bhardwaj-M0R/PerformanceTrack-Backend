package com.project.coreservice.client;

import com.project.coreservice.dto.ApiResponse;
import com.project.coreservice.dto.NotificationRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")
public interface NotificationClient {

    @PostMapping("/internal/notifications")
    ApiResponse<Void> sendNotification(@RequestBody NotificationRequest request);
}
