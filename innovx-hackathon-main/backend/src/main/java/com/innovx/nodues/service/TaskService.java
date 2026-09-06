package com.innovx.nodues.service;

import com.innovx.nodues.domain.entity.*;
import com.innovx.nodues.domain.enums.ClearanceStatus;
import com.innovx.nodues.domain.enums.NotificationType;
import com.innovx.nodues.domain.enums.TaskStatus;
import com.innovx.nodues.dto.*;
import com.innovx.nodues.exception.InvalidActionException;
import com.innovx.nodues.exception.ResourceNotFoundException;
import com.innovx.nodues.exception.UnauthorizedException;
import com.innovx.nodues.repository.*;
import com.innovx.nodues.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final ClearanceTaskRepository taskRepository;
    private final ClearanceRequestRepository requestRepository;
    private final ClearanceStatusHistoryRepository historyRepository;
    private final DelayReasonRepository delayReasonRepository;
    private final RejectionReasonRepository rejectionReasonRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final CertificateService certificateService;
    private final ClearanceService clearanceService;

    @Transactional(readOnly = true)
    public Page<ClearanceTaskDto> getDepartmentTasks(String departmentId, TaskStatus status,
                                                     Boolean isOverdue, String search, Pageable pageable) {
        return taskRepository.searchDepartmentTasks(departmentId, status, isOverdue, search, pageable)
                .map(clearanceService::mapTaskToDto);
    }

    @Transactional(readOnly = true)
    public ClearanceTaskDto getTaskDetails(String taskId) {
        ClearanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Clearance task not found: " + taskId));
        return clearanceService.mapTaskToDto(task);
    }

    @Transactional
    public ClearanceTaskDto approveTask(String taskId, UserPrincipal principal, ApproveTaskDto dto) {
        ClearanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        validateDepartmentAccess(task, principal);

        if (task.getStatus() == TaskStatus.APPROVED) {
            throw new InvalidActionException("This task has already been approved.");
        }

        User staffUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getId()));

        LocalDateTime now = LocalDateTime.now();
        TaskStatus oldStatus = task.getStatus();

        task.setStatus(TaskStatus.APPROVED);
        task.setCompletedAt(now);
        task.setAssignedStaff(staffUser);
        task.setVerificationRemarks(dto.getVerificationRemarks());
        task.setReferenceNumber(dto.getReferenceNumber());
        task.setUpdatedAt(now);

        // Record history
        ClearanceStatusHistory history = ClearanceStatusHistory.builder()
                .task(task)
                .changedByUser(staffUser)
                .oldStatus(oldStatus)
                .newStatus(TaskStatus.APPROVED)
                .remarks("Verification approved by " + staffUser.getFullName() +
                        (dto.getVerificationRemarks() != null ? ": " + dto.getVerificationRemarks() : ""))
                .createdAt(now)
                .build();
        task.getStatusHistory().add(history);

        taskRepository.save(task);

        ClearanceRequest request = task.getClearanceRequest();
        Student student = request.getStudent();

        // Audit Log
        auditLogService.logAction(
                principal.getId(),
                principal.getUsername(),
                "ROLE_DEPARTMENT_STAFF",
                task.getDepartment().getCode(),
                "STAFF_APPROVED_REQUEST",
                "CLEARANCE_TASK",
                task.getId(),
                oldStatus.name(),
                TaskStatus.APPROVED.name(),
                "Approved clearance for " + student.getUser().getFullName() + " (" + student.getStudentId() + ")",
                "127.0.0.1"
        );

        // Notify Student
        notificationService.createNotification(
                student.getUser().getId(),
                request,
                task.getDepartment().getName() + " Approved",
                "Your clearance has been verified and approved by the " + task.getDepartment().getName() + " office.",
                NotificationType.TASK_APPROVED
        );

        // Check if ALL department tasks are now approved
        boolean allApproved = request.getTasks().stream()
                .allMatch(t -> t.getStatus() == TaskStatus.APPROVED);

        if (allApproved) {
            request.setOverallStatus(ClearanceStatus.COMPLETED);
            request.setCompletedAt(now);
            requestRepository.save(request);

            // Automatically generate No-Dues Certificate!
            try {
                certificateService.generateCertificate(request);

                notificationService.createNotification(
                        student.getUser().getId(),
                        request,
                        "No-Dues Certificate Ready!",
                        "Congratulations! All institutional departments have approved your clearance. Your official No-Dues Certificate is ready to view and download.",
                        NotificationType.CERTIFICATE_READY
                );
            } catch (Exception ex) {
                log.error("Certificate generation error for completed request {}", request.getId(), ex);
            }
        } else {
            if (request.getOverallStatus() == ClearanceStatus.PENDING) {
                request.setOverallStatus(ClearanceStatus.IN_PROGRESS);
                requestRepository.save(request);
            }
        }

        return clearanceService.mapTaskToDto(task);
    }

    @Transactional
    public ClearanceTaskDto rejectTask(String taskId, UserPrincipal principal, RejectTaskDto dto) {
        ClearanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        validateDepartmentAccess(task, principal);

        User staffUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getId()));

        LocalDateTime now = LocalDateTime.now();
        TaskStatus oldStatus = task.getStatus();

        task.setStatus(TaskStatus.REJECTED);
        task.setAssignedStaff(staffUser);
        task.setUpdatedAt(now);

        // Record Mandatory Rejection Reason
        RejectionReason rejectionReason = RejectionReason.builder()
                .task(task)
                .recordedByUser(staffUser)
                .reasonTitle(dto.getReasonTitle())
                .explanation(dto.getExplanation())
                .requiredStudentAction(dto.getRequiredStudentAction())
                .createdAt(now)
                .build();
        task.getRejectionReasons().add(rejectionReason);

        // Record history
        ClearanceStatusHistory history = ClearanceStatusHistory.builder()
                .task(task)
                .changedByUser(staffUser)
                .oldStatus(oldStatus)
                .newStatus(TaskStatus.REJECTED)
                .remarks("Rejected: " + dto.getReasonTitle() + " | " + dto.getExplanation())
                .createdAt(now)
                .build();
        task.getStatusHistory().add(history);

        taskRepository.save(task);

        ClearanceRequest request = task.getClearanceRequest();
        request.setOverallStatus(ClearanceStatus.REJECTED);
        requestRepository.save(request);

        Student student = request.getStudent();

        // Audit Log
        auditLogService.logAction(
                principal.getId(),
                principal.getUsername(),
                "ROLE_DEPARTMENT_STAFF",
                task.getDepartment().getCode(),
                "STAFF_REJECTED_REQUEST",
                "CLEARANCE_TASK",
                task.getId(),
                oldStatus.name(),
                TaskStatus.REJECTED.name(),
                "Rejected with reason: " + dto.getReasonTitle() + ". Required student action: " + dto.getRequiredStudentAction(),
                "127.0.0.1"
        );

        // Notify Student
        notificationService.createNotification(
                student.getUser().getId(),
                request,
                task.getDepartment().getName() + " Clearance Requires Attention",
                "Your " + task.getDepartment().getName() + " clearance was rejected: " + dto.getReasonTitle() +
                        ". Action required: " + dto.getRequiredStudentAction(),
                NotificationType.TASK_REJECTED
        );

        return clearanceService.mapTaskToDto(task);
    }

    @Transactional
    public ClearanceTaskDto delayTask(String taskId, UserPrincipal principal, DelayTaskDto dto) {
        ClearanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        validateDepartmentAccess(task, principal);

        User staffUser = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + principal.getId()));

        LocalDateTime now = LocalDateTime.now();
        TaskStatus oldStatus = task.getStatus();

        task.setStatus(TaskStatus.DELAYED);
        task.setAssignedStaff(staffUser);
        task.setUpdatedAt(now);

        // Record Mandatory Delay Reason
        DelayReason delayReason = DelayReason.builder()
                .task(task)
                .recordedByUser(staffUser)
                .category(dto.getCategory())
                .explanation(dto.getExplanation())
                .expectedResolutionDate(dto.getExpectedResolutionDate())
                .nextAction(dto.getNextAction())
                .createdAt(now)
                .build();
        task.getDelayReasons().add(delayReason);

        // Record history
        ClearanceStatusHistory history = ClearanceStatusHistory.builder()
                .task(task)
                .changedByUser(staffUser)
                .oldStatus(oldStatus)
                .newStatus(TaskStatus.DELAYED)
                .remarks("Marked delayed (" + dto.getCategory() + "): " + dto.getExplanation())
                .createdAt(now)
                .build();
        task.getStatusHistory().add(history);

        taskRepository.save(task);

        ClearanceRequest request = task.getClearanceRequest();
        Student student = request.getStudent();

        // Audit Log
        auditLogService.logAction(
                principal.getId(),
                principal.getUsername(),
                "ROLE_DEPARTMENT_STAFF",
                task.getDepartment().getCode(),
                "STAFF_MARKED_DELAYED",
                "CLEARANCE_TASK",
                task.getId(),
                oldStatus.name(),
                TaskStatus.DELAYED.name(),
                "Delayed (" + dto.getCategory() + "): " + dto.getExplanation() + ". Expected by: " + dto.getExpectedResolutionDate(),
                "127.0.0.1"
        );

        // Notify Student
        notificationService.createNotification(
                student.getUser().getId(),
                request,
                task.getDepartment().getName() + " Clearance Delayed",
                "Your " + task.getDepartment().getName() + " clearance is delayed (" + dto.getCategory() +
                        "): " + dto.getExplanation() + ". Expected resolution: " + dto.getExpectedResolutionDate(),
                NotificationType.TASK_DELAYED
        );

        return clearanceService.mapTaskToDto(task);
    }

    @Transactional
    public ClearanceTaskDto reassignTask(String taskId, UserPrincipal principal, ReassignTaskDto dto) {
        ClearanceTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        User newStaff = userRepository.findById(dto.getStaffUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Target staff user not found: " + dto.getStaffUserId()));

        task.setAssignedStaff(newStaff);
        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(task);

        auditLogService.logAction(
                principal.getId(),
                principal.getUsername(),
                principal.getAuthorities().iterator().next().getAuthority(),
                task.getDepartment().getCode(),
                "ADMIN_REASSIGNED_REQUEST",
                "CLEARANCE_TASK",
                task.getId(),
                task.getStatus().name(),
                task.getStatus().name(),
                "Reassigned task to " + newStaff.getFullName() + (dto.getRemarks() != null ? " Remarks: " + dto.getRemarks() : ""),
                "127.0.0.1"
        );

        return clearanceService.mapTaskToDto(task);
    }

    private void validateDepartmentAccess(ClearanceTask task, UserPrincipal principal) {
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return;
        }

        if (principal.getDepartmentId() == null || !principal.getDepartmentId().equals(task.getDepartment().getId())) {
            throw new UnauthorizedException("Access Denied: You are only authorized to verify tasks assigned to your department (" +
                    (principal.getDepartmentCode() != null ? principal.getDepartmentCode() : "N/A") + ").");
        }
    }
}
