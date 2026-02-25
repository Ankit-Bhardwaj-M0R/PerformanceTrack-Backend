package com.project.performanceTrack.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReportResponseDTO {
    private Integer reportId;
    private String scope;
    private String metrics;
    private String format;
    private LocalDateTime generatedDate;
    private String filePath;

    // Flattened User Info
    private Integer generatedById;
    private String generatedByName;
}
