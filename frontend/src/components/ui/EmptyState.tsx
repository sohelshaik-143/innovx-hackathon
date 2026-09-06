import React from 'react';
import { Inbox, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`p-8 sm:p-12 rounded-2xl border border-dashed border-slate-300 bg-white/60 text-center space-y-4 max-w-lg mx-auto ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-olive-50 text-olive-600 border border-olive-200 flex items-center justify-center mx-auto shadow-xs">
        {icon || <Inbox className="w-7 h-7" />}
      </div>

      <div className="space-y-1">
        <h4 className="text-base font-bold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={onAction} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
