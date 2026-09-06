package com.innovx.nodues.controller;

import com.innovx.nodues.dto.PublicCertificateVerifyDto;
import com.innovx.nodues.service.CertificateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/certificates")
@RequiredArgsConstructor
@Tag(name = "Public Certificate Verification", description = "Public endpoints for verifying authentic institutional No-Dues certificates via QR code or ID")
public class PublicCertificateController {

    private final CertificateService certificateService;

    @GetMapping("/verify/{certificateIdentifier}")
    @Operation(summary = "Publicly verify certificate authenticity", description = "Validates certificate integrity and returns sanitized public verification details")
    public ResponseEntity<PublicCertificateVerifyDto> verifyCertificate(
            @PathVariable String certificateIdentifier,
            HttpServletRequest request) {

        String clientIp = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");

        PublicCertificateVerifyDto result = certificateService.verifyPublicCertificate(certificateIdentifier, clientIp, userAgent);
        return ResponseEntity.ok(result);
    }
}
