package com.innovx.nodues.repository;

import com.innovx.nodues.domain.entity.DepartmentStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentStaffRepository extends JpaRepository<DepartmentStaff, String> {
    Optional<DepartmentStaff> findByUserId(String userId);
    List<DepartmentStaff> findByDepartmentId(String departmentId);
    List<DepartmentStaff> findByDepartmentIdAndHeadTrue(String departmentId);
}
