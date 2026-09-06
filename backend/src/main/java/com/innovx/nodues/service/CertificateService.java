package com.innovx.nodues.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.innovx.nodues.domain.entity.*;
import com.innovx.nodues.domain.enums.TaskStatus;
import com.innovx.nodues.dto.CertificateDto;
import com.innovx.nodues.dto.PublicCertificateVerifyDto;
import com.innovx.nodues.exception.InvalidActionException;
import com.innovx.nodues.exception.ResourceNotFoundException;
import com.innovx.nodues.repository.CertificateRepository;
import com.innovx.nodues.repository.CertificateVerificationRepository;
import com.innovx.nodues.repository.InstitutionSettingRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final CertificateVerificationRepository verificationRepository;
    private final InstitutionSettingRepository institutionSettingRepository;
    private final AuditLogService auditLogService;

    @Value("${app.storage.certificates-dir:./uploads/certificates}")
    private String certificatesStorageDir;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long expirationMs;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Transactional
    public Certificate generateCertificate(ClearanceRequest request) {
        // Enforce rule: All tasks must be APPROVED
        boolean allApproved = request.getTasks().stream()
                .allMatch(task -> task.getStatus() == TaskStatus.APPROVED);

        if (!allApproved) {
            throw new InvalidActionException("Cannot generate No-Dues Certificate. Not all departments have approved clearance.");
        }

        // Check if certificate already exists
        var existingCert = certificateRepository.findByClearanceRequestId(request.getId());
        if (existingCert.isPresent()) {
            return existingCert.get();
        }

        Student student = request.getStudent();
        String institutionName = getSettingValue("INSTITUTION_NAME", "Apex Institute of Technology");
        String portalBaseUrl = getSettingValue("PORTAL_BASE_URL", "http://localhost:5173");

        String certNumber = "CERT-" + LocalDateTime.now().getYear() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        LocalDateTime completionDate = request.getCompletedAt() != null ? request.getCompletedAt() : LocalDateTime.now();
        LocalDateTime issueDate = LocalDateTime.now();

        // Calculate cryptographic verification hash (tamper-detection)
        String rawHashPayload = certNumber + "|" + student.getStudentId() + "|" + student.getRollNo() +
                "|" + completionDate + "|" + institutionName;
        String verificationHash = computeSha256(rawHashPayload);

        // Build unique verification URL pointing to public verification page
        String verificationUrl = portalBaseUrl + "/verify-certificate/" + certNumber;

        Certificate certificate = Certificate.builder()
                .certificateNumber(certNumber)
                .clearanceRequest(request)
                .student(student)
                .institutionName(institutionName)
                .issueDate(issueDate)
                .completionDate(completionDate)
                .verificationHash(verificationHash)
                .qrVerificationUrl(verificationUrl)
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .build();

        // Generate and persist PDF document
        try {
            byte[] pdfBytes = buildCertificatePdf(certificate, request, verificationUrl);
            String filePath = savePdfToFile(certNumber, pdfBytes);
            certificate.setPdfFilePath(filePath);
        } catch (Exception ex) {
            log.error("Failed to generate PDF document for certificate {}", certNumber, ex);
            throw new RuntimeException("Certificate document generation failed. Please try again.", ex);
        }

        Certificate saved = certificateRepository.save(certificate);

        auditLogService.logAction(
                student.getUser().getId(),
                student.getUser().getUsername(),
                "SYSTEM",
                null,
                "CERTIFICATE_GENERATED",
                "CERTIFICATE",
                saved.getId(),
                null,
                "ISSUED",
                "Certificate #" + certNumber + " generated with SHA-256 verification hash: " + verificationHash,
                "SYSTEM"
        );

        return saved;
    }

    @Transactional(readOnly = true)
    public byte[] getCertificatePdf(String certificateId) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .or(() -> certificateRepository.findByCertificateNumber(certificateId))
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + certificateId));

        try {
            return buildCertificatePdf(certificate, certificate.getClearanceRequest(), certificate.getQrVerificationUrl());
        } catch (Exception ex) {
            log.error("Error creating certificate PDF bytes", ex);
            throw new RuntimeException("Could not retrieve certificate document", ex);
        }
    }

    @Transactional(readOnly = true)
    public CertificateDto getCertificateDetails(String certificateId) {
        Certificate cert = certificateRepository.findById(certificateId)
                .or(() -> certificateRepository.findByCertificateNumber(certificateId))
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + certificateId));

        return mapToDto(cert);
    }

    @Transactional
    public PublicCertificateVerifyDto verifyPublicCertificate(String certificateIdentifier, String ipAddress, String userAgent) {
        Certificate cert = certificateRepository.findByCertificateNumber(certificateIdentifier)
                .or(() -> certificateRepository.findById(certificateIdentifier))
                .orElse(null);

        if (cert == null) {
            return PublicCertificateVerifyDto.builder()
                    .valid(false)
                    .statusMessage("No official No-Dues Certificate found matching the provided identifier.")
                    .certificateNumber(certificateIdentifier)
                    .verificationTimestamp(LocalDateTime.now())
                    .build();
        }

        if (cert.isRevoked()) {
            return PublicCertificateVerifyDto.builder()
                    .valid(false)
                    .statusMessage("This certificate was formally REVOKED by the college administration.")
                    .certificateNumber(cert.getCertificateNumber())
                    .institutionName(cert.getInstitutionName())
                    .verificationTimestamp(LocalDateTime.now())
                    .build();
        }

        // Record verification audit view
        try {
            CertificateVerification verification = CertificateVerification.builder()
                    .certificate(cert)
                    .verifiedAt(LocalDateTime.now())
                    .verifierIp(ipAddress)
                    .userAgent(userAgent != null && userAgent.length() > 290 ? userAgent.substring(0, 290) : userAgent)
                    .build();
            verificationRepository.save(verification);
        } catch (Exception ex) {
            log.warn("Failed to record certificate verification log: {}", ex.getMessage());
        }

        Student student = cert.getStudent();
        List<PublicCertificateVerifyDto.DepartmentVerifiedPublicEntry> deptEntries = cert.getClearanceRequest().getTasks().stream()
                .map(t -> PublicCertificateVerifyDto.DepartmentVerifiedPublicEntry.builder()
                        .departmentName(t.getDepartment().getName())
                        .verifiedAt(t.getCompletedAt())
                        .status(t.getStatus().name())
                        .build())
                .toList();

        return PublicCertificateVerifyDto.builder()
                .valid(true)
                .statusMessage("Certificate is authentic and digitally verified by institutional authority.")
                .certificateNumber(cert.getCertificateNumber())
                .institutionName(cert.getInstitutionName())
                .studentIdentifier(student.getUser().getFullName() + " (" + student.getStudentId() + ")")
                .program(student.getProgram())
                .issueDate(cert.getIssueDate())
                .completionDate(cert.getCompletionDate())
                .verificationTimestamp(LocalDateTime.now())
                .verifiedDepartments(deptEntries)
                .build();
    }

    private byte[] buildCertificatePdf(Certificate cert, ClearanceRequest request, String verificationUrl) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        PdfWriter.getInstance(document, baos);
        document.open();

        Student student = cert.getStudent();

        // Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(15, 23, 42)); // Slate-900
        Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(79, 70, 229)); // Indigo-600
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(51, 65, 85)); // Slate-700
        Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new Color(15, 23, 42));
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
        Font smallMuted = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(100, 116, 139));

        // Header Table
        Paragraph instParagraph = new Paragraph(cert.getInstitutionName().toUpperCase(), titleFont);
        instParagraph.setAlignment(Element.ALIGN_CENTER);
        document.add(instParagraph);

        Paragraph docTitle = new Paragraph("OFFICIAL DIGITAL NO-DUES CLEARANCE CERTIFICATE", subtitleFont);
        docTitle.setAlignment(Element.ALIGN_CENTER);
        docTitle.setSpacingAfter(15);
        document.add(docTitle);

        // Certificate Meta Ribbon
        PdfPTable metaTable = new PdfPTable(2);
        metaTable.setWidthPercentage(100);
        metaTable.setWidths(new float[]{1f, 1f});

        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.addElement(new Paragraph("Certificate ID: " + cert.getCertificateNumber(), boldFont));
        leftCell.addElement(new Paragraph("Issue Date: " + cert.getIssueDate().format(DATE_FORMATTER), normalFont));
        metaTable.addCell(leftCell);

        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(new Paragraph("Status: VERIFIED & COMPLETED", boldFont));
        rightCell.addElement(new Paragraph("Academic Year: " + request.getAcademicYear() + " (" + request.getSemester() + ")", normalFont));
        metaTable.addCell(rightCell);
        metaTable.setSpacingAfter(15);
        document.add(metaTable);

        // Student Particulars Box
        PdfPTable studentTable = new PdfPTable(2);
        studentTable.setWidthPercentage(100);
        studentTable.setWidths(new float[]{1.2f, 1.8f});

        addTableRow(studentTable, "Student Legal Name:", student.getUser().getFullName(), boldFont, normalFont);
        addTableRow(studentTable, "Institutional ID:", student.getStudentId(), boldFont, normalFont);
        addTableRow(studentTable, "University Roll No:", student.getRollNo(), boldFont, normalFont);
        addTableRow(studentTable, "Academic Program:", student.getProgram(), boldFont, normalFont);
        addTableRow(studentTable, "Batch / Department:", student.getBatchYear() + " / " + student.getAcademicDepartment(), boldFont, normalFont);
        addTableRow(studentTable, "Clearance Purpose:", request.getReason(), boldFont, normalFont);
        studentTable.setSpacingAfter(20);
        document.add(studentTable);

        // Department Verification Breakdown Section
        Paragraph breakdownTitle = new Paragraph("DEPARTMENTAL CLEARANCE VERIFICATION RECORD", subtitleFont);
        breakdownTitle.setSpacingAfter(8);
        document.add(breakdownTitle);

        PdfPTable deptTable = new PdfPTable(4);
        deptTable.setWidthPercentage(100);
        deptTable.setWidths(new float[]{1.5f, 1.2f, 1.5f, 1.8f});

        // Table Header
        addHeaderCell(deptTable, "Department", headerFont);
        addHeaderCell(deptTable, "Status", headerFont);
        addHeaderCell(deptTable, "Verified At", headerFont);
        addHeaderCell(deptTable, "Verification Reference / Staff", headerFont);

        for (ClearanceTask task : request.getTasks()) {
            deptTable.addCell(new PdfPCell(new Phrase(task.getDepartment().getName(), normalFont)));

            PdfPCell statusCell = new PdfPCell(new Phrase(task.getStatus().name(), boldFont));
            statusCell.setBackgroundColor(new Color(240, 253, 244)); // Light green
            deptTable.addCell(statusCell);

            String verifiedAtStr = task.getCompletedAt() != null ? task.getCompletedAt().format(DATE_FORMATTER) : "N/A";
            deptTable.addCell(new PdfPCell(new Phrase(verifiedAtStr, normalFont)));

            String staffInfo = (task.getAssignedStaff() != null ? task.getAssignedStaff().getFullName() : "Authorized Officer") +
                    (task.getReferenceNumber() != null ? "\nRef: " + task.getReferenceNumber() : "");
            deptTable.addCell(new PdfPCell(new Phrase(staffInfo, normalFont)));
        }
        deptTable.setSpacingAfter(25);
        document.add(deptTable);

        // Verification QR Code & Security Stamp Section
        byte[] qrBytes = generateQrCodePng(verificationUrl, 140, 140);
        Image qrImage = Image.getInstance(qrBytes);
        qrImage.scaleToFit(110, 110);

        PdfPTable footerTable = new PdfPTable(2);
        footerTable.setWidthPercentage(100);
        footerTable.setWidths(new float[]{1.2f, 2.8f});

        PdfPCell qrCell = new PdfPCell(qrImage);
        qrCell.setBorder(Rectangle.NO_BORDER);
        qrCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        footerTable.addCell(qrCell);

        PdfPCell certNoteCell = new PdfPCell();
        certNoteCell.setBorder(Rectangle.NO_BORDER);
        certNoteCell.addElement(new Paragraph("INSTITUTIONAL INTEGRITY GUARANTEE", boldFont));
        certNoteCell.addElement(new Paragraph(
                "This document confirms that the student has fulfilled all institutional responsibilities and possesses ZERO outstanding dues across Library, Hostels, Sports, and Accounts divisions. Scan the QR code or verify online at:",
                normalFont
        ));
        certNoteCell.addElement(new Paragraph(verificationUrl, smallMuted));
        certNoteCell.addElement(new Paragraph("SHA-256 Tamper Proof Hash: " + cert.getVerificationHash(), smallMuted));
        footerTable.addCell(certNoteCell);

        document.add(footerTable);

        document.close();
        return baos.toByteArray();
    }

    private void addTableRow(PdfPTable table, String label, String val, Font labelFont, Font valFont) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, labelFont));
        c1.setBackgroundColor(new Color(248, 250, 252));
        c1.setPadding(6);
        PdfPCell c2 = new PdfPCell(new Phrase(val, valFont));
        c2.setPadding(6);
        table.addCell(c1);
        table.addCell(c2);
    }

    private void addHeaderCell(PdfPTable table, String headerTitle, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(headerTitle, font));
        cell.setBackgroundColor(new Color(30, 41, 59)); // Slate-800
        cell.setPadding(6);
        table.addCell(cell);
    }

    private byte[] generateQrCodePng(String text, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);
        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }

    private String savePdfToFile(String certNumber, byte[] pdfBytes) {
        try {
            File dir = new File(certificatesStorageDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            File file = new File(dir, certNumber + ".pdf");
            try (FileOutputStream fos = new FileOutputStream(file)) {
                fos.write(pdfBytes);
            }
            return file.getAbsolutePath();
        } catch (Exception ex) {
            log.warn("Could not write PDF to disk. In-memory serving remains operational: {}", ex.getMessage());
            return null;
        }
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(encodedHash);
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }

    private String getSettingValue(String key, String defaultValue) {
        return institutionSettingRepository.findBySettingKey(key)
                .map(InstitutionSetting::getSettingValue)
                .orElse(defaultValue);
    }

    public CertificateDto mapToDto(Certificate cert) {
        Student student = cert.getStudent();
        ClearanceRequest req = cert.getClearanceRequest();

        List<CertificateDto.DepartmentVerificationEntry> entries = req.getTasks().stream()
                .map(t -> CertificateDto.DepartmentVerificationEntry.builder()
                        .departmentCode(t.getDepartment().getCode())
                        .departmentName(t.getDepartment().getName())
                        .verifiedBy(t.getAssignedStaff() != null ? t.getAssignedStaff().getFullName() : "Authorized Officer")
                        .verifiedAt(t.getCompletedAt())
                        .remarks(t.getVerificationRemarks())
                        .referenceNumber(t.getReferenceNumber())
                        .build())
                .toList();

        return CertificateDto.builder()
                .id(cert.getId())
                .certificateNumber(cert.getCertificateNumber())
                .requestId(req.getId())
                .studentId(student.getStudentId())
                .studentName(student.getUser().getFullName())
                .rollNo(student.getRollNo())
                .program(student.getProgram())
                .batchYear(student.getBatchYear())
                .academicDepartment(student.getAcademicDepartment())
                .institutionName(cert.getInstitutionName())
                .issueDate(cert.getIssueDate())
                .completionDate(cert.getCompletionDate())
                .verificationHash(cert.getVerificationHash())
                .qrVerificationUrl(cert.getQrVerificationUrl())
                .revoked(cert.isRevoked())
                .verifications(entries)
                .build();
    }
}
