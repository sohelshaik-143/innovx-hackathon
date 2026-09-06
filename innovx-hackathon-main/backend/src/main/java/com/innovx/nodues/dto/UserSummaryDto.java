package com.innovx.nodues.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private List<String> roles;
    private boolean active;
    private boolean demo;
    private String departmentId;
    private String departmentCode;
    private String departmentName;
    private boolean head;
    private String studentId;
    private String rollNo;
    private String program;
}
