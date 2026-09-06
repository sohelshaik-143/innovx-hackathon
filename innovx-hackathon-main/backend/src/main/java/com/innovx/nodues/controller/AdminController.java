package com.innovx.nodues.controller;

import com.innovx.nodues.dto.*;
import com.innovx.nodues.security.UserPrincipal;
import com.innovx.nodues.service.AdminService;
import com.innovx.nodues.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Administration", description = "College governance administrative endpoints: SLA, departments, users, audit logs, and metrics")
public class AdminController {

    private final AdminService adminService;
    private final AuditLogService auditLogService;

    @GetMapping("/stats")
    @Operation(summary = "Get admin dashboard KPI metrics", description = "Calculates active, completed, overdue, and departmental workload stats")
    public ResponseEntity<AdminDashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/sla")
    @Operation(summary = "Get current SLA configuration", description = "Retrieves configured SLA processing hours and institutional parameters")
    public ResponseEntity<SlaConfigDto> getSlaConfig() {
        return ResponseEntity.ok(adminService.getSlaConfig());
    }

    @PutMapping("/sla")
    @Operation(summary = "Update SLA processing window", description = "Modifies institutional SLA hours (e.g. 48 hours = 2 calendar days)")
    public ResponseEntity<SlaConfigDto> updateSlaConfig(
            @Valid @RequestBody SlaConfigDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminService.updateSlaConfig(dto, principal));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Query immutable audit logs", description = "Search audit trail by action, entity type, department, and keywords")
    public ResponseEntity<Page<AuditLogDto>> getAuditLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String departmentCode,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(auditLogService.getAuditLogs(action, entityType, departmentCode, search, pageable));
    }

    @GetMapping("/users")
    @Operation(summary = "List system users", description = "Lists users with role and department mappings")
    public ResponseEntity<Page<UserSummaryDto>> getAllUsers(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    @PostMapping("/departments")
    @Operation(summary = "Add new clearance department", description = "Dynamically registers an additional clearance department")
    public ResponseEntity<DepartmentDto> createDepartment(
            @Valid @RequestBody DepartmentDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.createDepartment(dto, principal));
    }

    @PutMapping("/departments/{id}")
    @Operation(summary = "Update department details", description = "Updates office location, contact email, and active status")
    public ResponseEntity<DepartmentDto> updateDepartment(
            @PathVariable String id,
            @Valid @RequestBody DepartmentDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(adminService.updateDepartment(id, dto, principal));
    }
}
