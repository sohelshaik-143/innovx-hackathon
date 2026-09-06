import { 
  BookOpen, 
  Home, 
  Trophy, 
  CreditCard, 
  Building2,
  LucideIcon 
} from 'lucide-react';

export interface DepartmentConfig {
  code: string;
  name: string;
  shortName: string;
  icon: LucideIcon;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  scopeDescription: string;
  verificationChecklist: string[];
  referenceLabel: string;
  referencePlaceholder: string;
}

export const DEPARTMENT_CONFIGS: Record<string, DepartmentConfig> = {
  LIB: {
    code: 'LIB',
    name: 'Central Library & Learning Resource Center',
    shortName: 'Library',
    icon: BookOpen,
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    badgeText: 'text-blue-700',
    scopeDescription: 'Verification of returned circulation books, non-returned periodicals, and outstanding library overdue fines.',
    verificationChecklist: [
      'Check circulation database for unreturned books or reference media',
      'Verify digital library access card return or deactivation',
      'Confirm zero outstanding overdue fine ledger balance',
    ],
    referenceLabel: 'Circulation Return / Fine Receipt #',
    referencePlaceholder: 'e.g. LIB-REC-2026-8941',
  },
  HST: {
    code: 'HST',
    name: 'Hostel Administration & Student Housing',
    shortName: 'Hostel',
    icon: Home,
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-700',
    scopeDescription: 'Verification of room vacation, room key handover, physical fixture damage assessment, and mess fee reconciliation.',
    verificationChecklist: [
      'Verify caretaker physical room inspection clearance report',
      'Confirm surrender of room key and wardrobe keys',
      'Reconcile mess bill payments and caution deposit balance',
    ],
    referenceLabel: 'Hostel Vacating Clearance Slip #',
    referencePlaceholder: 'e.g. HST-VAC-2026-4412',
  },
  SPT: {
    code: 'SPT',
    name: 'Sports & Athletics Department',
    shortName: 'Sports',
    icon: Trophy,
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    scopeDescription: 'Verification of issued athletic equipment, team kits, locker keys, and sports complex facility dues.',
    verificationChecklist: [
      'Verify return of all athletic kits, rackets, or competition equipment',
      'Confirm sports complex locker key surrender',
      'Check gymnasium subscription dues ledger',
    ],
    referenceLabel: 'Equipment Surrender Voucher #',
    referencePlaceholder: 'e.g. SPT-VCH-2026-1109',
  },
  ACC: {
    code: 'ACC',
    name: 'Accounts & Financial Services Division',
    shortName: 'Accounts',
    icon: CreditCard,
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    badgeText: 'text-purple-700',
    scopeDescription: 'Final financial audit of semester tuition fees, exam fees, caution deposits, scholarship adjustments, and institutional dues.',
    verificationChecklist: [
      'Cross-check ERP tuition fee ledger for all 8 semesters',
      'Confirm examination fee settlement and lab consumables ledger',
      'Verify caution deposit refund or forfeiture adjustment',
    ],
    referenceLabel: 'Fee Clearance Challan / UTR #',
    referencePlaceholder: 'e.g. ACC-CHL-2026-9921',
  },
};

export const DEFAULT_DEPARTMENT_CONFIG: DepartmentConfig = {
  code: 'DEPT',
  name: 'Institutional Clearance Department',
  shortName: 'Department',
  icon: Building2,
  badgeBg: 'bg-slate-50',
  badgeBorder: 'border-slate-200',
  badgeText: 'text-slate-700',
  scopeDescription: 'Departmental records verification and digital clearance confirmation.',
  verificationChecklist: [
    'Verify departmental records and student ledger',
    'Confirm return of all institutional assets and keys',
    'Verify zero outstanding fee or administrative holds',
  ],
  referenceLabel: 'Clearance Record Reference #',
  referencePlaceholder: 'e.g. DEPT-REC-2026-0001',
};

export function getDepartmentConfig(code?: string): DepartmentConfig {
  if (!code) return DEFAULT_DEPARTMENT_CONFIG;
  return DEPARTMENT_CONFIGS[code.toUpperCase()] || {
    ...DEFAULT_DEPARTMENT_CONFIG,
    code: code.toUpperCase(),
    name: `${code.toUpperCase()} Clearance Division`,
    shortName: code.toUpperCase(),
  };
}
