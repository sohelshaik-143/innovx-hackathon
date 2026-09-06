# CampusClear — Automated No-Dues & Digital Clearance Platform
### Digital Campus Governance MVP

[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Flyway](https://img.shields.io/badge/Flyway-Database%20Migrations-red.svg)](https://flywaydb.org/)

> **The Core Idea:**  
> **ONE STUDENT REQUEST → MULTIPLE VERIFIED DEPARTMENTS → TRANSPARENT ACCOUNTABILITY → AUTOMATIC DIGITAL CERTIFICATE.**

---

## 1. Executive Summary & Product Vision

Paper-based clearance forms require students to physically navigate college campuses, stand in lines, and solicit signatures across Library, Hostels, Sports, and Accounts offices. If an administrative officer is absent or records are misplaced, clearance stalls without transparency or accountability.

**CampusClear** eliminates physical no-dues forms entirely:
1. **Student** creates **ONE** digital clearance request.
2. **System** dispatches clearance tasks to active departments with a **2-calendar-day SLA**.
3. **Authorized Departments** independently verify their actual records (Approve, Reject with mandatory grounds, or Mark Delayed with explanations).
4. **SLA Engine** monitors deadlines and automatically escalates overdue tasks to Department Heads.
5. **Certification Authority** automatically generates a tamper-resistant, digitally verifiable **No-Dues Certificate (PDF)** with an embedded **QR code** pointing to a privacy-preserving public verification portal.

---

## 2. Key Features Implemented

- [x] **Role-Based Web Platform**: Dedicated portals for `STUDENT`, `DEPARTMENT_STAFF`, `DEPARTMENT_HEAD`, and `ADMIN`.
- [x] **Configurable Departments**: Initial MVP departments (Library, Hostels, Sports, Accounts) are dynamically managed and extendable without code refactoring.
- [x] **No Dues Verification Rule**: The system **never assumes "No dues = ₹0"**; zero dues must be explicitly certified by an authorized departmental officer.
- [x] **Two-Day Accountability SLA**: Dynamic 48-hour deadline per department calculated from task assignment timestamp.
- [x] **Delay Management Workflow**: Mandatory categorization (`RECORDS_UNAVAILABLE`, `MANUAL_VERIFICATION`, etc.), explanation, expected resolution date, and next actions.
- [x] **Rejection Workflow**: Enforces mandatory reason title, detailed explanation, and explicit required student action.
- [x] **Escalation Engine**: Automatic detection and escalation of overdue clearance tasks with notifications to student, staff, and department heads.
- [x] **Digital Certificate Generation**: Built using **OpenPDF** and **ZXing** QR Code generator with institutional seals, department stamps, and SHA-256 cryptographic verification digest.
- [x] **Public Verification Endpoint**: `/api/public/certificates/verify/{certificateId}` enables employers/third parties to verify credentials without exposing confidential student contact data.
- [x] **Immutable Audit Trail**: High-integrity logging (`Propagation.REQUIRES_NEW`) of all critical state transitions.
- [x] **Demo Environment Isolation**: Clear visual labeling of mock records and fast single-click evaluation account switcher.

---

## 3. Technology Stack

### Backend
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.3.2
- **Security**: Spring Security 6 with stateless Bearer JWT & method-level security
- **Data & ORM**: Spring Data JPA, Hibernate, PostgreSQL & H2 (in PostgreSQL mode for dev/test)
- **Database Migrations**: Flyway (V1 schema, V2 seeds)
- **Document & QR Generation**: OpenPDF 1.3.43 & ZXing 3.5.3
- **API Documentation**: SpringDoc OpenAPI 2.5.0 / Swagger UI
- **Build Tool**: Apache Maven 3.9

### Frontend
- **Framework**: React 18 with TypeScript
- **Tooling**: Vite 5
- **Styling**: Vanilla Tailwind CSS (clean light enterprise SaaS theme)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Date Utilities**: date-fns
- **HTTP Client**: Axios with JWT interceptors

---

## 4. Evaluation Credentials (Demo Environment)

All demo accounts can be selected with **a single click** on the login page or switched on-the-fly using the top **Demo Environment banner**:

| Role | Username | Password | Persona & Department |
|---|---|---|---|
| **Student** | `student.alex` | `student123` | Alex Rivera (B.Tech CSE) — Active Clearance |
| **Student** | `student.sarah` | `student123` | Sarah Chen (B.Tech ECE) — Clean Account |
| **Library Staff** | `staff.library` | `staff123` | Eleanor Vance (Central Library) |
| **Hostel Staff** | `staff.hostel` | `staff123` | Rajesh Sharma (Hostel Administration) |
| **Sports Staff** | `staff.sports` | `staff123` | David Miller (Sports & Athletics) |
| **Accounts Staff** | `staff.accounts` | `staff123` | Priya Nair (Accounts & Finance) |
| **Dept Head** | `head.library` | `head123` | Dr. Marcus Reed (Chief Librarian) |
| **College Admin** | `admin` | `admin123` | College Administrator |

---

## 5. Quick Start Guide

### Option A: Local Development

1. **Start Backend**:
   ```bash
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```
   *Runs on `http://localhost:8080` (Swagger docs at `http://localhost:8080/swagger-ui.html`).*

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Runs on `http://localhost:5173`.*

### Option B: Docker Compose (Production Environment)

From the project root:
```bash
docker compose up --build -d
```
*Launches PostgreSQL 16 on port 5432, Spring Boot on port 8080, and Nginx React SPA on port 5173.*

---

## 6. Automated & End-to-End Verification

### Automated Integration Tests
Run tests with Maven:
```bash
cd backend
mvn clean test
```
- **`ClearanceWorkflowIntegrationTest`**: Tests end-to-end flow from request submission across 4 departments, delay handling, approvals, automatic certificate generation, and public QR verification.
- **`SecurityAuthorizationTest`**: Verifies cross-departmental isolation (Library staff cannot approve Accounts tasks) and student privacy boundaries.

### Browser Verification
A complete browser recording demonstrating student login, departmental approvals across Library, Sports, Accounts, and Hostels, automatic digital certificate generation, and public verification was recorded:
- **Video Recording**: `nodues_e2e_demo_1788666731867.webp`
- **Public Verification Stamp**: `certificate_verified_1788667750379.png`

---

## 7. Documentation Index

- [Architecture & Integration Adapters](file:///c:/Users/Lenovo/Downloads/startups/innovx/docs/architecture.md)
- [Database Schema & ER Diagram](file:///c:/Users/Lenovo/Downloads/startups/innovx/docs/database-schema.md)
- [REST API Documentation](file:///c:/Users/Lenovo/Downloads/startups/innovx/docs/api-documentation.md)
- [Security & RBAC Specifications](file:///c:/Users/Lenovo/Downloads/startups/innovx/docs/security.md)
- [Environment Configuration Guide](file:///c:/Users/Lenovo/Downloads/startups/innovx/docs/environment-config.md)
- [Local Development Setup](file:///c:/Users/Lenovo/Downloads/startups/innovx/docs/local-development.md)
- [Docker & Container Setup](file:///c:/Users/Lenovo/Downloads/startups/innovx/docs/docker-setup.md)
- [Testing & Quality Assurance Guide](file:///c:/Users/Lenovo/Downloads/startups/innovx/docs/testing.md)
- [User Roles & Permissions Matrix](file:///c:/Users/Lenovo/Downloads/startups/innovx/docs/user-roles.md)

---

## 8. Known Limitations & Next Steps

1. **Direct ERP Integration**: The current MVP uses authorized manual verification as the reliable baseline; future phases will connect the provided adapter interfaces to Koha REST API, Tally/SAP, and hostel housing databases.
2. **Hardware Security Module (HSM) Digital Signatures**: While certificates currently feature a cryptographic SHA-256 hash and scannable QR verification, future institutional phases can bind X.509 PKI digital certificate signatures (e.g. eMudhra / DSC).
3. **External Email / SMS Delivery**: The notification service includes an asynchronous dispatch abstraction ready for SendGrid / AWS SES / Twilio API keys.
