package com.project.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequest {
    private Integer userId;
    private String type;        // NotificationType as string
    private String message;
    private String priority;
    private boolean actionRequired;
    private String relatedEntityType;
    private Integer relatedEntityId;
}
