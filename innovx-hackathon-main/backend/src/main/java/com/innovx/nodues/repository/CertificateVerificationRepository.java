package com.innovx.nodues.repository;

import com.innovx.nodues.domain.entity.CertificateVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificateVerificationRepository extends JpaRepository<CertificateVerification, String> {
    List<CertificateVerification> findByCertificateIdOrderByVerifiedAtDesc(String certificateId);
}
