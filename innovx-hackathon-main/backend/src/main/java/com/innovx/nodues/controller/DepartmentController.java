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
@Tag(name = "Departments", description = "Query department information, contacts, and performance KPIs")
public class DepartmentController {

    private final AdminService adminService;

    @GetMapping
    @Operation(summary = "List all departments", description = "Returns active clearance departments with official contact info")
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        return ResponseEntity.ok(adminService.getAllDepartments());
    }

    @GetMapping("/{deptId}/kpis")
    @Operation(summary = "Get department KPIs", description = "Fetches pending, overdue, delayed, and approved metrics for a department")
    public ResponseEntity<DepartmentKpiDto> getDepartmentKpis(@PathVariable String deptId) {
        return ResponseEntity.ok(adminService.getDepartmentKpi(deptId));
    }
}
