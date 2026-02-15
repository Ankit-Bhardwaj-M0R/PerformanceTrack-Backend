package com.project.authuserservice.dto;

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
public class AuditLogRequest {

    @NotNull(message = "User ID is required")
    private Integer userId;

    @NotBlank(message = "Action is required")
    private String action;  // e.g., "CREATE_GOAL", "SUBMIT_REVIEW", "APPROVE_GOAL"

    private String details;  // Additional context about the action

    private String relatedEntityType;  // e.g., "GOAL", "REVIEW", "FEEDBACK"

    private Integer relatedEntityId;  // ID of the goal/review/feedback

    private String status;  // "SUCCESS", "FAILURE"

    private String ipAddress;  // Client IP address
}

