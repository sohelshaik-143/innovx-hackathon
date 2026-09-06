package com.innovx.nodues;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovx.nodues.domain.entity.ClearanceTask;
import com.innovx.nodues.dto.ApproveTaskDto;
import com.innovx.nodues.dto.AuthResponse;
import com.innovx.nodues.dto.LoginRequest;
import com.innovx.nodues.repository.ClearanceTaskRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class SecurityAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
    @DisplayName("Cross-Department Security: Library staff CANNOT approve an Accounts task")
    public void testCrossDepartmentAccessDenied() throws Exception {
        String libToken = obtainToken("staff.library", "staff123");
        assertThat(libToken).isNotBlank();

        // Find an Accounts task
        ClearanceTask accountsTask = taskRepository.findAll().stream()
                .filter(t -> t.getDepartment().getCode().equals("ACCOUNTS"))
                .findFirst()
                .orElseThrow();

        ApproveTaskDto approveDto = ApproveTaskDto.builder()
                .verificationRemarks("Unauthorized attempt")
                .build();

        // Library staff tries to approve Accounts task -> MUST FAIL with 403 Forbidden
        mockMvc.perform(post("/api/tasks/" + accountsTask.getId() + "/approve")
                        .header("Authorization", "Bearer " + libToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approveDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student Privacy: Student A cannot access Student B's clearance request")
    public void testStudentCrossAccessDenied() throws Exception {
        String alexToken = obtainToken("student.alex", "student123");
        String sarahToken = obtainToken("student.sarah", "student123");

        // Alex has a seeded request
        MvcResult alexActive = mockMvc.perform(get("/api/students/clearance/active")
                        .header("Authorization", "Bearer " + alexToken))
                .andExpect(status().isOk())
                .andReturn();

        String alexRequestId = objectMapper.readTree(alexActive.getResponse().getContentAsString()).get("id").asText();

        // Sarah tries to access Alex's request by ID -> MUST FAIL with 403 Forbidden
        mockMvc.perform(get("/api/clearance-requests/" + alexRequestId)
                        .header("Authorization", "Bearer " + sarahToken))
                .andExpect(status().isForbidden());
    }
}
