package com.innovx.nodues;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovx.nodues.domain.entity.ClearanceRequest;
import com.innovx.nodues.domain.entity.ClearanceTask;
import com.innovx.nodues.domain.enums.ClearanceStatus;
import com.innovx.nodues.domain.enums.DelayCategory;
import com.innovx.nodues.domain.enums.TaskStatus;
import com.innovx.nodues.dto.*;
import com.innovx.nodues.repository.ClearanceRequestRepository;
import com.innovx.nodues.repository.ClearanceTaskRepository;
import com.innovx.nodues.repository.StudentRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class ClearanceWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClearanceRequestRepository requestRepository;

    @Autowired
    private ClearanceTaskRepository taskRepository;

    private String obtainToken(String username, String password) throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .username(username)
                .password(password)
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class);
        return auth.getToken();
    }

    @Test
    @DisplayName("End-to-End Clearance Workflow: Student creates request -> 4 Tasks generated -> Approvals -> Certificate Issued -> Public Verification")
    public void testFullClearanceWorkflowAndCertificateGeneration() throws Exception {
        // 1. Authenticate Sarah Chen (student.sarah) who has no active request initially
        String studentToken = obtainToken("student.sarah", "student123");
        assertThat(studentToken).isNotBlank();

        // 2. Student Sarah submits clearance request
        CreateClearanceRequestDto createDto = CreateClearanceRequestDto.builder()
                .academicYear("2025-2026")
                .semester("Semester 8")
                .reason("Graduation and Final Clearance")
                .build();

        MvcResult createResult = mockMvc.perform(post("/api/students/clearance")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.overallStatus").value("PENDING"))
                .andExpect(jsonPath("$.totalTasks").value(4))
                .andReturn();

        ClearanceRequestDetailDto requestDetail = objectMapper.readValue(
                createResult.getResponse().getContentAsString(), ClearanceRequestDetailDto.class);
        String requestId = requestDetail.getId();

        // 3. Verify exactly 4 departmental tasks were created
        List<ClearanceTask> tasks = taskRepository.findByClearanceRequestId(requestId);
        assertThat(tasks).hasSize(4);

        ClearanceTask libTask = tasks.stream().filter(t -> t.getDepartment().getCode().equals("LIBRARY")).findFirst().orElseThrow();
        ClearanceTask hostelTask = tasks.stream().filter(t -> t.getDepartment().getCode().equals("HOSTELS")).findFirst().orElseThrow();
        ClearanceTask sportsTask = tasks.stream().filter(t -> t.getDepartment().getCode().equals("SPORTS")).findFirst().orElseThrow();
        ClearanceTask accountsTask = tasks.stream().filter(t -> t.getDepartment().getCode().equals("ACCOUNTS")).findFirst().orElseThrow();

        // 4. Library Staff approves Library Task
        String libToken = obtainToken("staff.library", "staff123");
        ApproveTaskDto approveDto = ApproveTaskDto.builder()
                .verificationRemarks("Zero books outstanding. Checked against library database.")
                .referenceNumber("LIB-OK-7890")
                .build();

        mockMvc.perform(post("/api/tasks/" + libTask.getId() + "/approve")
                        .header("Authorization", "Bearer " + libToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        // 5. Hostels Staff marks Delay with mandatory reason & expected date
        String hostelToken = obtainToken("staff.hostel", "staff123");
        DelayTaskDto delayDto = DelayTaskDto.builder()
                .category(DelayCategory.MANUAL_VERIFICATION)
                .explanation("Room key inspection pending with hostel caretaker.")
                .expectedResolutionDate(LocalDate.now().plusDays(1))
                .nextAction("Caretaker will submit room handover voucher tomorrow.")
                .build();

        mockMvc.perform(post("/api/tasks/" + hostelTask.getId() + "/delay")
                        .header("Authorization", "Bearer " + hostelToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(delayDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("DELAYED"))
                .andExpect(jsonPath("$.delayInfo.explanation").value("Room key inspection pending with hostel caretaker."));

        // 6. Student views progress: Should show 1 Approved, 1 Delayed, 2 Pending
        mockMvc.perform(get("/api/students/clearance/active")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.approvedTasks").value(1))
                .andExpect(jsonPath("$.overallStatus").value("IN_PROGRESS"));

        // 7. Hostels Staff now verifies and Approves the task
        ApproveTaskDto hostelApprove = ApproveTaskDto.builder()
                .verificationRemarks("Room keys received. Handover verified.")
                .build();
        mockMvc.perform(post("/api/tasks/" + hostelTask.getId() + "/approve")
                        .header("Authorization", "Bearer " + hostelToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(hostelApprove)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        // 8. Sports Staff Approves task
        String sportsToken = obtainToken("staff.sports", "staff123");
        mockMvc.perform(post("/api/tasks/" + sportsTask.getId() + "/approve")
                        .header("Authorization", "Bearer " + sportsToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ApproveTaskDto("All athletic equipment accounted for.", "SPT-OK-1"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        // 9. Accounts Staff Approves task -> ALL 4 ARE NOW APPROVED!
        String accountsToken = obtainToken("staff.accounts", "staff123");
        mockMvc.perform(post("/api/tasks/" + accountsTask.getId() + "/approve")
                        .header("Authorization", "Bearer " + accountsToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ApproveTaskDto("Tuition and fees clear.", "ACC-OK-99"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        // 10. Check that the Request overall status is now COMPLETED and Certificate is generated
        MvcResult completedReqResult = mockMvc.perform(get("/api/clearance-requests/" + requestId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.overallStatus").value("COMPLETED"))
                .andExpect(jsonPath("$.certificateNumber").isNotEmpty())
                .andReturn();

        ClearanceRequestDetailDto completedDetail = objectMapper.readValue(
                completedReqResult.getResponse().getContentAsString(), ClearanceRequestDetailDto.class);
        String certNumber = completedDetail.getCertificateNumber();
        assertThat(certNumber).isNotBlank();

        // 11. Public Verification of the Certificate without authentication
        mockMvc.perform(get("/api/public/certificates/verify/" + certNumber))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.certificateNumber").value(certNumber))
                .andExpect(jsonPath("$.institutionName").value("Apex Institute of Technology"))
                .andExpect(jsonPath("$.verifiedDepartments").isArray())
                .andExpect(jsonPath("$.verifiedDepartments.length()").value(4));

        // 12. Test PDF download endpoint
        mockMvc.perform(get("/api/certificates/" + completedDetail.getCertificateId() + "/pdf")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(result -> assertThat(result.getResponse().getContentType()).isEqualTo("application/pdf"))
                .andExpect(result -> assertThat(result.getResponse().getContentAsByteArray().length).isGreaterThan(1000));
    }
}
