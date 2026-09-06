package com.innovx.nodues.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
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
    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
    private String password;

    @NotBlank(message = "Full name is required")
    private String fullName;

    // Public self-registration is intentionally limited to student accounts.
    @NotBlank(message = "Portal role selection is required")
    @Pattern(regexp = "(?i)STUDENT", message = "Only student self-registration is allowed")
    private String portalRole;

    // Student specific particulars
    @NotBlank(message = "Institutional student ID is required")
    @Size(max = 50, message = "Student ID must be at most 50 characters")
    private String studentId;

    @NotBlank(message = "University roll number is required")
    @Size(max = 50, message = "Roll number must be at most 50 characters")
    private String rollNo;
    private String program;          // e.g. B.Tech Computer Science & Engineering
    private String batchYear;        // e.g. 2022-2026
    private String academicDepartment;
    private String phoneNumber;

    // Department Staff / Head specific particulars
    private String departmentId;     // Department UUID
    private String designation;      // e.g. Verification Officer / Assistant Warden / Dean
}
