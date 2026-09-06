package com.innovx.nodues.controller;

import com.innovx.nodues.dto.ClearanceRequestDetailDto;
import com.innovx.nodues.dto.ClearanceRequestSummaryDto;
import com.innovx.nodues.dto.CreateClearanceRequestDto;
import com.innovx.nodues.exception.UnauthorizedException;
import com.innovx.nodues.security.UserPrincipal;
import com.innovx.nodues.service.ClearanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Tag(name = "Student Clearance", description = "Student endpoints for initiating and monitoring clearance")
public class StudentController {

    private final ClearanceService clearanceService;
    private final com.innovx.nodues.repository.StudentRepository studentRepository;

    private String resolveStudentId(UserPrincipal principal) {
        if (principal.getStudentId() != null && !principal.getStudentId().isBlank()) {
            return principal.getStudentId();
        }
        return studentRepository.findByUserId(principal.getId())
                .map(com.innovx.nodues.domain.entity.Student::getId)
                .orElse(null);
    }

    @PostMapping("/clearance")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Start No-Dues Clearance", description = "Submits a new single clearance request creating tasks across all active departments")
    public ResponseEntity<ClearanceRequestDetailDto> startClearance(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateClearanceRequestDto dto) {
        String studentId = resolveStudentId(principal);
        if (studentId == null) {
            throw new UnauthorizedException("Authenticated user is not linked to an active student profile.");
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clearanceService.createRequest(studentId, dto));
    }

    @GetMapping("/clearance/active")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get active clearance request", description = "Retrieves current active clearance request with department statuses")
    public ResponseEntity<ClearanceRequestDetailDto> getActiveClearance(
            @AuthenticationPrincipal UserPrincipal principal) {
        String studentId = resolveStudentId(principal);
        if (studentId == null) {
            return ResponseEntity.ok(null);
        }
        ClearanceRequestDetailDto active = clearanceService.getMyActiveRequest(studentId);
        return ResponseEntity.ok(active);
    }

    @GetMapping("/clearance/history")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get clearance history", description = "Lists past and present clearance requests for the authenticated student")
    public ResponseEntity<List<ClearanceRequestSummaryDto>> getClearanceHistory(
            @AuthenticationPrincipal UserPrincipal principal) {
        String studentId = resolveStudentId(principal);
        if (studentId == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(clearanceService.getMyRequests(studentId));
    }
}
