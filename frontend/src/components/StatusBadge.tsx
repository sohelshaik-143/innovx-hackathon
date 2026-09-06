import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle, FileText, MinusCircle } from 'lucide-react';
import { Badge } from './ui/Badge';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const normalized = (status || '').toUpperCase().trim();

  let variant: 'success' | 'warning' | 'error' | 'navy' | 'olive' | 'neutral' = 'neutral';
  let label = status || 'Not Available';
  let icon: React.ReactNode = null;

  switch (normalized) {
    case 'APPROVED':
    case 'CLEARED':
    case 'COMPLETED':
    case 'ISSUED':
      variant = 'success';
      label = normalized === 'APPROVED' ? '✓ Approved' : normalized === 'CLEARED' ? '✓ Cleared' : normalized;
      icon = showIcon ? <CheckCircle2 className="w-3.5 h-3.5" /> : null;
      break;

    case 'PENDING':
    case 'IN_PROGRESS':
    case 'UNDER_REVIEW':
    case 'AWAITING_VERIFICATION':
      variant = 'warning';
      label = normalized === 'IN_PROGRESS' ? '! In Progress' : '! Pending Review';
      icon = showIcon ? <Clock className="w-3.5 h-3.5" /> : null;
      break;

    case 'REJECTED':
    case 'REJECTED_NEEDS_ACTION':
    case 'ACTION_REQUIRED':
      variant = 'error';
      label = normalized.includes('NEEDS_ACTION') ? '× Action Required' : '× Rejected';
      icon = showIcon ? <XCircle className="w-3.5 h-3.5" /> : null;
      break;

    case 'NOT_STARTED':
    case 'SUBMITTED':
      variant = 'navy';
      label = normalized === 'NOT_STARTED' ? 'Not Started' : 'Submitted';
      icon = showIcon ? <MinusCircle className="w-3.5 h-3.5" /> : null;
      break;

    default:
      variant = 'neutral';
      label = status || 'Awaiting data';
      icon = showIcon ? <AlertTriangle className="w-3.5 h-3.5" /> : null;
      break;
  }

  return (
    <Badge variant={variant} size={size} icon={icon} className={className}>
      {label}
    </Badge>
  );
};
