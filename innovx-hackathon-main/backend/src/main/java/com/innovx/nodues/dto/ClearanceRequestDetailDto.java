package com.innovx.nodues.dto;

import com.innovx.nodues.domain.enums.ClearanceStatus;
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
public class ClearanceRequestDetailDto {
    private String id;
    private String studentId;
    private String rollNo;
    private String studentName;
    private String email;
    private String phoneNumber;
    private String program;
    private String batchYear;
    private String academicDepartment;
    private String academicYear;
    private String semester;
    private String reason;
    private ClearanceStatus overallStatus;
    private boolean demo;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private int totalTasks;
    private int approvedTasks;
    private double progressPercentage;

    private List<ClearanceTaskDto> tasks;
    private List<ClearanceTimelineEventDto> timeline;

    private String certificateId;
    private String certificateNumber;
    private String qrVerificationUrl;
}
