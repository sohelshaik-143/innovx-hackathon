package com.innovx.nodues.dto;

import com.innovx.nodues.domain.enums.ClearanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClearanceRequestSummaryDto {
    private String id;
    private String studentId;
    private String rollNo;
    private String studentName;
    private String program;
    private String academicYear;
    private String semester;
    private String reason;
    private ClearanceStatus overallStatus;
    private int totalTasks;
    private int approvedTasks;
    private int delayedTasks;
    private int rejectedTasks;
    private int pendingTasks;
    private boolean demo;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private String certificateId;
    private String certificateNumber;
}
