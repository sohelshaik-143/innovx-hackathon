package com.innovx.nodues.service;

import com.innovx.nodues.domain.entity.Department;
import com.innovx.nodues.domain.entity.Student;
import com.innovx.nodues.domain.entity.User;
import com.innovx.nodues.dto.AuthResponse;
import com.innovx.nodues.dto.LoginRequest;
import com.innovx.nodues.dto.UserSummaryDto;
import com.innovx.nodues.exception.ResourceNotFoundException;
import com.innovx.nodues.repository.DepartmentRepository;
import com.innovx.nodues.repository.StudentRepository;
import com.innovx.nodues.repository.UserRepository;
import com.innovx.nodues.security.JwtTokenProvider;
import com.innovx.nodues.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername().trim(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        String deptName = null;
        if (principal.getDepartmentId() != null) {
            deptName = departmentRepository.findById(principal.getDepartmentId())
                    .map(Department::getName)
                    .orElse(null);
        }

        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .userId(principal.getId())
                .username(principal.getUsername())
                .email(principal.getEmail())
                .fullName(principal.getFullName())
                .roles(roles)
                .studentId(principal.getStudentId())
                .departmentId(principal.getDepartmentId())
                .departmentCode(principal.getDepartmentCode())
                .departmentName(deptName)
                .isHead(principal.isHead())
                .isDemo(principal.isDemo())
                .build();
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getId()));

        String studentRoll = null;
        String studentProgram = null;
        if (principal.getStudentId() != null) {
            var studOpt = studentRepository.findById(principal.getStudentId());
            if (studOpt.isPresent()) {
                Student s = studOpt.get();
                studentRoll = s.getRollNo();
                studentProgram = s.getProgram();
            }
        }

        String deptName = null;
        if (principal.getDepartmentId() != null) {
            deptName = departmentRepository.findById(principal.getDepartmentId())
                    .map(Department::getName)
                    .orElse(null);
        }

        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).toList())
                .active(user.isActive())
                .demo(user.isDemo())
                .departmentId(principal.getDepartmentId())
                .departmentCode(principal.getDepartmentCode())
                .departmentName(deptName)
                .head(principal.isHead())
                .studentId(principal.getStudentId())
                .rollNo(studentRoll)
                .program(studentProgram)
                .build();
    }
}
