package com.innovx.nodues.service;

import com.innovx.nodues.domain.entity.Department;
import com.innovx.nodues.domain.entity.DepartmentStaff;
import com.innovx.nodues.domain.entity.Role;
import com.innovx.nodues.domain.entity.Student;
import com.innovx.nodues.domain.entity.User;
import com.innovx.nodues.domain.enums.RoleType;
import com.innovx.nodues.dto.AuthResponse;
import com.innovx.nodues.dto.LoginRequest;
import com.innovx.nodues.dto.RegisterRequest;
import com.innovx.nodues.dto.UserSummaryDto;
import com.innovx.nodues.exception.InvalidActionException;
import com.innovx.nodues.exception.ResourceNotFoundException;
import com.innovx.nodues.repository.DepartmentRepository;
import com.innovx.nodues.repository.DepartmentStaffRepository;
import com.innovx.nodues.repository.RoleRepository;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final DepartmentStaffRepository departmentStaffRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String trimmedUsername = request.getUsername().trim();
        String trimmedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByUsername(trimmedUsername)) {
            throw new InvalidActionException("Username '" + trimmedUsername + "' is already registered in the system.");
        }
        if (userRepository.existsByEmail(trimmedEmail)) {
            throw new InvalidActionException("Email address '" + trimmedEmail + "' is already in use.");
        }

        RoleType roleType;
        String portalRole = request.getPortalRole().toUpperCase().trim();
        switch (portalRole) {
            case "STUDENT" -> roleType = RoleType.ROLE_STUDENT;
            case "STAFF" -> roleType = RoleType.ROLE_DEPARTMENT_STAFF;
            case "HEAD" -> roleType = RoleType.ROLE_DEPARTMENT_HEAD;
            case "ADMIN" -> roleType = RoleType.ROLE_ADMIN;
            default -> throw new InvalidActionException("Invalid portal role specified: " + request.getPortalRole());
        }

        Role assignedRole = roleRepository.findByName(roleType)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleType));

        String[] nameParts = request.getFullName().trim().split("\\s+", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        User user = User.builder()
                .username(trimmedUsername)
                .email(trimmedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(firstName)
                .lastName(lastName)
                .active(true)
                .demo(false)
                .roles(new HashSet<>(Set.of(assignedRole)))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.saveAndFlush(user);

        if (roleType == RoleType.ROLE_STUDENT) {
            String stuId = request.getStudentId() != null && !request.getStudentId().isBlank()
                    ? request.getStudentId().trim()
                    : "STU-" + System.currentTimeMillis() % 100000;
            String roll = request.getRollNo() != null && !request.getRollNo().isBlank()
                    ? request.getRollNo().trim()
                    : "2024" + stuId.replace("STU-", "");

            if (studentRepository.existsByStudentId(stuId)) {
                throw new InvalidActionException("Student ID '" + stuId + "' is already registered in the system.");
            }
            if (studentRepository.existsByRollNo(roll)) {
                throw new InvalidActionException("Roll Number '" + roll + "' is already registered in the system.");
            }

            String prog = request.getProgram() != null && !request.getProgram().isBlank()
                    ? request.getProgram().trim()
                    : "B.Tech Engineering Program";
            String batch = request.getBatchYear() != null && !request.getBatchYear().isBlank()
                    ? request.getBatchYear().trim()
                    : "2022-2026";
            String acadDept = request.getAcademicDepartment() != null && !request.getAcademicDepartment().isBlank()
                    ? request.getAcademicDepartment().trim()
                    : "Computer Science";

            Student student = Student.builder()
                    .user(savedUser)
                    .studentId(stuId)
                    .rollNo(roll)
                    .program(prog)
                    .batchYear(batch)
                    .academicDepartment(acadDept)
                    .phoneNumber(request.getPhoneNumber())
                    .build();
            studentRepository.saveAndFlush(student);
        } else if (roleType == RoleType.ROLE_DEPARTMENT_STAFF || roleType == RoleType.ROLE_DEPARTMENT_HEAD) {
            Department dept = null;
            if (request.getDepartmentId() != null && !request.getDepartmentId().isBlank()) {
                dept = departmentRepository.findById(request.getDepartmentId())
                        .or(() -> departmentRepository.findByCode(request.getDepartmentId()))
                        .orElse(null);
            }
            if (dept == null) {
                dept = departmentRepository.findAll().stream().findFirst().orElse(null);
            }

            if (dept != null) {
                DepartmentStaff staff = DepartmentStaff.builder()
                        .user(savedUser)
                        .department(dept)
                        .head(roleType == RoleType.ROLE_DEPARTMENT_HEAD)
                        .designation(request.getDesignation() != null && !request.getDesignation().isBlank()
                                ? request.getDesignation().trim()
                                : (roleType == RoleType.ROLE_DEPARTMENT_HEAD ? "Department Head" : "Clearance Verification Officer"))
                        .createdAt(LocalDateTime.now())
                        .build();
                departmentStaffRepository.saveAndFlush(staff);
            }
        }

        return login(new LoginRequest(trimmedUsername, request.getPassword()));
    }

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
        var studOpt = studentRepository.findByUserId(user.getId())
                .or(() -> principal.getStudentId() != null ? studentRepository.findById(principal.getStudentId()) : java.util.Optional.empty())
                .or(() -> principal.getStudentId() != null ? studentRepository.findByStudentId(principal.getStudentId()) : java.util.Optional.empty());
        if (studOpt.isPresent()) {
            Student s = studOpt.get();
            studentRoll = s.getRollNo();
            studentProgram = s.getProgram();
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
