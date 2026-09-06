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
public class DepartmentDto {
    private String id;

    @NotBlank(message = "Department code is required")
    private String code;

    @NotBlank(message = "Department name is required")
    private String name;

    private String description;

    @NotBlank(message = "Official email is required")
    private String officialEmail;

    @NotBlank(message = "Office location is required")
    private String officeLocation;

    private String officialPhone;

    private boolean active;
}
