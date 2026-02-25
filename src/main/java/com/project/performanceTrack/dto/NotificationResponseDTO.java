package com.project.performanceTrack.dto;

import lombok.Data;
import com.project.performanceTrack.enums.NotificationStatus;
import com.project.performanceTrack.enums.NotificationType;
import java.time.LocalDateTime;

@Data
public class NotificationResponseDTO {
    private Integer notificationId;
    private NotificationType type;
    private String message;
    private String relatedEntityType;
    private Integer relatedEntityId;
    private NotificationStatus status;
    private String priority;
    private Boolean actionRequired;
    private LocalDateTime createdDate;
    private LocalDateTime readDate;

    // Only expose safe User details
    private Integer userId;
}