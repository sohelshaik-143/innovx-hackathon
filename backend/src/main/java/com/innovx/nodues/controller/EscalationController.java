package com.innovx.nodues.controller;

import com.innovx.nodues.domain.entity.Escalation;
import com.innovx.nodues.security.UserPrincipal;
import com.innovx.nodues.service.AdminService;
import com.innovx.nodues.service.SlaEscalationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/escalations")
@RequiredArgsConstructor
@Tag(name = "Escalations & SLA", description = "SLA tracking, breach detection, and management escalation")
public class EscalationController {

    private final AdminService adminService;
    private final SlaEscalationService slaEscalationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'ADMIN')")
    @Operation(summary = "Get escalations", description = "Lists all active and historical SLA breach escalations")
    public ResponseEntity<Page<Escalation>> getEscalations(@PageableDefault(size = 15) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllEscalations(pageable));
    }

    @PostMapping("/{escalationId}/resolve")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'ADMIN')")
    @Operation(summary = "Resolve escalation", description = "Records resolution notes and marks escalation as resolved")
    public ResponseEntity<Map<String, String>> resolveEscalation(
            @PathVariable String escalationId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal principal) {
        String notes = body.getOrDefault("notes", "Resolved by department authority");
        adminService.resolveEscalation(escalationId, notes, principal);
        return ResponseEntity.ok(Map.of("message", "Escalation marked resolved successfully"));
    }

    @PostMapping("/trigger-check")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Trigger SLA check", description = "Manually scans and escalates all overdue tasks exceeding configured SLA")
    public ResponseEntity<Map<String, Object>> triggerSlaCheck() {
        int escalatedCount = slaEscalationService.checkAndEscalateOverdueTasks();
        return ResponseEntity.ok(Map.of(
                "escalatedTasksCount", escalatedCount,
                "message", "SLA evaluation cycle completed successfully"
        ));
    }
}
