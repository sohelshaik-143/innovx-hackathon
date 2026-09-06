package com.innovx.nodues.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClearanceTimelineEventDto {
    private String id;
    private LocalDateTime timestamp;
    private String eventType; // REQUEST_CREATED, TASK_APPROVED, TASK_REJECTED, TASK_DELAYED, ESCALATION, COMPLETED
    private String departmentName;
    private String title;
    private String description;
    private String actorName;
    private String status;
}
