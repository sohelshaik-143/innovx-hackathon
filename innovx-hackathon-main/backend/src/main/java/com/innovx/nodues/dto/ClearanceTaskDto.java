package com.innovx.nodues.dto;

import com.innovx.nodues.domain.enums.DelayCategory;
import com.innovx.nodues.domain.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClearanceTaskDto {
    private String id;
    private String requestId;
    private String departmentId;
    private String departmentCode;
    private String departmentName;
    private String officialEmail;
    private String officeLocation;
    private String officialPhone;
    private String assignedStaffName;
    private TaskStatus status;
    private LocalDateTime assignedAt;
    private LocalDateTime dueAt;
    private LocalDateTime completedAt;
    private boolean overdue;
    private LocalDateTime escalatedAt;
    private String verificationRemarks;
    private String referenceNumber;

    // Student Candidate Context
    private String studentName;
    private String studentIdNumber;
    private String studentRollNo;
    private String studentProgram;

    // Latest Delay Information
    private DelayInfoDto delayInfo;

    // Latest Rejection Information
    private RejectionInfoDto rejectionInfo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DelayInfoDto {
        private String id;
        private DelayCategory category;
        private String explanation;
        private LocalDate expectedResolutionDate;
        private String nextAction;
        private LocalDateTime recordedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RejectionInfoDto {
        private String id;
        private String reasonTitle;
        private String explanation;
        private String requiredStudentAction;
        private LocalDateTime recordedAt;
    }
}
