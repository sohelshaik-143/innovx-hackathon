# Security & Compliance Architecture

## 1. Authentication & Session Management
- **Stateless Bearer JWT Authentication**: The platform avoids stateful HTTP sessions, scaling horizontally without sticky load balancing.
- **Cryptographic Signing**: Tokens are signed using a minimum 256-bit secret key via `HMAC-SHA256`.
- **Token Claims**: JWT payload encodes `userId`, `username`, `roles`, `studentId`, `departmentId`, and `departmentCode`.
- **Expiration Policy**: Tokens expire after 24 hours (`app.jwt.expiration-ms = 86400000`).

---

## 2. Role-Based Access Control (RBAC) & Authorization Matrix

| Endpoint Group | `STUDENT` | `DEPARTMENT_STAFF` | `DEPARTMENT_HEAD` | `ADMIN` |
|---|---|---|---|---|
| `/api/students/clearance` (Create) | ✅ | ❌ | ❌ | ❌ |
| `/api/students/clearance/active` | ✅ (Own Only) | ❌ | ❌ | ❌ |
| `/api/tasks` (Search / View) | ❌ | ✅ (Own Dept) | ✅ (Own Dept) | ✅ (All Depts) |
| `/api/tasks/{id}/approve` | ❌ | ✅ (Own Dept) | ✅ (Own Dept) | ✅ |
| `/api/tasks/{id}/reject` | ❌ | ✅ (Own Dept) | ✅ (Own Dept) | ✅ |
| `/api/tasks/{id}/delay` | ❌ | ✅ (Own Dept) | ✅ (Own Dept) | ✅ |
| `/api/tasks/{id}/reassign` | ❌ | ❌ | ✅ (Own Dept) | ✅ |
| `/api/escalations` | ❌ | ❌ | ✅ (Own Dept) | ✅ |
| `/api/escalations/{id}/resolve` | ❌ | ❌ | ✅ (Own Dept) | ✅ |
| `/api/admin/**` (SLA, Depts, Audit) | ❌ | ❌ | ❌ | ✅ |
| `/api/public/certificates/verify/**` | 🌐 Public | 🌐 Public | 🌐 Public | 🌐 Public |

---

## 3. Departmental Isolation & Privacy Protection

### 3.1 Strict Department Isolation
In `DepartmentSecurityService.java`:
- A Library staff member attempting to approve, delay, or reject a task belonging to Hostels, Sports, or Accounts is rejected with **`403 Forbidden`**.
- Verified in automated tests via `SecurityAuthorizationTest.java`.

### 3.2 Student Privacy & Request Ownership
- Students can only view requests linked to their own `studentId`.
- Accessing another student's request is rejected with **`403 Forbidden`**.

### 3.3 Public Verification Privacy Protection
- Public certificate verification displays institutional verification stamps and student identifier (Name + ID).
- In compliance with privacy standards, it **NEVER exposes private student phone numbers, email addresses, or physical residence details**.

---

## 4. Tamper-Resistant Digital Credentials
1. **Cryptographic Integrity Hash**:
   Each certificate generates an immutable SHA-256 digest over the legal institution name, certificate number, student identifier, roll number, and completion timestamp.
2. **ZXing Scannable QR Code**:
   Points directly to the public verification URL.
3. **No-Dues Verification Guarantee**:
   The system never generates a certificate unless 100% of required department tasks are in `APPROVED` status with recording staff ID and timestamp.

---

## 5. Immutable Audit Trail
Every administrative action (request creation, task approval, rejection, delay, reassignment, SLA change, certificate issue) writes to `audit_logs` using `Propagation.REQUIRES_NEW`. Ordinary users cannot modify or purge audit entries.
