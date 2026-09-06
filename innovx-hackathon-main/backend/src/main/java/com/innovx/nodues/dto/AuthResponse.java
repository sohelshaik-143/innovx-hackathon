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
public class AuthResponse {
    private String token;
    private String type;
    private String userId;
    private String username;
    private String email;
    private String fullName;
    private List<String> roles;
    private String studentId;
    private String departmentId;
    private String departmentCode;
    private String departmentName;
    private boolean isHead;
    private boolean isDemo;
}
