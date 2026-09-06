package com.innovx.nodues.controller;

import com.innovx.nodues.dto.DepartmentDto;
import com.innovx.nodues.dto.DepartmentKpiDto;
import com.innovx.nodues.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Departments", description = "Query department information, contacts, and performance KPIs")
public class DepartmentController {

    private final AdminService adminService;

    // 2. MODIFIED THIS LINE: Explicitly handles both path variants (with and without trailing slash)
    @GetMapping({"", "/"})
    @Operation(summary = "List all departments", description = "Returns active departments")
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        return ResponseEntity.ok(adminService.getAllDepartments());
    }

    @GetMapping("/{deptId}/kpis")
    @Operation(summary = "Get department KPIs", description = "Fetches pending requests count")
    public ResponseEntity<DepartmentKpiDto> getDepartmentKpis(@PathVariable String deptId) {
        return ResponseEntity.ok(adminService.getDepartmentKpi(deptId));
    }
}