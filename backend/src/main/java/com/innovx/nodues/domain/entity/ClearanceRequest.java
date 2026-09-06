package com.innovx.nodues.domain.entity;

import com.innovx.nodues.domain.enums.ClearanceStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clearance_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClearanceRequest {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "academic_year", length = 20, nullable = false)
    private String academicYear;

    @Column(name = "semester", length = 20, nullable = false)
    private String semester;

    @Column(name = "reason", length = 100, nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_status", length = 50, nullable = false)
    private ClearanceStatus overallStatus = ClearanceStatus.PENDING;

    @Column(name = "is_demo", nullable = false)
    private boolean demo = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "clearanceRequest", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ClearanceTask> tasks = new ArrayList<>();

    @OneToOne(mappedBy = "clearanceRequest", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Certificate certificate;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (overallStatus == null) {
            overallStatus = ClearanceStatus.PENDING;
        }
    }
}
