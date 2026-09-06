package com.innovx.nodues.repository;

import com.innovx.nodues.domain.entity.DelayReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DelayReasonRepository extends JpaRepository<DelayReason, String> {
    List<DelayReason> findByTaskIdOrderByCreatedAtDesc(String taskId);
}
