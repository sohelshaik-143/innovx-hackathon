-- Automated No-Dues & Digital Clearance Platform
-- V2: Seed Roles, Departments, and Institution Settings

-- 1. Insert Base Roles
INSERT INTO roles (id, name, description) VALUES
('role-student', 'ROLE_STUDENT', 'Student initiating and tracking clearance requests'),
('role-staff', 'ROLE_DEPARTMENT_STAFF', 'Department staff verifying student records and taking clearance actions'),
('role-head', 'ROLE_DEPARTMENT_HEAD', 'Department head reviewing workload and escalated requests'),
('role-admin', 'ROLE_ADMIN', 'College administrator managing departments, users, SLA, and audit logs');

-- 2. Insert MVP Departments (Configurable)
INSERT INTO departments (id, code, name, description, official_email, office_location, official_phone, is_active, created_at, updated_at) VALUES
('dept-library', 'LIBRARY', 'Central Library & Learning Resource Center', 'Verifies borrowed books, inter-library loans, journals, and overdue fines.', 'library.clearance@campus.edu', 'Central Library Building, Ground Floor, Desk 4', '+1 (555) 234-5671', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dept-hostels', 'HOSTELS', 'Hostel Administration & Student Housing', 'Verifies room clearance, mess bills, furniture handover, and hostel property.', 'housing.clearance@campus.edu', 'Student Residences Admin Block, Room 102', '+1 (555) 234-5672', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dept-sports', 'SPORTS', 'Sports & Athletics Department', 'Verifies issued sports equipment, gym memberships, and team kits.', 'athletics.clearance@campus.edu', 'Indoor Sports Complex, Office 12', '+1 (555) 234-5673', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dept-accounts', 'ACCOUNTS', 'Accounts & Financial Services Division', 'Verifies tuition fees, scholarship adjustments, lab security deposits, and dues.', 'accounts.clearance@campus.edu', 'Administrative Block, Counter 2B', '+1 (555) 234-5674', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Insert Institutional Governance Settings
INSERT INTO institution_settings (id, setting_key, setting_value, description, updated_at, updated_by) VALUES
('setting-sla', 'DEFAULT_SLA_HOURS', '48', 'Default SLA deadline for department verification in hours (48 hours = 2 calendar days)', CURRENT_TIMESTAMP, 'SYSTEM'),
('setting-name', 'INSTITUTION_NAME', 'Apex Institute of Technology', 'Official institutional legal name for certificates', CURRENT_TIMESTAMP, 'SYSTEM'),
('setting-code', 'INSTITUTION_CODE', 'AIT-TECH', 'Institutional accreditation code', CURRENT_TIMESTAMP, 'SYSTEM'),
('setting-portal', 'PORTAL_BASE_URL', 'http://localhost:5173', 'Public portal base URL for certificate verification links', CURRENT_TIMESTAMP, 'SYSTEM'),
('setting-contact', 'SUPPORT_EMAIL', 'governance@campus.edu', 'Institutional clearance administrative support contact email', CURRENT_TIMESTAMP, 'SYSTEM');
