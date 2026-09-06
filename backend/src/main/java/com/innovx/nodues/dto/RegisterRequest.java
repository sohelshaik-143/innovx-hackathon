package com.innovx.nodues.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Official email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    // Portal role: "STUDENT", "STAFF", "HEAD", "ADMIN"
    @NotBlank(message = "Portal role selection is required")
    private String portalRole;

    // Student specific particulars
    private String studentId;        // e.g. STU-2024-055
    private String rollNo;           // e.g. 2024CS089
    private String program;          // e.g. B.Tech Computer Science & Engineering
    private String batchYear;        // e.g. 2022-2026
    private String academicDepartment;
    private String phoneNumber;

    // Department Staff / Head specific particulars
    private String departmentId;     // Department UUID
    private String designation;      // e.g. Verification Officer / Assistant Warden / Dean
}
