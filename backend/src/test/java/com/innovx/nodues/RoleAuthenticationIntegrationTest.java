package com.innovx.nodues;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.innovx.nodues.dto.AuthResponse;
import com.innovx.nodues.dto.LoginRequest;
import com.innovx.nodues.dto.RegisterRequest;
import com.innovx.nodues.dto.UserSummaryDto;
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
public class RoleAuthenticationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Admin Identity: Logs in with exact ROLE_ADMIN, zero studentId, zero departmentId")
    public void testAdminIdentity() throws Exception {
        LoginRequest login = new LoginRequest("admin", "admin123");
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(res.getResponse().getContentAsString(), AuthResponse.class);
        assertThat(auth.getRoles()).containsExactly("ROLE_ADMIN");
        assertThat(auth.getStudentId()).isNull();
        assertThat(auth.getDepartmentId()).isNull();

        // Check /api/auth/me
        MvcResult meRes = mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + auth.getToken()))
                .andExpect(status().isOk())
                .andReturn();

        UserSummaryDto me = objectMapper.readValue(meRes.getResponse().getContentAsString(), UserSummaryDto.class);
        assertThat(me.getRoles()).containsExactly("ROLE_ADMIN");
        assertThat(me.getStudentId()).isNull();
        assertThat(me.getDepartmentId()).isNull();
    }

    @Test
    @DisplayName("Staff Identity: Logs in with exact ROLE_DEPARTMENT_STAFF, valid department, zero studentId")
    public void testStaffIdentity() throws Exception {
        LoginRequest login = new LoginRequest("staff.library", "staff123");
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(res.getResponse().getContentAsString(), AuthResponse.class);
        assertThat(auth.getRoles()).containsExactly("ROLE_DEPARTMENT_STAFF");
        assertThat(auth.getStudentId()).isNull();
        assertThat(auth.getDepartmentId()).isNotNull();
        assertThat(auth.getDepartmentCode()).isEqualTo("LIBRARY");
        assertThat(auth.isHead()).isFalse();

        // Check /api/auth/me
        MvcResult meRes = mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + auth.getToken()))
                .andExpect(status().isOk())
                .andReturn();

        UserSummaryDto me = objectMapper.readValue(meRes.getResponse().getContentAsString(), UserSummaryDto.class);
        assertThat(me.getRoles()).containsExactly("ROLE_DEPARTMENT_STAFF");
        assertThat(me.getStudentId()).isNull();
        assertThat(me.getDepartmentId()).isNotNull();
        assertThat(me.getDepartmentCode()).isEqualTo("LIBRARY");
        assertThat(me.isHead()).isFalse();
    }

    @Test
    @DisplayName("Head Identity: Logs in with exact ROLE_DEPARTMENT_HEAD, valid department, isHead=true, zero studentId")
    public void testHeadIdentity() throws Exception {
        LoginRequest login = new LoginRequest("head.library", "head123");
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(res.getResponse().getContentAsString(), AuthResponse.class);
        assertThat(auth.getRoles()).containsExactly("ROLE_DEPARTMENT_HEAD");
        assertThat(auth.getStudentId()).isNull();
        assertThat(auth.getDepartmentId()).isNotNull();
        assertThat(auth.getDepartmentCode()).isEqualTo("LIBRARY");
        assertThat(auth.isHead()).isTrue();

        // Check /api/auth/me
        MvcResult meRes = mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + auth.getToken()))
                .andExpect(status().isOk())
                .andReturn();

        UserSummaryDto me = objectMapper.readValue(meRes.getResponse().getContentAsString(), UserSummaryDto.class);
        assertThat(me.getRoles()).containsExactly("ROLE_DEPARTMENT_HEAD");
        assertThat(me.getStudentId()).isNull();
        assertThat(me.getDepartmentId()).isNotNull();
        assertThat(me.isHead()).isTrue();
    }

    @Test
    @DisplayName("Student Identity: Logs in with exact ROLE_STUDENT, valid studentId, zero departmentId")
    public void testStudentIdentity() throws Exception {
        LoginRequest login = new LoginRequest("student.alex", "student123");
        MvcResult res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(res.getResponse().getContentAsString(), AuthResponse.class);
        assertThat(auth.getRoles()).containsExactly("ROLE_STUDENT");
        assertThat(auth.getStudentId()).isNotNull();
        assertThat(auth.getDepartmentId()).isNull();

        // Check /api/auth/me
        MvcResult meRes = mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + auth.getToken()))
                .andExpect(status().isOk())
                .andReturn();

        UserSummaryDto me = objectMapper.readValue(meRes.getResponse().getContentAsString(), UserSummaryDto.class);
        assertThat(me.getRoles()).containsExactly("ROLE_STUDENT");
        assertThat(me.getStudentId()).isNotNull();
        assertThat(me.getRollNo()).isNotNull();
        assertThat(me.getDepartmentId()).isNull();
    }

    @Test
    @DisplayName("Registration Pipeline: Registering as STAFF preserves STAFF role and attaches department")
    public void testStaffRegistrationIntegrity() throws Exception {
        String randomSuffix = String.valueOf(System.currentTimeMillis() % 10000);
        RegisterRequest staffReq = RegisterRequest.builder()
                .username("newstaff_" + randomSuffix)
                .email("newstaff_" + randomSuffix + "@campus.edu")
                .password("securePass123")
                .fullName("New Test Staff")
                .portalRole("STAFF")
                .departmentId("dept-library")
                .designation("Library Test Staff")
                .build();

        MvcResult regRes = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(staffReq)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(regRes.getResponse().getContentAsString(), AuthResponse.class);
        assertThat(auth.getRoles()).containsExactly("ROLE_DEPARTMENT_STAFF");
        assertThat(auth.getStudentId()).isNull();
        assertThat(auth.getDepartmentId()).isEqualTo("dept-library");
    }
}
