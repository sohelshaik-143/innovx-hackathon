package com.innovx.nodues.repository;

import com.innovx.nodues.domain.entity.ClearanceRequest;
import com.innovx.nodues.domain.enums.ClearanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClearanceRequestRepository extends JpaRepository<ClearanceRequest, String> {

    List<ClearanceRequest> findByStudentIdOrderByCreatedAtDesc(String studentId);

    Optional<ClearanceRequest> findFirstByStudentIdAndOverallStatusInOrderByCreatedAtDesc(
            String studentId, List<ClearanceStatus> statuses);

    Page<ClearanceRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<ClearanceRequest> findByOverallStatusOrderByCreatedAtDesc(ClearanceStatus status, Pageable pageable);

    @Query("SELECT r FROM ClearanceRequest r WHERE " +
           "(:status IS NULL OR r.overallStatus = :status) AND " +
           "(:search IS NULL OR LOWER(r.student.studentId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.student.rollNo) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.student.user.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.student.user.lastName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ClearanceRequest> searchRequests(@Param("status") ClearanceStatus status,
                                         @Param("search") String search,
                                         Pageable pageable);

    long countByOverallStatus(ClearanceStatus status);
}
