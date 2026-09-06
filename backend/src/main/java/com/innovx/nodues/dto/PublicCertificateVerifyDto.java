package com.innovx.nodues.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicCertificateVerifyDto {
    private boolean valid;
    private String statusMessage;
    private String certificateNumber;
    private String institutionName;
    private String studentIdentifier; // e.g., "Alex Rivera (STU-2024-001)"
    private String program;
    private LocalDateTime issueDate;
    private LocalDateTime completionDate;
    private LocalDateTime verificationTimestamp;
    private List<DepartmentVerifiedPublicEntry> verifiedDepartments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentVerifiedPublicEntry {
        private String departmentName;
        private LocalDateTime verifiedAt;
        private String status;
    }
}
