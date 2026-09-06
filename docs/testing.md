# Testing & Quality Assurance Guide

CampusClear includes automated tests covering end-to-end workflows, security constraints, and boundary conditions.

---

## 1. Running Automated Tests

Run the test suite with Maven:

```bash
cd backend
mvn clean test
```

### Test Coverage Highlights:
1. **`ClearanceWorkflowIntegrationTest`**:
   - Student Sarah Chen logs in.
   - Submits clearance request -> confirms 4 tasks created under 48h SLA.
   - Library approves clearance.
   - Hostel records delay (verifies mandatory category, explanation, expected date).
   - Hostel approves clearance.
   - Sports approves clearance.
   - Accounts approves clearance.
   - Validates that the request status automatically transitions to `COMPLETED`.
   - Validates that the `Certificate` is generated with unique number and SHA-256 hash.
   - Unauthenticated test validates public verification endpoint (`/api/public/certificates/verify/{certNumber}`) returns `valid: true`.
   - Validates that binary PDF download endpoint serves valid PDF.
2. **`SecurityAuthorizationTest`**:
   - Cross-department rejection: Library staff attempting to approve an Accounts task receives `403 Forbidden`.
   - Student privacy: Student A attempting to access Student B's clearance request receives `403 Forbidden`.

---

## 2. Manual End-to-End Walkthrough Scenarios

| Step | Persona | Action | Expected Result |
|---|---|---|---|
| 1 | Student Alex | View Dashboard | Sees active request, progress bar, 4 department cards, and delay reason on Hostel card |
| 2 | Sports Staff | Approve Sports Task | Enters remarks, confirms approval, status changes to Approved |
| 3 | Accounts Staff | Approve Accounts Task | Enters remarks, confirms approval, status changes to Approved |
| 4 | Hostel Staff | Approve Hostel Task | Switches from Delay to Approve, confirms approval |
| 5 | Student Alex | Return to Dashboard | "No-Dues Certificate Ready!" banner appears with View Certificate and Download PDF buttons |
| 6 | Public Verifier | Scan QR / Open Verification | Authenticity confirmed with institutional seal and verified departments |
| 7 | College Admin | View Governance Dashboard | Inspects SLA slider, department KPIs, and immutable audit trail |
