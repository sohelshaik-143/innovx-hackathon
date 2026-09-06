package com.innovx.nodues.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveTaskDto {
    private String verificationRemarks;
    private String referenceNumber;
}
