package com.innovx.nodues.security;

import com.innovx.nodues.domain.entity.ClearanceRequest;
import com.innovx.nodues.domain.entity.ClearanceTask;
import com.innovx.nodues.repository.ClearanceRequestRepository;
import com.innovx.nodues.repository.ClearanceTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service("deptSecurity")
@RequiredArgsConstructor
public class DepartmentSecurityService {

    private final ClearanceTaskRepository taskRepository;
    private final ClearanceRequestRepository requestRepository;

    public boolean canAccessTask(String taskId, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return false;
        }

        // Admin can access everything
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }

        ClearanceTask task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            return false;
        }

        // Department staff and head can only access tasks belonging to their assigned department
        if (principal.getDepartmentId() != null) {
            return principal.getDepartmentId().equals(task.getDepartment().getId());
        }

        // Student can view task details if it belongs to their own request
        if (principal.getStudentId() != null) {
            return principal.getStudentId().equals(task.getClearanceRequest().getStudent().getId());
        }

        return false;
    }

    public boolean canAccessRequest(String requestId, Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            return false;
        }

        // Admin can access all
        if (principal.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }

        ClearanceRequest request = requestRepository.findById(requestId).orElse(null);
        if (request == null) {
            return false;
        }

        // Student can only access their own request
        if (principal.getStudentId() != null) {
            return principal.getStudentId().equals(request.getStudent().getId());
        }

        // Staff / Head can view requests if their department has a task in it
        if (principal.getDepartmentId() != null) {
            return request.getTasks().stream()
                    .anyMatch(t -> t.getDepartment().getId().equals(principal.getDepartmentId()));
        }

        return false;
    }
}
