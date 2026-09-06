package com.innovx.nodues.dto;

import com.innovx.nodues.domain.enums.DelayCategory;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DelayTaskDto {
    @NotNull(message = "Delay category is required")
    private DelayCategory category;

    @NotBlank(message = "Delay explanation is mandatory and cannot be empty")
    private String explanation;

    @NotNull(message = "Expected resolution date is required")
    @FutureOrPresent(message = "Expected resolution date must be today or in the future")
    private LocalDate expectedResolutionDate;

    @NotBlank(message = "Next departmental action is required")
    private String nextAction;
}
