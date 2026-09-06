package com.innovx.nodues.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "student_id", length = 50, nullable = false, unique = true)
    private String studentId; // e.g., STU-2024-001

    @Column(name = "roll_no", length = 50, nullable = false, unique = true)
    private String rollNo;

    @Column(name = "program", length = 100, nullable = false)
    private String program; // e.g., B.Tech Computer Science

    @Column(name = "batch_year", length = 20, nullable = false)
    private String batchYear;

    @Column(name = "academic_department", length = 100, nullable = false)
    private String academicDepartment;

    @Column(name = "phone_number", length = 25)
    private String phoneNumber;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
    }
}
