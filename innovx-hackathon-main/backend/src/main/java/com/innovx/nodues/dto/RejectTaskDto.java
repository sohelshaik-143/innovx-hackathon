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
public class RejectTaskDto {
    @NotBlank(message = "Rejection reason title is required")
    private String reasonTitle;

    @NotBlank(message = "Detailed explanation of rejection is required")
    private String explanation;

    @NotBlank(message = "Action required from the student is mandatory")
    private String requiredStudentAction;
}
