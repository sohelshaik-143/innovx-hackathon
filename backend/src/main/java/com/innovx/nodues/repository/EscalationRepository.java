package com.innovx.nodues.repository;

import com.innovx.nodues.domain.entity.Escalation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EscalationRepository extends JpaRepository<Escalation, String> {
    List<Escalation> findByTaskIdOrderByTriggeredAtDesc(String taskId);
    Page<Escalation> findByDepartmentIdOrderByTriggeredAtDesc(String departmentId, Pageable pageable);
    Page<Escalation> findAllByOrderByTriggeredAtDesc(Pageable pageable);
    long countByResolvedAtIsNull();
    long countByDepartmentIdAndResolvedAtIsNull(String departmentId);
}
