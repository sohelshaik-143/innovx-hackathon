package com.innovx.nodues.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlaConfigDto {
    @NotNull(message = "SLA processing time in hours is required")
    @Min(value = 1, message = "SLA must be at least 1 hour")
    @Max(value = 720, message = "SLA cannot exceed 720 hours (30 days)")
    private Integer slaHours;

    private String institutionName;
    private String portalBaseUrl;
    private String supportEmail;
}
