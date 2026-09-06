package com.innovx.nodues.repository;

import com.innovx.nodues.domain.entity.RejectionReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RejectionReasonRepository extends JpaRepository<RejectionReason, String> {
    List<RejectionReason> findByTaskIdOrderByCreatedAtDesc(String taskId);
}
