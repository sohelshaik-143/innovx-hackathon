package com.innovx.nodues.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStatsDto {
    private long totalActiveRequests;
    private long completedRequests;
    private long pendingRequests;
    private long rejectedRequests;
    private long overdueRequests;
    private long activeEscalations;
    private int configuredSlaHours;
    private boolean hasSufficientData;
    private List<DepartmentKpiDto> departmentPerformance;
}
