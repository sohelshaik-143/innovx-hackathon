package com.innovx.nodues.config;

import com.innovx.nodues.domain.entity.*;
import com.innovx.nodues.domain.enums.ClearanceStatus;
import com.innovx.nodues.domain.enums.DelayCategory;
import com.innovx.nodues.domain.enums.RoleType;
import com.innovx.nodues.domain.enums.TaskStatus;
import com.innovx.nodues.repository.*;
import com.innovx.nodues.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final DepartmentStaffRepository departmentStaffRepository;
    private final ClearanceRequestRepository clearanceRequestRepository;
    private final ClearanceTaskRepository clearanceTaskRepository;
    private final DelayReasonRepository delayReasonRepository;
    private final ClearanceStatusHistoryRepository historyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking institutional seed and demo environment data...");

        // Ensure baseline roles exist
        Role studentRole = getOrCreateRole(RoleType.ROLE_STUDENT, "Student");
        Role staffRole = getOrCreateRole(RoleType.ROLE_DEPARTMENT_STAFF, "Department Staff");
        Role headRole = getOrCreateRole(RoleType.ROLE_DEPARTMENT_HEAD, "Department Head");
        Role adminRole = getOrCreateRole(RoleType.ROLE_ADMIN, "Administrator");

        // 1. Seed Admin
        User adminUser = userRepository.findByUsername("admin").orElseGet(() -> {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@campus.edu")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .firstName("Campus")
                    .lastName("Administrator")
                    .active(true)
                    .demo(true)
                    .roles(new HashSet<>(Set.of(adminRole)))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return userRepository.save(admin);
        });

        // Self-heal admin user: ensure exact role and purge spurious student or staff entries
        if (adminUser.getRoles() == null || !adminUser.getRoles().contains(adminRole) || adminUser.getRoles().size() > 1) {
            adminUser.setRoles(new HashSet<>(Set.of(adminRole)));
            userRepository.save(adminUser);
        }
        studentRepository.findByUserId(adminUser.getId()).ifPresent(studentRepository::delete);
        departmentStaffRepository.findByUserId(adminUser.getId()).ifPresent(departmentStaffRepository::delete);

        // 2. Fetch / Ensure Departments
        Department library = departmentRepository.findByCode("LIBRARY").orElseGet(() -> departmentRepository.save(
                Department.builder().id("dept-library").code("LIBRARY").name("Central Library & Learning Resource Center")
                        .description("Verifies borrowed books, inter-library loans, journals, and overdue fines.")
                        .officialEmail("library.clearance@campus.edu").officeLocation("Central Library Building, Ground Floor, Desk 4")
                        .officialPhone("+1 (555) 234-5671").active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build()));

        Department hostels = departmentRepository.findByCode("HOSTELS").orElseGet(() -> departmentRepository.save(
                Department.builder().id("dept-hostels").code("HOSTELS").name("Hostel Administration & Student Housing")
                        .description("Verifies room clearance, mess bills, furniture handover, and hostel property.")
                        .officialEmail("housing.clearance@campus.edu").officeLocation("Student Residences Admin Block, Room 102")
                        .officialPhone("+1 (555) 234-5672").active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build()));

        Department sports = departmentRepository.findByCode("SPORTS").orElseGet(() -> departmentRepository.save(
                Department.builder().id("dept-sports").code("SPORTS").name("Sports & Athletics Department")
                        .description("Verifies issued sports equipment, gym memberships, and team kits.")
                        .officialEmail("athletics.clearance@campus.edu").officeLocation("Indoor Sports Complex, Office 12")
                        .officialPhone("+1 (555) 234-5673").active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build()));

        Department accounts = departmentRepository.findByCode("ACCOUNTS").orElseGet(() -> departmentRepository.save(
                Department.builder().id("dept-accounts").code("ACCOUNTS").name("Accounts & Financial Services Division")
                        .description("Verifies tuition fees, scholarship adjustments, lab security deposits, and dues.")
                        .officialEmail("accounts.clearance@campus.edu").officeLocation("Administrative Block, Counter 2B")
                        .officialPhone("+1 (555) 234-5674").active(true).createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build()));

        // 3. Seed Department Staff & Heads
        User libraryStaff = createStaffUser("staff.library", "staff123", "library.staff@campus.edu",
                "Eleanor", "Vance", staffRole, library, false, "Assistant Librarian");
        createStaffUser("head.library", "head123", "library.head@campus.edu",
                "Dr. Marcus", "Reed", headRole, library, true, "Chief Librarian");

        User hostelStaff = createStaffUser("staff.hostel", "staff123", "hostels.staff@campus.edu",
                "Rajesh", "Sharma", staffRole, hostels, false, "Hostel Warden Office Desk");
        createStaffUser("head.hostel", "head123", "hostels.head@campus.edu",
                "Prof. Anita", "Rao", headRole, hostels, true, "Dean of Student Residences");

        createStaffUser("staff.sports", "staff123", "sports.staff@campus.edu",
                "David", "Miller", staffRole, sports, false, "Sports Officer");
        createStaffUser("head.sports", "head123", "sports.head@campus.edu",
                "Col. Vikram", "Singh", headRole, sports, true, "Director of Physical Education");

        createStaffUser("staff.accounts", "staff123", "accounts.staff@campus.edu",
                "Priya", "Nair", staffRole, accounts, false, "Senior Accounts Officer");
        createStaffUser("head.accounts", "head123", "accounts.head@campus.edu",
                "S. K.", "Gupta", headRole, accounts, true, "Chief Financial Officer");

        // 4. Seed Students
        Student studentAlex = createStudent("student.alex", "student123", "alex.rivera@student.campus.edu",
                "Alex", "Rivera", studentRole, "STU-2024-001", "2022CS0142",
                "B.Tech Computer Science & Engineering", "2022-2026", "Computer Science", "+1 (555) 019-2831");

        createStudent("student.sarah", "student123", "sarah.chen@student.campus.edu",
                "Sarah", "Chen", studentRole, "STU-2024-002", "2022EC0089",
                "B.Tech Electronics & Communication", "2022-2026", "Electronics & Comm", "+1 (555) 019-2832");

        // 5. Seed Initial Demo Clearance Workflow for Alex Rivera if none exists
        if (studentAlex != null && clearanceRequestRepository.findByStudentIdOrderByCreatedAtDesc(studentAlex.getId()).isEmpty()) {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime twoDaysLater = now.plusHours(48);

            ClearanceRequest demoRequest = ClearanceRequest.builder()
                    .student(studentAlex)
                    .academicYear("2025-2026")
                    .semester("Semester 8")
                    .reason("Graduation & Degree Award Clearance")
                    .overallStatus(ClearanceStatus.IN_PROGRESS)
                    .demo(true)
                    .createdAt(now.minusHours(12))
                    .build();

            // Task 1: Library -> APPROVED
            ClearanceTask libraryTask = ClearanceTask.builder()
                    .clearanceRequest(demoRequest)
                    .department(library)
                    .assignedStaff(libraryStaff)
                    .status(TaskStatus.APPROVED)
                    .assignedAt(now.minusHours(12))
                    .dueAt(twoDaysLater.minusHours(12))
                    .completedAt(now.minusHours(4))
                    .overdue(false)
                    .verificationRemarks("All borrowed books returned. Zero pending library fines.")
                    .referenceNumber("LIB-VERIF-2026-9021")
                    .createdAt(now.minusHours(12))
                    .updatedAt(now.minusHours(4))
                    .build();

            libraryTask.getStatusHistory().add(ClearanceStatusHistory.builder()
                    .task(libraryTask)
                    .changedByUser(libraryStaff)
                    .oldStatus(TaskStatus.PENDING)
                    .newStatus(TaskStatus.APPROVED)
                    .remarks("Verified against Koha Library Catalog. No dues outstanding.")
                    .createdAt(now.minusHours(4))
                    .build());

            // Task 2: Hostels -> DELAYED with explanation
            ClearanceTask hostelTask = ClearanceTask.builder()
                    .clearanceRequest(demoRequest)
                    .department(hostels)
                    .assignedStaff(hostelStaff)
                    .status(TaskStatus.DELAYED)
                    .assignedAt(now.minusHours(12))
                    .dueAt(twoDaysLater.minusHours(12))
                    .overdue(false)
                    .createdAt(now.minusHours(12))
                    .updatedAt(now.minusHours(2))
                    .build();

            hostelTask.getDelayReasons().add(DelayReason.builder()
                    .task(hostelTask)
                    .recordedByUser(hostelStaff)
                    .category(DelayCategory.MANUAL_VERIFICATION)
                    .explanation("Physical room inventory and furniture inspection for Hall A-204 scheduled for tomorrow morning.")
                    .expectedResolutionDate(LocalDate.now().plusDays(1))
                    .nextAction("Assistant Warden will conduct room check and upload final clearance slip.")
                    .createdAt(now.minusHours(2))
                    .build());

            hostelTask.getStatusHistory().add(ClearanceStatusHistory.builder()
                    .task(hostelTask)
                    .changedByUser(hostelStaff)
                    .oldStatus(TaskStatus.PENDING)
                    .newStatus(TaskStatus.DELAYED)
                    .remarks("Marked delayed pending physical room inventory check.")
                    .createdAt(now.minusHours(2))
                    .build());

            // Task 3: Sports -> PENDING
            ClearanceTask sportsTask = ClearanceTask.builder()
                    .clearanceRequest(demoRequest)
                    .department(sports)
                    .status(TaskStatus.PENDING)
                    .assignedAt(now.minusHours(12))
                    .dueAt(twoDaysLater.minusHours(12))
                    .overdue(false)
                    .createdAt(now.minusHours(12))
                    .updatedAt(now.minusHours(12))
                    .build();

            // Task 4: Accounts -> PENDING
            ClearanceTask accountsTask = ClearanceTask.builder()
                    .clearanceRequest(demoRequest)
                    .department(accounts)
                    .status(TaskStatus.PENDING)
                    .assignedAt(now.minusHours(12))
                    .dueAt(twoDaysLater.minusHours(12))
                    .overdue(false)
                    .createdAt(now.minusHours(12))
                    .updatedAt(now.minusHours(12))
                    .build();

            demoRequest.getTasks().addAll(List.of(libraryTask, hostelTask, sportsTask, accountsTask));
            clearanceRequestRepository.save(demoRequest);

            log.info("Seeded active demo clearance request for Alex Rivera (ID: {})", demoRequest.getId());
        }

        log.info("DataInitializer completed successfully.");
    }

    private Role getOrCreateRole(RoleType type, String desc) {
        return roleRepository.findByName(type).orElseGet(() -> {
            Role role = Role.builder()
                    .id("role-" + type.name().toLowerCase().replace("role_", ""))
                    .name(type)
                    .description(desc)
                    .build();
            return roleRepository.save(role);
        });
    }

    private User createStaffUser(String username, String rawPassword, String email,
                                 String first, String last, Role role, Department dept,
                                 boolean isHead, String designation) {
        User user = userRepository.findByUsername(username).orElseGet(() -> {
            User u = User.builder()
                    .username(username)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .firstName(first)
                    .lastName(last)
                    .active(true)
                    .demo(true)
                    .roles(new HashSet<>(Set.of(role)))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return userRepository.save(u);
        });

        // Enforce authoritative role and purge any spurious student record
        if (user.getRoles() == null || !user.getRoles().contains(role) || user.getRoles().size() > 1) {
            user.setRoles(new HashSet<>(Set.of(role)));
            userRepository.save(user);
        }
        studentRepository.findByUserId(user.getId()).ifPresent(studentRepository::delete);

        if (dept != null) {
            var staffOpt = departmentStaffRepository.findByUserId(user.getId());
            if (staffOpt.isEmpty()) {
                DepartmentStaff staff = DepartmentStaff.builder()
                        .user(user)
                        .department(dept)
                        .head(isHead)
                        .designation(designation)
                        .createdAt(LocalDateTime.now())
                        .build();
                departmentStaffRepository.save(staff);
            } else {
                DepartmentStaff staff = staffOpt.get();
                if (!dept.getId().equals(staff.getDepartment().getId()) || staff.isHead() != isHead) {
                    staff.setDepartment(dept);
                    staff.setHead(isHead);
                    staff.setDesignation(designation);
                    departmentStaffRepository.save(staff);
                }
            }
        }

        return user;
    }

    private Student createStudent(String username, String rawPassword, String email,
                                  String first, String last, Role role,
                                  String studentId, String rollNo, String program,
                                  String batch, String academicDept, String phone) {
        User user = userRepository.findByUsername(username).orElseGet(() -> {
            User u = User.builder()
                    .username(username)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .firstName(first)
                    .lastName(last)
                    .active(true)
                    .demo(true)
                    .roles(new HashSet<>(Set.of(role)))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return userRepository.save(u);
        });

        // Ensure student has studentRole and purge any spurious staff mapping
        if (user.getRoles() == null || !user.getRoles().contains(role)) {
            user.setRoles(new HashSet<>(Set.of(role)));
            userRepository.save(user);
        }
        departmentStaffRepository.findByUserId(user.getId()).ifPresent(departmentStaffRepository::delete);

        return studentRepository.findByUserId(user.getId()).orElseGet(() -> {
            Student s = Student.builder()
                    .user(user)
                    .studentId(studentId)
                    .rollNo(rollNo)
                    .program(program)
                    .batchYear(batch)
                    .academicDepartment(academicDept)
                    .phoneNumber(phone)
                    .build();
            return studentRepository.save(s);
        });
    }
}
