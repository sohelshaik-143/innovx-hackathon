# REST API Documentation

The platform exposes RESTful APIs documented interactively with OpenAPI / Swagger UI at `/swagger-ui.html` and OpenAPI 3.0 spec at `/v3/api-docs`.

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/login`
Authenticates credentials and returns a Bearer JWT.
- **Request Body**:
  ```json
  {
    "username": "student.alex",
    "password": "student123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "type": "Bearer",
    "userId": "b3e34b9d-...",
    "username": "student.alex",
    "email": "alex.rivera@student.campus.edu",
    "fullName": "Alex Rivera",
    "roles": ["ROLE_STUDENT"],
    "studentId": "32486eaf-...",
    "isDemo": true
  }
  ```

### `GET /api/auth/me`
Retrieves authenticated user profile metadata. Header: `Authorization: Bearer <token>`.

---

## 2. Student Clearance Endpoints (`/api/students`)

### `POST /api/students/clearance`
Initiates a single institutional clearance request.
- **Authorization**: `ROLE_STUDENT`
- **Request Body**:
  ```json
  {
    "academicYear": "2025-2026",
    "semester": "Semester 8",
    "reason": "Graduation & Degree Award"
  }
  ```
- **Response `201 Created`**: Returns `ClearanceRequestDetailDto` with 4 generated tasks.

### `GET /api/students/clearance/active`
Returns the student's active request with department cards and delay/rejection details.

### `GET /api/students/clearance/history`
Returns historical list of clearance requests.

---

## 3. Department Clearance Tasks (`/api/tasks`)

### `GET /api/tasks`
Lists clearance tasks assigned to the caller's department.
- **Query Params**: `status` (PENDING, APPROVED, DELAYED, REJECTED), `isOverdue` (boolean), `search` (string), `page`, `size`.

### `POST /api/tasks/{taskId}/approve`
Verifies records and marks clearance task as `APPROVED`.
- **Request Body**:
  ```json
  {
    "verificationRemarks": "All books returned. No dues outstanding.",
    "referenceNumber": "LIB-VERIF-2026-9021"
  }
  ```

### `POST /api/tasks/{taskId}/delay`
Records delay explanation and expected resolution deadline.
- **Request Body**:
  ```json
  {
    "category": "MANUAL_VERIFICATION",
    "explanation": "Physical room inventory scheduled for tomorrow morning.",
    "expectedResolutionDate": "2026-09-07",
    "nextAction": "Assistant Warden will conduct room check."
  }
  ```

### `POST /api/tasks/{taskId}/reject`
Rejects clearance task with required student actions.
- **Request Body**:
  ```json
  {
    "reasonTitle": "Outstanding Sports Equipment",
    "explanation": "Gym membership fine unpaid and 1 issued badminton racket missing.",
    "requiredStudentAction": "Visit sports office to return racket or settle replacement voucher."
  }
  ```

---

## 4. Certificates & Public Verification (`/api/certificates`, `/api/public/certificates`)

### `GET /api/certificates/{certificateId}`
Returns full certificate metadata, student details, and department clearance breakdown.

### `GET /api/certificates/{certificateId}/pdf`
Downloads binary PDF document with embedded ZXing QR code and institutional seal.
- **Response**: `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="NoDuesCertificate-...pdf"`.

### `GET /api/public/certificates/verify/{certificateIdentifier}`
**Unauthenticated Public Endpoint**:
Validates certificate integrity without exposing sensitive student contact info.
- **Response `200 OK`**:
  ```json
  {
    "valid": true,
    "statusMessage": "Certificate is authentic and digitally verified by institutional authority.",
    "certificateNumber": "CERT-2026-B31F4138",
    "institutionName": "Apex Institute of Technology",
    "studentIdentifier": "Alex Rivera (STU-2024-001)",
    "program": "B.Tech Computer Science & Engineering",
    "issueDate": "2026-09-06T09:30:00",
    "completionDate": "2026-09-06T09:30:00",
    "verificationTimestamp": "2026-09-06T09:35:12",
    "verifiedDepartments": [
      { "departmentName": "Central Library", "verifiedAt": "2026-09-06T08:00:00", "status": "APPROVED" },
      { "departmentName": "Hostel Administration", "verifiedAt": "2026-09-06T09:30:00", "status": "APPROVED" },
      { "departmentName": "Sports Department", "verifiedAt": "2026-09-06T09:28:00", "status": "APPROVED" },
      { "departmentName": "Accounts & Finance", "verifiedAt": "2026-09-06T09:29:00", "status": "APPROVED" }
    ]
  }
  ```

---

## 5. Administrative Governance (`/api/admin`)

### `GET /api/admin/stats`
Calculates active, completed, overdue, and departmental KPI counters.

### `GET /api/admin/sla` & `PUT /api/admin/sla`
Reads or updates the institutional processing SLA (hours).

### `GET /api/admin/audit-logs`
Queries immutable audit logs with filter params: `action`, `entityType`, `departmentCode`, `search`, `page`.
