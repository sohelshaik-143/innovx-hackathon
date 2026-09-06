package com.innovx.nodues.repository;

import com.innovx.nodues.domain.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    Optional<Student> findByUserId(String userId);
    Optional<Student> findByStudentId(String studentId);
    Optional<Student> findByRollNo(String rollNo);
    boolean existsByStudentId(String studentId);
    boolean existsByRollNo(String rollNo);
}
