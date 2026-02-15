package com.project.coreservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {
    private Long userId;
    private String type;        // NotificationType as string
    private String message;
    private String priority;
    private boolean actionRequired;
    private String relatedEntityType;
    private Integer relatedEntityId;
}



