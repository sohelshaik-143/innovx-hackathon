package com.innovx.nodues.repository;

import com.innovx.nodues.domain.entity.ClearanceStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClearanceStatusHistoryRepository extends JpaRepository<ClearanceStatusHistory, String> {
    List<ClearanceStatusHistory> findByTaskIdOrderByCreatedAtDesc(String taskId);
}
