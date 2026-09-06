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
public class ReassignTaskDto {
    @NotBlank(message = "Staff user ID is required")
    private String staffUserId;

    private String remarks;
}
