package com.innovx.nodues.service;

import com.innovx.nodues.domain.entity.*;
import com.innovx.nodues.domain.enums.ClearanceStatus;
import com.innovx.nodues.domain.enums.TaskStatus;
import com.innovx.nodues.dto.*;
import com.innovx.nodues.exception.ResourceNotFoundException;
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
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final ClearanceRequestRepository requestRepository;
    private final ClearanceTaskRepository taskRepository;
    private final DepartmentRepository departmentRepository;
    private final DepartmentStaffRepository departmentStaffRepository;
    private final EscalationRepository escalationRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final InstitutionSettingRepository institutionSettingRepository;
    private final SlaEscalationService slaEscalationService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        long totalRequests = requestRepository.count();
        long activeRequests = requestRepository.countByOverallStatus(ClearanceStatus.PENDING) +
                requestRepository.countByOverallStatus(ClearanceStatus.IN_PROGRESS);
        long completedRequests = requestRepository.countByOverallStatus(ClearanceStatus.COMPLETED);
        long pendingRequests = requestRepository.countByOverallStatus(ClearanceStatus.PENDING);
        long rejectedRequests = requestRepository.countByOverallStatus(ClearanceStatus.REJECTED);
        long overdueRequests = taskRepository.countByOverdueTrue();
        long activeEscalations = escalationRepository.countByResolvedAtIsNull();
        int slaHours = slaEscalationService.getConfiguredSlaHours();

        List<Department> departments = departmentRepository.findByActiveTrue();
        List<DepartmentKpiDto> deptKpis = new ArrayList<>();

        for (Department dept : departments) {
            deptKpis.add(getDepartmentKpi(dept.getId()));
        }

        return AdminDashboardStatsDto.builder()
                .totalActiveRequests(activeRequests)
                .completedRequests(completedRequests)
                .pendingRequests(pendingRequests)
                .rejectedRequests(rejectedRequests)
                .overdueRequests(overdueRequests)
                .activeEscalations(activeEscalations)
                .configuredSlaHours(slaHours)
                .hasSufficientData(totalRequests > 0)
                .departmentPerformance(deptKpis)
                .build();
    }

    @Transactional(readOnly = true)
    public DepartmentKpiDto getDepartmentKpi(String departmentId) {
        Department dept = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + departmentId));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

        long pending = taskRepository.countByDepartmentIdAndStatus(departmentId, TaskStatus.PENDING);
        long dueToday = taskRepository.countDueToday(departmentId, startOfDay, endOfDay);
        long overdue = taskRepository.countByDepartmentIdAndOverdueTrue(departmentId);
        long delayed = taskRepository.countByDepartmentIdAndStatus(departmentId, TaskStatus.DELAYED);
        long approved = taskRepository.countByDepartmentIdAndStatus(departmentId, TaskStatus.APPROVED);
        long rejected = taskRepository.countByDepartmentIdAndStatus(departmentId, TaskStatus.REJECTED);
        long unresolvedEscalations = escalationRepository.countByDepartmentIdAndResolvedAtIsNull(departmentId);

        return DepartmentKpiDto.builder()
                .departmentId(dept.getId())
                .departmentCode(dept.getCode())
                .departmentName(dept.getName())
                .pendingCount(pending)
                .dueTodayCount(dueToday)
                .overdueCount(overdue)
                .delayedCount(delayed)
                .approvedCount(approved)
                .rejectedCount(rejected)
                .unresolvedEscalationsCount(unresolvedEscalations)
                .build();
    }

    @Transactional(readOnly = true)
    public SlaConfigDto getSlaConfig() {
        int hours = slaEscalationService.getConfiguredSlaHours();
        String instName = getSettingValue("INSTITUTION_NAME", "Apex Institute of Technology");
        String portalUrl = getSettingValue("PORTAL_BASE_URL", "http://localhost:5173");
        String supportEmail = getSettingValue("SUPPORT_EMAIL", "governance@campus.edu");

        return SlaConfigDto.builder()
                .slaHours(hours)
                .institutionName(instName)
                .portalBaseUrl(portalUrl)
                .supportEmail(supportEmail)
                .build();
    }

    @Transactional
    public SlaConfigDto updateSlaConfig(SlaConfigDto dto, UserPrincipal adminPrincipal) {
        int oldHours = slaEscalationService.getConfiguredSlaHours();

        saveOrUpdateSetting("DEFAULT_SLA_HOURS", String.valueOf(dto.getSlaHours()),
                "Default SLA deadline for department verification in hours", adminPrincipal.getId());

        if (dto.getInstitutionName() != null) {
            saveOrUpdateSetting("INSTITUTION_NAME", dto.getInstitutionName(),
                    "Official institutional legal name for certificates", adminPrincipal.getId());
        }

        if (dto.getPortalBaseUrl() != null) {
            saveOrUpdateSetting("PORTAL_BASE_URL", dto.getPortalBaseUrl(),
                    "Public portal base URL for certificate verification links", adminPrincipal.getId());
        }

        if (dto.getSupportEmail() != null) {
            saveOrUpdateSetting("SUPPORT_EMAIL", dto.getSupportEmail(),
                    "Institutional clearance administrative support contact email", adminPrincipal.getId());
        }

        auditLogService.logAction(
                adminPrincipal.getId(),
                adminPrincipal.getUsername(),
                "ROLE_ADMIN",
                null,
                "ADMIN_CHANGED_SLA",
                "SETTING",
                "DEFAULT_SLA_HOURS",
                String.valueOf(oldHours),
                String.valueOf(dto.getSlaHours()),
                "Updated SLA processing window from " + oldHours + "h to " + dto.getSlaHours() + "h",
                "127.0.0.1"
        );

        return getSlaConfig();
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapDepartmentToDto)
                .toList();
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto, UserPrincipal adminPrincipal) {
        Department dept = Department.builder()
                .code(dto.getCode().toUpperCase())
                .name(dto.getName())
                .description(dto.getDescription())
                .officialEmail(dto.getOfficialEmail())
                .officeLocation(dto.getOfficeLocation())
                .officialPhone(dto.getOfficialPhone())
                .active(dto.isActive())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Department saved = departmentRepository.save(dept);

        auditLogService.logAction(
                adminPrincipal.getId(),
                adminPrincipal.getUsername(),
                "ROLE_ADMIN",
                saved.getCode(),
                "ADMIN_CREATED_DEPARTMENT",
                "DEPARTMENT",
                saved.getId(),
                null,
                "ACTIVE",
                "Created clearance department: " + saved.getName(),
                "127.0.0.1"
        );

        return mapDepartmentToDto(saved);
    }

    @Transactional
    public DepartmentDto updateDepartment(String id, DepartmentDto dto, UserPrincipal adminPrincipal) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found: " + id));

        dept.setName(dto.getName());
        dept.setDescription(dto.getDescription());
        dept.setOfficialEmail(dto.getOfficialEmail());
        dept.setOfficeLocation(dto.getOfficeLocation());
        dept.setOfficialPhone(dto.getOfficialPhone());
        dept.setActive(dto.isActive());
        dept.setUpdatedAt(LocalDateTime.now());

        Department saved = departmentRepository.save(dept);

        auditLogService.logAction(
                adminPrincipal.getId(),
                adminPrincipal.getUsername(),
                "ROLE_ADMIN",
                saved.getCode(),
                "ADMIN_UPDATED_DEPARTMENT",
                "DEPARTMENT",
                saved.getId(),
                null,
                saved.isActive() ? "ACTIVE" : "INACTIVE",
                "Updated clearance department details: " + saved.getName(),
                "127.0.0.1"
        );

        return mapDepartmentToDto(saved);
    }

    @Transactional(readOnly = true)
    public Page<Escalation> getAllEscalations(Pageable pageable) {
        return escalationRepository.findAllByOrderByTriggeredAtDesc(pageable);
    }

    @Transactional
    public void resolveEscalation(String escalationId, String notes, UserPrincipal principal) {
        Escalation escalation = escalationRepository.findById(escalationId)
                .orElseThrow(() -> new ResourceNotFoundException("Escalation not found: " + escalationId));

        User resolver = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        escalation.setResolvedAt(LocalDateTime.now());
        escalation.setResolvedByUser(resolver);
        escalation.setResolutionNotes(notes);
        escalationRepository.save(escalation);

        auditLogService.logAction(
                principal.getId(),
                principal.getUsername(),
                principal.getAuthorities().iterator().next().getAuthority(),
                escalation.getDepartment().getCode(),
                "ESCALATION_RESOLVED",
                "ESCALATION",
                escalation.getId(),
                "TRIGGERED",
                "RESOLVED",
                "Escalation resolved: " + notes,
                "127.0.0.1"
        );
    }

    @Transactional(readOnly = true)
    public Page<UserSummaryDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapUserToDto);
    }

    private UserSummaryDto mapUserToDto(User user) {
        String deptId = null;
        String deptCode = null;
        String deptName = null;
        boolean isHead = false;

        var staffOpt = departmentStaffRepository.findByUserId(user.getId());
        if (staffOpt.isPresent()) {
            DepartmentStaff staff = staffOpt.get();
            deptId = staff.getDepartment().getId();
            deptCode = staff.getDepartment().getCode();
            deptName = staff.getDepartment().getName();
            isHead = staff.isHead();
        }

        String studentId = null;
        String rollNo = null;
        String program = null;
        var studOpt = studentRepository.findByUserId(user.getId());
        if (studOpt.isPresent()) {
            Student s = studOpt.get();
            studentId = s.getStudentId();
            rollNo = s.getRollNo();
            program = s.getProgram();
        }

        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(user.getRoles().stream().map(r -> r.getName().name()).toList())
                .active(user.isActive())
                .demo(user.isDemo())
                .departmentId(deptId)
                .departmentCode(deptCode)
                .departmentName(deptName)
                .head(isHead)
                .studentId(studentId)
                .rollNo(rollNo)
                .program(program)
                .build();
    }

    private DepartmentDto mapDepartmentToDto(Department d) {
        return DepartmentDto.builder()
                .id(d.getId())
                .code(d.getCode())
                .name(d.getName())
                .description(d.getDescription())
                .officialEmail(d.getOfficialEmail())
                .officeLocation(d.getOfficeLocation())
                .officialPhone(d.getOfficialPhone())
                .active(d.isActive())
                .build();
    }

    private void saveOrUpdateSetting(String key, String value, String desc, String updatedBy) {
        InstitutionSetting setting = institutionSettingRepository.findBySettingKey(key)
                .orElse(InstitutionSetting.builder()
                        .settingKey(key)
                        .description(desc)
                        .build());

        setting.setSettingValue(value);
        setting.setUpdatedBy(updatedBy);
        setting.setUpdatedAt(LocalDateTime.now());
        institutionSettingRepository.save(setting);
    }

    private String getSettingValue(String key, String defaultValue) {
        return institutionSettingRepository.findBySettingKey(key)
                .map(InstitutionSetting::getSettingValue)
                .orElse(defaultValue);
    }
}
