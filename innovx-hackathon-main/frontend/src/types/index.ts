export type RoleType = 'ROLE_STUDENT' | 'ROLE_DEPARTMENT_STAFF' | 'ROLE_DEPARTMENT_HEAD' | 'ROLE_ADMIN';

export type ClearanceStatus = 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'BLOCKED' | 'COMPLETED';

export type TaskStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELAYED' | 'BLOCKED';

export type DelayCategory =
  | 'RECORDS_UNAVAILABLE'
  | 'SYSTEM_ISSUE'
  | 'MANUAL_VERIFICATION'
  | 'STUDENT_CLARIFICATION_REQUIRED'
  | 'STAFF_UNAVAILABLE'
  | 'OTHER';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  active: boolean;
  demo: boolean;
  departmentId?: string;
  departmentCode?: string;
  departmentName?: string;
  head?: boolean;
  studentId?: string;
  rollNo?: string;
  program?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  studentId?: string;
  departmentId?: string;
  departmentCode?: string;
  departmentName?: string;
  isHead: boolean;
  isDemo: boolean;
}

export interface DelayInfo {
  id: string;
  category: DelayCategory;
  explanation: string;
  expectedResolutionDate: string;
  nextAction: string;
  recordedAt: string;
}

export interface RejectionInfo {
  id: string;
  reasonTitle: string;
  explanation: string;
  requiredStudentAction: string;
  recordedAt: string;
}

export interface ClearanceTask {
  id: string;
  requestId: string;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  officialEmail: string;
  officeLocation: string;
  officialPhone?: string;
  assignedStaffName?: string;
  status: TaskStatus;
  assignedAt: string;
  dueAt: string;
  completedAt?: string;
  overdue: boolean;
  escalatedAt?: string;
  verificationRemarks?: string;
  referenceNumber?: string;
  studentName?: string;
  studentIdNumber?: string;
  studentRollNo?: string;
  studentProgram?: string;
  delayInfo?: DelayInfo;
  rejectionInfo?: RejectionInfo;
}

export interface ClearanceTimelineEvent {
  id: string;
  timestamp: string;
  eventType: string;
  departmentName?: string;
  title: string;
  description: string;
  actorName: string;
  status: string;
}

export interface ClearanceRequestSummary {
  id: string;
  studentId: string;
  rollNo: string;
  studentName: string;
  program: string;
  academicYear: string;
  semester: string;
  reason: string;
  overallStatus: ClearanceStatus;
  totalTasks: number;
  approvedTasks: number;
  delayedTasks: number;
  rejectedTasks: number;
  pendingTasks: number;
  demo: boolean;
  createdAt: string;
  completedAt?: string;
  certificateId?: string;
  certificateNumber?: string;
}

export interface ClearanceRequestDetail {
  id: string;
  studentId: string;
  rollNo: string;
  studentName: string;
  email: string;
  phoneNumber?: string;
  program: string;
  batchYear: string;
  academicDepartment: string;
  academicYear: string;
  semester: string;
  reason: string;
  overallStatus: ClearanceStatus;
  demo: boolean;
  createdAt: string;
  completedAt?: string;
  totalTasks: number;
  approvedTasks: number;
  progressPercentage: number;
  tasks: ClearanceTask[];
  timeline: ClearanceTimelineEvent[];
  certificateId?: string;
  certificateNumber?: string;
  qrVerificationUrl?: string;
}

export interface NotificationItem {
  id: string;
  requestId?: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  requestId: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  program: string;
  batchYear: string;
  academicDepartment: string;
  institutionName: string;
  issueDate: string;
  completionDate: string;
  verificationHash: string;
  qrVerificationUrl: string;
  revoked: boolean;
  verifications: Array<{
    departmentCode: string;
    departmentName: string;
    verifiedBy: string;
    verifiedAt: string;
    remarks?: string;
    referenceNumber?: string;
  }>;
}

export interface PublicCertificateVerify {
  valid: boolean;
  statusMessage: string;
  certificateNumber: string;
  institutionName?: string;
  studentIdentifier?: string;
  program?: string;
  issueDate?: string;
  completionDate?: string;
  verificationTimestamp: string;
  verifiedDepartments?: Array<{
    departmentName: string;
    verifiedAt: string;
    status: string;
  }>;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  officialEmail: string;
  officeLocation: string;
  officialPhone?: string;
  active: boolean;
}

export interface DepartmentKpi {
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  pendingCount: number;
  dueTodayCount: number;
  overdueCount: number;
  delayedCount: number;
  approvedCount: number;
  rejectedCount: number;
  unresolvedEscalationsCount: number;
}

export interface AdminDashboardStats {
  totalActiveRequests: number;
  completedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
  overdueRequests: number;
  activeEscalations: number;
  configuredSlaHours: number;
  hasSufficientData: boolean;
  departmentPerformance: DepartmentKpi[];
}

export interface SlaConfig {
  slaHours: number;
  institutionName: string;
  portalBaseUrl: string;
  supportEmail: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  username: string;
  role?: string;
  departmentCode?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldStatus?: string;
  newStatus?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}
