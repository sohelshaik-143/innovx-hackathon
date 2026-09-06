package com.innovx.nodues.controller;

import com.innovx.nodues.domain.enums.TaskStatus;
import com.innovx.nodues.dto.*;
import com.innovx.nodues.exception.UnauthorizedException;
import com.innovx.nodues.security.UserPrincipal;
import com.innovx.nodues.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Department Tasks", description = "Department staff verification, approval, rejection, and delay actions")
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    @PreAuthorize("hasAnyRole('DEPARTMENT_STAFF', 'DEPARTMENT_HEAD', 'ADMIN')")
    @Operation(summary = "Get department tasks", description = "Retrieves assigned tasks for the caller's department with filters")
    public ResponseEntity<Page<ClearanceTaskDto>> getTasks(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Boolean isOverdue,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 15) Pageable pageable) {

        String targetDeptId = principal.getDepartmentId();
        boolean isAdmin = principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (isAdmin && departmentId != null) {
            targetDeptId = departmentId;
        }

        if (targetDeptId == null) {
            throw new UnauthorizedException("User is not assigned to any department.");
        }

        return ResponseEntity.ok(taskService.getDepartmentTasks(targetDeptId, status, isOverdue, search, pageable));
    }

    @GetMapping("/{taskId}")
    @PreAuthorize("@deptSecurity.canAccessTask(#taskId, authentication)")
    @Operation(summary = "Get task details", description = "Retrieves task details and verification metadata")
    public ResponseEntity<ClearanceTaskDto> getTaskDetails(@PathVariable String taskId) {
        return ResponseEntity.ok(taskService.getTaskDetails(taskId));
    }

    @PostMapping("/{taskId}/approve")
    @PreAuthorize("hasAnyRole('DEPARTMENT_STAFF', 'DEPARTMENT_HEAD', 'ADMIN') and @deptSecurity.canAccessTask(#taskId, authentication)")
    @Operation(summary = "Approve clearance task", description = "Verifies department records and approves task. Generates certificate if all tasks complete.")
    public ResponseEntity<ClearanceTaskDto> approveTask(
            @PathVariable String taskId,
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) ApproveTaskDto dto) {
        if (dto == null) {
            dto = new ApproveTaskDto();
        }
        return ResponseEntity.ok(taskService.approveTask(taskId, principal, dto));
    }

    @PostMapping("/{taskId}/reject")
    @PreAuthorize("hasAnyRole('DEPARTMENT_STAFF', 'DEPARTMENT_HEAD', 'ADMIN') and @deptSecurity.canAccessTask(#taskId, authentication)")
    @Operation(summary = "Reject clearance task", description = "Rejects task with mandatory reason, explanation, and required student action")
    public ResponseEntity<ClearanceTaskDto> rejectTask(
            @PathVariable String taskId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody RejectTaskDto dto) {
        return ResponseEntity.ok(taskService.rejectTask(taskId, principal, dto));
    }

    @PostMapping("/{taskId}/delay")
    @PreAuthorize("hasAnyRole('DEPARTMENT_STAFF', 'DEPARTMENT_HEAD', 'ADMIN') and @deptSecurity.canAccessTask(#taskId, authentication)")
    @Operation(summary = "Mark task delayed", description = "Records delay reason with mandatory category, explanation, expected date, and next action")
    public ResponseEntity<ClearanceTaskDto> delayTask(
            @PathVariable String taskId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DelayTaskDto dto) {
        return ResponseEntity.ok(taskService.delayTask(taskId, principal, dto));
    }

    @PostMapping("/{taskId}/reassign")
    @PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'ADMIN')")
    @Operation(summary = "Reassign task staff", description = "Reassigns task to another staff member within the department")
    public ResponseEntity<ClearanceTaskDto> reassignTask(
            @PathVariable String taskId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ReassignTaskDto dto) {
        return ResponseEntity.ok(taskService.reassignTask(taskId, principal, dto));
    }
}
