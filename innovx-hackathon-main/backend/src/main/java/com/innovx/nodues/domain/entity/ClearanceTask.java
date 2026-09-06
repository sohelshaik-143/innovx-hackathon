package com.innovx.nodues.domain.entity;

import com.innovx.nodues.domain.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clearance_tasks",
       uniqueConstraints = @UniqueConstraint(name = "uq_request_department", columnNames = {"request_id", "department_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClearanceTask {

    @Id
    @Column(name = "id", length = 36, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private ClearanceRequest clearanceRequest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_staff_id")
    private User assignedStaff;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50, nullable = false)
    private TaskStatus status = TaskStatus.PENDING;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @Column(name = "due_at", nullable = false)
    private LocalDateTime dueAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "is_overdue", nullable = false)
    private boolean overdue = false;

    @Column(name = "escalated_at")
    private LocalDateTime escalatedAt;

    @Column(name = "verification_remarks", columnDefinition = "TEXT")
    private String verificationRemarks;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<ClearanceStatusHistory> statusHistory = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<DelayReason> delayReasons = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<RejectionReason> rejectionReasons = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<Escalation> escalations = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = java.util.UUID.randomUUID().toString();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = TaskStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
