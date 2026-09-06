package com.innovx.nodues.service;

import com.innovx.nodues.domain.entity.AuditLog;
import com.innovx.nodues.dto.AuditLogDto;
import com.innovx.nodues.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(String userId, String username, String role, String departmentCode,
                          String action, String entityType, String entityId,
                          String oldStatus, String newStatus, String details, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .username(username != null ? username : "SYSTEM")
                    .role(role)
                    .departmentCode(departmentCode)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .oldStatus(oldStatus)
                    .newStatus(newStatus)
                    .details(details)
                    .ipAddress(ipAddress)
                    .timestamp(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
        } catch (Exception ex) {
            log.error("Failed to persist audit log: action={}, entityId={}", action, entityId, ex);
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDto> getAuditLogs(String action, String entityType, String departmentCode,
                                          String search, Pageable pageable) {
        Page<AuditLog> logs = auditLogRepository.searchAuditLogs(action, entityType, departmentCode, search, pageable);
        return logs.map(this::mapToDto);
    }

    private AuditLogDto mapToDto(AuditLog log) {
        return AuditLogDto.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .username(log.getUsername())
                .role(log.getRole())
                .departmentCode(log.getDepartmentCode())
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .oldStatus(log.getOldStatus())
                .newStatus(log.getNewStatus())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .timestamp(log.getTimestamp())
                .build();
    }
}
