package com.innovx.nodues.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentKpiDto {
    private String departmentId;
    private String departmentCode;
    private String departmentName;
    private long pendingCount;
    private long dueTodayCount;
    private long overdueCount;
    private long delayedCount;
    private long approvedCount;
    private long rejectedCount;
    private long unresolvedEscalationsCount;
}
