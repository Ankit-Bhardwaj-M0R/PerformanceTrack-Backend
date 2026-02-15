package com.project.notificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalSummaryDTO {
    private Integer goalId;
    private String title;
    private String status;
    private Integer assignedToUserId;
    private Integer assignedManagerId;
    private LocalDate createdDate;
}
