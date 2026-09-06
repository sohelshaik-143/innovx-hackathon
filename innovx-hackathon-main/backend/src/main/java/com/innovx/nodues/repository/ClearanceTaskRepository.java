package com.innovx.nodues.repository;

import com.innovx.nodues.domain.entity.ClearanceTask;
import com.innovx.nodues.domain.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClearanceTaskRepository extends JpaRepository<ClearanceTask, String> {

    List<ClearanceTask> findByClearanceRequestId(String requestId);

    Optional<ClearanceTask> findByClearanceRequestIdAndDepartmentId(String requestId, String departmentId);

    @Query("SELECT t FROM ClearanceTask t WHERE t.department.id = :departmentId " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:isOverdue IS NULL OR t.overdue = :isOverdue) " +
           "AND (:search IS NULL OR " +
           "LOWER(t.clearanceRequest.student.studentId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.clearanceRequest.student.rollNo) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.clearanceRequest.student.user.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.clearanceRequest.student.user.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.clearanceRequest.id) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ClearanceTask> searchDepartmentTasks(@Param("departmentId") String departmentId,
                                              @Param("status") TaskStatus status,
                                              @Param("isOverdue") Boolean isOverdue,
                                              @Param("search") String search,
                                              Pageable pageable);

    @Query("SELECT t FROM ClearanceTask t WHERE t.status IN ('PENDING', 'DELAYED') AND t.dueAt < :now AND t.overdue = false")
    List<ClearanceTask> findOverdueTasksToEscalate(@Param("now") LocalDateTime now);

    long countByDepartmentIdAndStatus(String departmentId, TaskStatus status);

    long countByDepartmentIdAndOverdueTrue(String departmentId);

    @Query("SELECT COUNT(t) FROM ClearanceTask t WHERE t.department.id = :departmentId " +
           "AND t.status IN ('PENDING', 'DELAYED') " +
           "AND t.dueAt >= :startOfDay AND t.dueAt <= :endOfDay")
    long countDueToday(@Param("departmentId") String departmentId,
                       @Param("startOfDay") LocalDateTime startOfDay,
                       @Param("endOfDay") LocalDateTime endOfDay);

    long countByOverdueTrue();

    long countByStatus(TaskStatus status);
}
