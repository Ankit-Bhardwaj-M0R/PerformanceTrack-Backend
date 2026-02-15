package com.project.coreservice.dto;
import lombok.Data;

// Approve goal completion request DTO
@Data
public class ApproveCompletionRequest {

    private String mgrComments;  // Manager comments on completion
}