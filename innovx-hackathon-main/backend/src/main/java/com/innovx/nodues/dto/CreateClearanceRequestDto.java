package com.innovx.nodues.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateClearanceRequestDto {
    @NotBlank(message = "Academic year is required (e.g., 2025-2026)")
    private String academicYear;

    @NotBlank(message = "Semester is required (e.g., Semester 8)")
    private String semester;

    @NotBlank(message = "Clearance purpose is required (e.g., Graduation, Transfer)")
    private String reason;
}
