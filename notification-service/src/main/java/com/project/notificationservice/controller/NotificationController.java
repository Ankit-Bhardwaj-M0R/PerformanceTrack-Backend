package com.project.notificationservice.controller;

import com.project.notificationservice.dto.ApiResponse;
import com.project.notificationservice.dto.NotificationRequest;
import com.project.notificationservice.dto.PageResponse;
import com.project.notificationservice.entity.Notification;
import com.project.notificationservice.enums.NotificationType;
import com.project.notificationservice.service.NotificationService;
import com.project.notificationservice.service.SseEmitterService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private final SseEmitterService sseEmitterService;                // <-- new

    // NEW - SSE stream endpoint
    @GetMapping("/stream")
    public SseEmitter stream(HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");
        return sseEmitterService.createEmitter(userId);
    }

    @GetMapping
    public ApiResponse<PageResponse<Notification>> getNotifications(
            HttpServletRequest httpReq,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Integer userId = (Integer) httpReq.getAttribute("userId");
        Pageable pageable = PageRequest.of(page, Math.min(size, 100),
                Sort.by("createdDate").descending());

        Page<Notification> notifications = notificationService.getNotifications(userId, status, pageable);
        return ApiResponse.successPage("Notifications retrieved", notifications);
    }

    @PutMapping("/{notifId}")
    public ApiResponse<Notification> markAsRead(@PathVariable Integer notifId) {
        Notification updated = notificationService.markAsRead(notifId);
        return ApiResponse.success("Notification marked as read", updated);
    }

    @PutMapping("/mark-all-read")
    public ApiResponse<Void> markAllAsRead(HttpServletRequest httpReq) {
        Integer userId = (Integer) httpReq.getAttribute("userId");
        notificationService.markAllAsRead(userId);
        return ApiResponse.success("All notifications marked as read");
    }

    @PostMapping("/internal/notifications")
    public ResponseEntity<ApiResponse<Void>> createNotification(
            @RequestBody NotificationRequest request) {
        try {
            notificationService.sendNotification(
                    request.getUserId(),
                    NotificationType.valueOf(request.getType()),
                    request.getMessage(),
                    request.getRelatedEntityType(),
                    request.getRelatedEntityId(),
                    request.getPriority(),
                    request.isActionRequired()
            );
            return ResponseEntity.ok(ApiResponse.success("Notification sent"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to send notification: " + e.getMessage()));
        }
    }

}