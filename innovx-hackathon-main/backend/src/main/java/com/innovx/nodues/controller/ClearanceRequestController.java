package com.innovx.nodues.controller;

import com.innovx.nodues.domain.enums.ClearanceStatus;
import com.innovx.nodues.dto.ClearanceRequestDetailDto;
import com.innovx.nodues.dto.ClearanceRequestSummaryDto;
import com.innovx.nodues.repository.ClearanceRequestRepository;
import com.innovx.nodues.service.ClearanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clearance-requests")
@RequiredArgsConstructor
@Tag(name = "Clearance Requests", description = "Query and inspect clearance requests")
public class ClearanceRequestController {

    private final ClearanceService clearanceService;
    private final ClearanceRequestRepository requestRepository;

    @GetMapping("/{requestId}")
    @PreAuthorize("@deptSecurity.canAccessRequest(#requestId, authentication)")
    @Operation(summary = "Get clearance request details", description = "Returns full breakdown of tasks, timeline events, and certificate info")
    public ResponseEntity<ClearanceRequestDetailDto> getRequestDetails(@PathVariable String requestId) {
        return ResponseEntity.ok(clearanceService.getRequestDetails(requestId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF')")
    @Operation(summary = "Search clearance requests", description = "Search and filter requests across departments")
    public ResponseEntity<Page<ClearanceRequestSummaryDto>> searchRequests(
            @RequestParam(required = false) ClearanceStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 15) Pageable pageable) {
        Page<ClearanceRequestSummaryDto> results = requestRepository.searchRequests(status, search, pageable)
                .map(clearanceService::mapToSummaryDto);
        return ResponseEntity.ok(results);
    }
}
