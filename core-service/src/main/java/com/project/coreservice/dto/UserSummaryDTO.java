package com.project.coreservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryDTO {

    private Integer userId;
    private String name;
    private String email;
    private String role;        // "EMPLOYEE", "MANAGER", "ADMIN"
    private String department;
    private Integer managerId;     // null if user is top-level or admin
}
