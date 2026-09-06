package com.innovx.nodues.repository;

import com.innovx.nodues.domain.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, String> {
    Optional<Certificate> findByCertificateNumber(String certificateNumber);
    Optional<Certificate> findByClearanceRequestId(String clearanceRequestId);
    Optional<Certificate> findByStudentId(String studentId);
}
