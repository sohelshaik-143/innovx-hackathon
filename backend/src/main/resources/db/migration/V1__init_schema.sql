-- Automated No-Dues & Digital Clearance Platform
-- V1: Initial Normalized Relational Database Schema

-- 1. Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 2. Roles table
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 3. User Roles join table
CREATE TABLE user_roles (
    user_id VARCHAR(36) NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
);

-- 4. Students profile table
CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    roll_no VARCHAR(50) NOT NULL UNIQUE,
    program VARCHAR(100) NOT NULL,
    batch_year VARCHAR(20) NOT NULL,
    academic_department VARCHAR(100) NOT NULL,
    phone_number VARCHAR(25),
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 5. Departments table
CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    official_email VARCHAR(150) NOT NULL,
    office_location VARCHAR(200) NOT NULL,
    official_phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- 6. Department Staff table
CREATE TABLE department_staff (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    department_id VARCHAR(36) NOT NULL,
    is_head BOOLEAN NOT NULL DEFAULT FALSE,
    designation VARCHAR(100),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_dept_staff_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_dept_staff_dept FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE RESTRICT
);

-- 7. Clearance Requests table
CREATE TABLE clearance_requests (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    overall_status VARCHAR(50) NOT NULL,
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    CONSTRAINT fk_clearance_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE RESTRICT
);

-- 8. Clearance Tasks table (one per department per request)
CREATE TABLE clearance_tasks (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,
    department_id VARCHAR(36) NOT NULL,
    assigned_staff_id VARCHAR(36),
    status VARCHAR(50) NOT NULL,
    assigned_at TIMESTAMP NOT NULL,
    due_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    is_overdue BOOLEAN NOT NULL DEFAULT FALSE,
    escalated_at TIMESTAMP,
    verification_remarks TEXT,
    reference_number VARCHAR(100),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_task_request FOREIGN KEY (request_id) REFERENCES clearance_requests (id) ON DELETE CASCADE,
    CONSTRAINT fk_task_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_task_staff FOREIGN KEY (assigned_staff_id) REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uq_request_department UNIQUE (request_id, department_id)
);

-- 9. Clearance Status History table
CREATE TABLE clearance_status_history (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    changed_by_user_id VARCHAR(36) NOT NULL,
    old_status VARCHAR(50) NOT NULL,
    new_status VARCHAR(50) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_history_task FOREIGN KEY (task_id) REFERENCES clearance_tasks (id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by_user_id) REFERENCES users (id) ON DELETE RESTRICT
);

-- 10. Delay Reasons table
CREATE TABLE delay_reasons (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    recorded_by_user_id VARCHAR(36) NOT NULL,
    category VARCHAR(60) NOT NULL,
    explanation TEXT NOT NULL,
    expected_resolution_date DATE NOT NULL,
    next_action TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_delay_task FOREIGN KEY (task_id) REFERENCES clearance_tasks (id) ON DELETE CASCADE,
    CONSTRAINT fk_delay_user FOREIGN KEY (recorded_by_user_id) REFERENCES users (id) ON DELETE RESTRICT
);

-- 11. Rejection Reasons table
CREATE TABLE rejection_reasons (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    recorded_by_user_id VARCHAR(36) NOT NULL,
    reason_title VARCHAR(150) NOT NULL,
    explanation TEXT NOT NULL,
    required_student_action TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_rejection_task FOREIGN KEY (task_id) REFERENCES clearance_tasks (id) ON DELETE CASCADE,
    CONSTRAINT fk_rejection_user FOREIGN KEY (recorded_by_user_id) REFERENCES users (id) ON DELETE RESTRICT
);

-- 12. Escalations table
CREATE TABLE escalations (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    department_id VARCHAR(36) NOT NULL,
    escalation_level VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    triggered_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    resolved_by_user_id VARCHAR(36),
    resolution_notes TEXT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_escalation_task FOREIGN KEY (task_id) REFERENCES clearance_tasks (id) ON DELETE CASCADE,
    CONSTRAINT fk_escalation_dept FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE RESTRICT,
    CONSTRAINT fk_escalation_resolver FOREIGN KEY (resolved_by_user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- 13. Notifications table
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    request_id VARCHAR(36),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(60) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_request FOREIGN KEY (request_id) REFERENCES clearance_requests (id) ON DELETE SET NULL
);

-- 14. Audit Logs table (Immutable)
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    username VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    department_code VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(60) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP NOT NULL
);

-- 15. Certificates table
CREATE TABLE certificates (
    id VARCHAR(36) PRIMARY KEY,
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    request_id VARCHAR(36) NOT NULL UNIQUE,
    student_id VARCHAR(36) NOT NULL,
    institution_name VARCHAR(200) NOT NULL,
    issue_date TIMESTAMP NOT NULL,
    completion_date TIMESTAMP NOT NULL,
    verification_hash VARCHAR(128) NOT NULL,
    qr_verification_url VARCHAR(500) NOT NULL,
    pdf_file_path VARCHAR(500),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_certificate_request FOREIGN KEY (request_id) REFERENCES clearance_requests (id) ON DELETE RESTRICT,
    CONSTRAINT fk_certificate_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE RESTRICT
);

-- 16. Certificate Verifications table
CREATE TABLE certificate_verifications (
    id VARCHAR(36) PRIMARY KEY,
    certificate_id VARCHAR(36) NOT NULL,
    verified_at TIMESTAMP NOT NULL,
    verifier_ip VARCHAR(45),
    user_agent VARCHAR(300),
    CONSTRAINT fk_cert_verif_cert FOREIGN KEY (certificate_id) REFERENCES certificates (id) ON DELETE CASCADE
);

-- 17. Institution Settings table
CREATE TABLE institution_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP NOT NULL,
    updated_by VARCHAR(36)
);

-- Indexes for optimal performance and querying
CREATE INDEX idx_clearance_tasks_dept ON clearance_tasks(department_id, status);
CREATE INDEX idx_clearance_tasks_due ON clearance_tasks(due_at, is_overdue);
CREATE INDEX idx_clearance_tasks_req ON clearance_tasks(request_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_certificates_number ON certificates(certificate_number);
CREATE INDEX idx_students_stud_id ON students(student_id);
