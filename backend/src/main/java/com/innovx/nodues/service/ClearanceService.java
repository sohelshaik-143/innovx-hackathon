package com.innovx.nodues.service;

import com.innovx.nodues.domain.entity.*;
import com.innovx.nodues.domain.enums.ClearanceStatus;
import com.innovx.nodues.domain.enums.NotificationType;
import com.innovx.nodues.domain.enums.TaskStatus;
import com.innovx.nodues.dto.*;
import com.innovx.nodues.exception.InvalidActionException;
import com.innovx.nodues.exception.ResourceNotFoundException;
import com.innovx.nodues.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClearanceService {

    private final ClearanceRequestRepository clearanceRequestRepository;
    private final ClearanceTaskRepository clearanceTaskRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final SlaEscalationService slaEscalationService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public ClearanceRequestDetailDto createRequest(String studentId, CreateClearanceRequestDto dto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found: " + studentId));

        // Enforce: Only ONE active clearance request at a time
        List<ClearanceStatus> activeStatuses = List.of(
                ClearanceStatus.PENDING,
                ClearanceStatus.IN_PROGRESS,
                ClearanceStatus.BLOCKED
        );
        Optional<ClearanceRequest> activeRequest = clearanceRequestRepository
                .findFirstByStudentIdAndOverallStatusInOrderByCreatedAtDesc(student.getId(), activeStatuses);

        if (activeRequest.isPresent()) {
            throw new InvalidActionException("You already have an active clearance request in progress (ID: " +
                    activeRequest.get().getId() + ").");
        }

        List<Department> activeDepartments = departmentRepository.findByActiveTrue();
        if (activeDepartments.isEmpty()) {
            throw new InvalidActionException("No active clearance departments configured in institution.");
        }

        LocalDateTime now = LocalDateTime.now();
        int slaHours = slaEscalationService.getConfiguredSlaHours();
        LocalDateTime deadline = now.plusHours(slaHours);

        ClearanceRequest request = ClearanceRequest.builder()
                .student(student)
                .academicYear(dto.getAcademicYear())
                .semester(dto.getSemester())
                .reason(dto.getReason())
                .overallStatus(ClearanceStatus.PENDING)
                .demo(student.getUser().isDemo())
                .createdAt(now)
                .build();

        for (Department dept : activeDepartments) {
            ClearanceTask task = ClearanceTask.builder()
                    .clearanceRequest(request)
                    .department(dept)
                    .status(TaskStatus.PENDING)
                    .assignedAt(now)
                    .dueAt(deadline)
                    .overdue(false)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            request.getTasks().add(task);
        }

        ClearanceRequest savedRequest = clearanceRequestRepository.save(request);

        // Initial Notification to Student
        notificationService.createNotification(
                student.getUser().getId(),
                savedRequest,
                "Clearance Request Submitted",
                "Your No-Dues clearance request has been submitted. " + activeDepartments.size() +
                        " department verification tasks have been created with a " + slaHours + "-hour SLA.",
                NotificationType.REQUEST_CREATED
        );

        // Audit Log
        auditLogService.logAction(
                student.getUser().getId(),
                student.getUser().getUsername(),
                "ROLE_STUDENT",
                null,
                "STUDENT_CREATED_REQUEST",
                "CLEARANCE_REQUEST",
                savedRequest.getId(),
                null,
                "PENDING",
                "Created clearance request with " + activeDepartments.size() + " tasks (SLA: " + slaHours + "h)",
                "127.0.0.1"
        );

        return getRequestDetails(savedRequest.getId());
    }

    @Transactional(readOnly = true)
    public ClearanceRequestDetailDto getMyActiveRequest(String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student record not found"));

        List<ClearanceRequest> requests = clearanceRequestRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
        if (requests.isEmpty()) {
            return null;
        }

        // Prioritize active, or return latest
        ClearanceRequest request = requests.stream()
                .filter(r -> r.getOverallStatus() == ClearanceStatus.PENDING ||
                             r.getOverallStatus() == ClearanceStatus.IN_PROGRESS ||
                             r.getOverallStatus() == ClearanceStatus.REJECTED ||
                             r.getOverallStatus() == ClearanceStatus.BLOCKED)
                .findFirst()
                .orElse(requests.getFirst());

        return mapToDetailDto(request);
    }

    @Transactional(readOnly = true)
    public List<ClearanceRequestSummaryDto> getMyRequests(String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return clearanceRequestRepository.findByStudentIdOrderByCreatedAtDesc(student.getId()).stream()
                .map(this::mapToSummaryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClearanceRequestDetailDto getRequestDetails(String requestId) {
        ClearanceRequest request = clearanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Clearance request not found: " + requestId));

        return mapToDetailDto(request);
    }

    public ClearanceRequestDetailDto mapToDetailDto(ClearanceRequest request) {
        Student student = request.getStudent();
        User user = student.getUser();

        int totalTasks = request.getTasks().size();
        long approvedCount = request.getTasks().stream().filter(t -> t.getStatus() == TaskStatus.APPROVED).count();
        double progress = totalTasks > 0 ? (double) approvedCount / totalTasks * 100.0 : 0.0;

        List<ClearanceTaskDto> taskDtos = request.getTasks().stream()
                .map(this::mapTaskToDto)
                .toList();

        List<ClearanceTimelineEventDto> timeline = buildTimeline(request);

        String certId = request.getCertificate() != null ? request.getCertificate().getId() : null;
        String certNum = request.getCertificate() != null ? request.getCertificate().getCertificateNumber() : null;
        String qrUrl = request.getCertificate() != null ? request.getCertificate().getQrVerificationUrl() : null;

        return ClearanceRequestDetailDto.builder()
                .id(request.getId())
                .studentId(student.getStudentId())
                .rollNo(student.getRollNo())
                .studentName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(student.getPhoneNumber())
                .program(student.getProgram())
                .batchYear(student.getBatchYear())
                .academicDepartment(student.getAcademicDepartment())
                .academicYear(request.getAcademicYear())
                .semester(request.getSemester())
                .reason(request.getReason())
                .overallStatus(request.getOverallStatus())
                .demo(request.isDemo())
                .createdAt(request.getCreatedAt())
                .completedAt(request.getCompletedAt())
                .totalTasks(totalTasks)
                .approvedTasks((int) approvedCount)
                .progressPercentage(Math.round(progress * 10.0) / 10.0)
                .tasks(taskDtos)
                .timeline(timeline)
                .certificateId(certId)
                .certificateNumber(certNum)
                .qrVerificationUrl(qrUrl)
                .build();
    }

    public ClearanceTaskDto mapTaskToDto(ClearanceTask task) {
        Department dept = task.getDepartment();

        ClearanceTaskDto.DelayInfoDto delayInfo = null;
        if (!task.getDelayReasons().isEmpty()) {
            DelayReason dr = task.getDelayReasons().getFirst();
            delayInfo = ClearanceTaskDto.DelayInfoDto.builder()
                    .id(dr.getId())
                    .category(dr.getCategory())
                    .explanation(dr.getExplanation())
                    .expectedResolutionDate(dr.getExpectedResolutionDate())
                    .nextAction(dr.getNextAction())
                    .recordedAt(dr.getCreatedAt())
                    .build();
        }

        ClearanceTaskDto.RejectionInfoDto rejInfo = null;
        if (!task.getRejectionReasons().isEmpty()) {
            RejectionReason rr = task.getRejectionReasons().getFirst();
            rejInfo = ClearanceTaskDto.RejectionInfoDto.builder()
                    .id(rr.getId())
                    .reasonTitle(rr.getReasonTitle())
                    .explanation(rr.getExplanation())
                    .requiredStudentAction(rr.getRequiredStudentAction())
                    .recordedAt(rr.getCreatedAt())
                    .build();
        }

        Student student = task.getClearanceRequest() != null ? task.getClearanceRequest().getStudent() : null;

        return ClearanceTaskDto.builder()
                .id(task.getId())
                .requestId(task.getClearanceRequest().getId())
                .departmentId(dept.getId())
                .departmentCode(dept.getCode())
                .departmentName(dept.getName())
                .officialEmail(dept.getOfficialEmail())
                .officeLocation(dept.getOfficeLocation())
                .officialPhone(dept.getOfficialPhone())
                .assignedStaffName(task.getAssignedStaff() != null ? task.getAssignedStaff().getFullName() : null)
                .status(task.getStatus())
                .assignedAt(task.getAssignedAt())
                .dueAt(task.getDueAt())
                .completedAt(task.getCompletedAt())
                .overdue(task.isOverdue())
                .escalatedAt(task.getEscalatedAt())
                .verificationRemarks(task.getVerificationRemarks())
                .referenceNumber(task.getReferenceNumber())
                .studentName(student != null && student.getUser() != null ? student.getUser().getFullName() : null)
                .studentIdNumber(student != null ? student.getStudentId() : null)
                .studentRollNo(student != null ? student.getRollNo() : null)
                .studentProgram(student != null ? student.getProgram() : null)
                .delayInfo(delayInfo)
                .rejectionInfo(rejInfo)
                .build();
    }

    public ClearanceRequestSummaryDto mapToSummaryDto(ClearanceRequest r) {
        int total = r.getTasks().size();
        int approved = (int) r.getTasks().stream().filter(t -> t.getStatus() == TaskStatus.APPROVED).count();
        int delayed = (int) r.getTasks().stream().filter(t -> t.getStatus() == TaskStatus.DELAYED).count();
        int rejected = (int) r.getTasks().stream().filter(t -> t.getStatus() == TaskStatus.REJECTED).count();
        int pending = (int) r.getTasks().stream().filter(t -> t.getStatus() == TaskStatus.PENDING).count();

        return ClearanceRequestSummaryDto.builder()
                .id(r.getId())
                .studentId(r.getStudent().getStudentId())
                .rollNo(r.getStudent().getRollNo())
                .studentName(r.getStudent().getUser().getFullName())
                .program(r.getStudent().getProgram())
                .academicYear(r.getAcademicYear())
                .semester(r.getSemester())
                .reason(r.getReason())
                .overallStatus(r.getOverallStatus())
                .totalTasks(total)
                .approvedTasks(approved)
                .delayedTasks(delayed)
                .rejectedTasks(rejected)
                .pendingTasks(pending)
                .demo(r.isDemo())
                .createdAt(r.getCreatedAt())
                .completedAt(r.getCompletedAt())
                .certificateId(r.getCertificate() != null ? r.getCertificate().getId() : null)
                .certificateNumber(r.getCertificate() != null ? r.getCertificate().getCertificateNumber() : null)
                .build();
    }

    private List<ClearanceTimelineEventDto> buildTimeline(ClearanceRequest request) {
        List<ClearanceTimelineEventDto> events = new ArrayList<>();

        // 1. Initial Request Event
        events.add(ClearanceTimelineEventDto.builder()
                .id(UUID.randomUUID().toString())
                .timestamp(request.getCreatedAt())
                .eventType("REQUEST_CREATED")
                .title("No-Dues Clearance Request Initiated")
                .description("Student submitted formal clearance request for " + request.getReason())
                .actorName(request.getStudent().getUser().getFullName())
                .status("PENDING")
                .build());

        // 2. Department Assignment
        events.add(ClearanceTimelineEventDto.builder()
                .id(UUID.randomUUID().toString())
                .timestamp(request.getCreatedAt().plusSeconds(1))
                .eventType("DEPARTMENTS_ASSIGNED")
                .title("Department Tasks Created & Assigned")
                .description(request.getTasks().size() + " clearance tasks dispatched under 2-day SLA")
                .actorName("Governance Engine")
                .status("PENDING")
                .build());

        // 3. Task Status History & Actions
        for (ClearanceTask task : request.getTasks()) {
            for (ClearanceStatusHistory h : task.getStatusHistory()) {
                events.add(ClearanceTimelineEventDto.builder()
                        .id(h.getId())
                        .timestamp(h.getCreatedAt())
                        .eventType("STATUS_CHANGE")
                        .departmentName(task.getDepartment().getName())
                        .title(task.getDepartment().getName() + " Status: " + h.getNewStatus())
                        .description(h.getRemarks() != null ? h.getRemarks() : "Transitioned from " + h.getOldStatus() + " to " + h.getNewStatus())
                        .actorName(h.getChangedByUser().getFullName())
                        .status(h.getNewStatus().name())
                        .build());
            }

            for (DelayReason d : task.getDelayReasons()) {
                events.add(ClearanceTimelineEventDto.builder()
                        .id(d.getId())
                        .timestamp(d.getCreatedAt())
                        .eventType("DELAY_RECORDED")
                        .departmentName(task.getDepartment().getName())
                        .title(task.getDepartment().getName() + " Marked Delayed (" + d.getCategory() + ")")
                        .description(d.getExplanation() + " | Expected resolution: " + d.getExpectedResolutionDate() + " | Next action: " + d.getNextAction())
                        .actorName(d.getRecordedByUser().getFullName())
                        .status("DELAYED")
                        .build());
            }

            for (RejectionReason r : task.getRejectionReasons()) {
                events.add(ClearanceTimelineEventDto.builder()
                        .id(r.getId())
                        .timestamp(r.getCreatedAt())
                        .eventType("REJECTION_RECORDED")
                        .departmentName(task.getDepartment().getName())
                        .title(task.getDepartment().getName() + " Rejected: " + r.getReasonTitle())
                        .description(r.getExplanation() + " | Required Action: " + r.getRequiredStudentAction())
                        .actorName(r.getRecordedByUser().getFullName())
                        .status("REJECTED")
                        .build());
            }

            for (Escalation e : task.getEscalations()) {
                events.add(ClearanceTimelineEventDto.builder()
                        .id(e.getId())
                        .timestamp(e.getTriggeredAt())
                        .eventType("ESCALATION")
                        .departmentName(task.getDepartment().getName())
                        .title("SLA Breach: Escalated to " + e.getEscalationLevel())
                        .description(e.getReason())
                        .actorName("SLA Engine")
                        .status("OVERDUE")
                        .build());
            }
        }

        // 4. Certificate Completion Event
        if (request.getCertificate() != null) {
            events.add(ClearanceTimelineEventDto.builder()
                    .id(request.getCertificate().getId())
                    .timestamp(request.getCertificate().getIssueDate())
                    .eventType("CERTIFICATE_ISSUED")
                    .title("No-Dues Certificate Issued (" + request.getCertificate().getCertificateNumber() + ")")
                    .description("All departments verified and approved. Digitally verifiable certificate generated.")
                    .actorName("Apex Certification Authority")
                    .status("COMPLETED")
                    .build());
        }

        // Sort chronologically ascending
        events.sort(Comparator.comparing(ClearanceTimelineEventDto::getTimestamp));
        return events;
    }
}
