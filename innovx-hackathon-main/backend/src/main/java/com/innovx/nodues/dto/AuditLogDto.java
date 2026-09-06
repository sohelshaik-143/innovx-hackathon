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
public class AuditLogDto {
    private String id;
    private String userId;
    private String username;
    private String role;
    private String departmentCode;
    private String action;
    private String entityType;
    private String entityId;
    private String oldStatus;
    private String newStatus;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
}
