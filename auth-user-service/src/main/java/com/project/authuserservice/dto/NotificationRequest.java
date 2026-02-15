package com.project.authuserservice.dto;

import com.project.authuserservice.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {
    @NotNull(message = "User ID is required")
    private Integer userId;
    // maps to user

    @NotBlank(message = "Notification type is required")// enum
    private NotificationType type;

    @NotBlank(message = "Message is required")
    private String message;               // text content
    private String relatedEntityType;     // "User", "Goal", "Review" etc
    private Integer relatedEntityId;      // the related entity's ID
    private String priority;              // "HIGH", "NORMAL", "LOW"
    private Boolean actionRequired;       // false by default
}







