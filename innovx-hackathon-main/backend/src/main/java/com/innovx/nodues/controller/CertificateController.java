package com.innovx.nodues.controller;

import com.innovx.nodues.dto.CertificateDto;
import com.innovx.nodues.service.CertificateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
@Tag(name = "Certificates", description = "View and download digitally verified No-Dues certificates")
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/{certificateId}")
    @Operation(summary = "Get certificate metadata", description = "Retrieves issued certificate details, QR URL, and verification breakdown")
    public ResponseEntity<CertificateDto> getCertificate(@PathVariable String certificateId) {
        return ResponseEntity.ok(certificateService.getCertificateDetails(certificateId));
    }

    @GetMapping("/{certificateId}/pdf")
    @Operation(summary = "Download official PDF certificate", description = "Streams tamper-resistant PDF certificate with embedded QR code")
    public ResponseEntity<byte[]> downloadCertificatePdf(@PathVariable String certificateId) {
        byte[] pdfBytes = certificateService.getCertificatePdf(certificateId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "NoDuesCertificate-" + certificateId + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @GetMapping(value = "/{certificateId}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    @Operation(summary = "Get certificate QR code PNG image", description = "Streams a scannable QR code PNG image pointing to public verification")
    public ResponseEntity<byte[]> getCertificateQr(@PathVariable String certificateId) {
        byte[] qrBytes = certificateService.getCertificateQrPng(certificateId);

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .body(qrBytes);
    }
}
