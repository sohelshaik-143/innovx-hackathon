package com.innovx.nodues.security;

import com.innovx.nodues.domain.enums.RoleType;
import com.innovx.nodues.domain.entity.DepartmentStaff;
import com.innovx.nodues.domain.entity.Student;
import com.innovx.nodues.domain.entity.User;
import com.innovx.nodues.repository.DepartmentStaffRepository;
import com.innovx.nodues.repository.StudentRepository;
import com.innovx.nodues.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final DepartmentStaffRepository departmentStaffRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + username));

        String studentId = null;
        String departmentId = null;
        String departmentCode = null;
        boolean isHead = false;

        boolean isStaffOrHead = user.getRoles() != null && user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleType.ROLE_DEPARTMENT_STAFF || r.getName() == RoleType.ROLE_DEPARTMENT_HEAD);
        boolean isAdmin = user.getRoles() != null && user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleType.ROLE_ADMIN);
        boolean isStudent = user.getRoles() != null && user.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleType.ROLE_STUDENT);

        var staffOpt = departmentStaffRepository.findByUserId(user.getId());
        if (staffOpt.isPresent()) {
            DepartmentStaff staff = staffOpt.get();
            departmentId = staff.getDepartment().getId();
            departmentCode = staff.getDepartment().getCode();
            isHead = staff.isHead();
        }

        // Only attach studentId if the user is explicitly a student and neither staff nor admin
        if (isStudent && !isStaffOrHead && !isAdmin) {
            var studentOpt = studentRepository.findByUserId(user.getId());
            if (studentOpt.isPresent()) {
                studentId = studentOpt.get().getId();
            }
        }

        return new UserPrincipal(user, studentId, departmentId, departmentCode, isHead);
    }
}
