import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, AlertOctagon, HelpCircle } from 'lucide-react';
import { TaskStatus, ClearanceStatus } from '../types';

interface StatusBadgeProps {
  status: TaskStatus | ClearanceStatus | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const normalized = status.toUpperCase();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = HelpCircle;
  let label = status;

  switch (normalized) {
    case 'APPROVED':
    case 'COMPLETED':
      bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = CheckCircle2;
      label = normalized === 'COMPLETED' ? 'Clearance Completed' : 'Approved';
      break;
    case 'DELAYED':
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      Icon = Clock;
      label = 'Delayed';
      break;
    case 'REJECTED':
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = XCircle;
      label = 'Action Required (Rejected)';
      break;
    case 'PENDING':
      bg = 'bg-slate-100 text-slate-700 border-slate-200';
      Icon = Clock;
      label = 'Pending Verification';
      break;
    case 'IN_PROGRESS':
      bg = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      Icon = Clock;
      label = 'In Progress';
      break;
    case 'OVERDUE':
      bg = 'bg-red-50 text-red-700 border-red-200';
      Icon = AlertOctagon;
      label = 'SLA Overdue';
      break;
    case 'BLOCKED':
      bg = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = AlertTriangle;
      label = 'Blocked';
      break;
    default:
      bg = 'bg-slate-100 text-slate-700 border-slate-200';
      Icon = HelpCircle;
      label = status;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${bg} ${sizeClasses[size]}`}
      role="status"
      aria-label={`Status: ${label}`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} shrink-0`} />}
      <span>{label}</span>
    </span>
  );
};
