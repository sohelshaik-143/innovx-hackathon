package com.innovx.nodues.service;

import com.innovx.nodues.domain.entity.*;
import com.innovx.nodues.domain.enums.EscalationLevel;
import com.innovx.nodues.domain.enums.NotificationType;
import com.innovx.nodues.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlaEscalationService {

    private final ClearanceTaskRepository taskRepository;
    private final EscalationRepository escalationRepository;
    private final DepartmentStaffRepository departmentStaffRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final InstitutionSettingRepository institutionSettingRepository;

    public int getConfiguredSlaHours() {
        return institutionSettingRepository.findBySettingKey("DEFAULT_SLA_HOURS")
                .map(s -> {
                    try {
                        return Integer.parseInt(s.getSettingValue());
                    } catch (NumberFormatException e) {
                        return 48;
                    }
                })
                .orElse(48); // 48 hours = 2 calendar days default
    }

    @Scheduled(fixedRate = 120000) // Check every 2 minutes
    @Transactional
    public int checkAndEscalateOverdueTasks() {
        LocalDateTime now = LocalDateTime.now();
        List<ClearanceTask> overdueTasks = taskRepository.findOverdueTasksToEscalate(now);

        if (overdueTasks.isEmpty()) {
            return 0;
        }

        log.info("Found {} overdue clearance tasks requiring escalation", overdueTasks.size());

        for (ClearanceTask task : overdueTasks) {
            escalateTask(task, now);
        }

        return overdueTasks.size();
    }

    @Transactional
    public void escalateTask(ClearanceTask task, LocalDateTime now) {
        task.setOverdue(true);
        task.setEscalatedAt(now);
        taskRepository.save(task);

        ClearanceRequest request = task.getClearanceRequest();
        Student student = request.getStudent();
        Department dept = task.getDepartment();

        // 1. Create Escalation record
        Escalation escalation = Escalation.builder()
                .task(task)
                .department(dept)
                .escalationLevel(EscalationLevel.DEPARTMENT_HEAD)
                .reason("Task SLA exceeded configured processing window (assigned at " + task.getAssignedAt() +
                        ", deadline was " + task.getDueAt() + ")")
                .triggeredAt(now)
                .createdAt(now)
                .build();
        escalationRepository.save(escalation);

        // 2. Notify Student
        notificationService.createNotification(
                student.getUser().getId(),
                request,
                "Clearance Processing Delayed",
                "Your " + dept.getName() + " clearance has exceeded the configured processing time and has been escalated to the department head.",
                NotificationType.SLA_EXCEEDED
        );

        // 3. Notify Department Staff
        if (task.getAssignedStaff() != null) {
            notificationService.createNotification(
                    task.getAssignedStaff().getId(),
                    request,
                    "URGENT: Overdue Clearance Task",
                    "Clearance task for " + student.getUser().getFullName() + " (" + student.getStudentId() +
                            ") is overdue and escalated.",
                    NotificationType.ESCALATION
            );
        }

        // 4. Notify Department Head(s)
        List<DepartmentStaff> heads = departmentStaffRepository.findByDepartmentIdAndHeadTrue(dept.getId());
        for (DepartmentStaff headStaff : heads) {
            notificationService.createNotification(
                    headStaff.getUser().getId(),
                    request,
                    "Escalation Alert: Overdue Task in " + dept.getName(),
                    "Task for student " + student.getUser().getFullName() + " (" + student.getStudentId() +
                            ") breached the 2-day SLA deadline.",
                    NotificationType.ESCALATION
            );
        }

        // 5. Immutable Audit Log
        auditLogService.logAction(
                "SYSTEM",
                "SYSTEM",
                "SYSTEM",
                dept.getCode(),
                "SLA_EXCEEDED_ESCALATED",
                "CLEARANCE_TASK",
                task.getId(),
                task.getStatus().name(),
                task.getStatus().name(),
                "Task exceeded SLA deadline. Escalated to Department Head.",
                "127.0.0.1"
        );
    }
}
