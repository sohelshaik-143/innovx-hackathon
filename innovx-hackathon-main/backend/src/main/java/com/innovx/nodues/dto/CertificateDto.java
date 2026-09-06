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
public class CertificateDto {
    private String id;
    private String certificateNumber;
    private String requestId;
    private String studentId;
    private String studentName;
    private String rollNo;
    private String program;
    private String batchYear;
    private String academicDepartment;
    private String institutionName;
    private LocalDateTime issueDate;
    private LocalDateTime completionDate;
    private String verificationHash;
    private String qrVerificationUrl;
    private boolean revoked;
    private List<DepartmentVerificationEntry> verifications;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentVerificationEntry {
        private String departmentCode;
        private String departmentName;
        private String verifiedBy;
        private LocalDateTime verifiedAt;
        private String remarks;
        private String referenceNumber;
    }
}
