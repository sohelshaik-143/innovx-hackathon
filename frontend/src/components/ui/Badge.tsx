import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'olive' | 'navy' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-bold rounded-md tracking-tight';

  const variants = {
    olive: 'bg-olive-100 text-olive-700 border border-olive-200',
    navy: 'bg-navy-50 text-navy-700 border border-navy-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    error: 'bg-rose-50 text-rose-800 border border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon}
      <span>{children}</span>
    </span>
  );
};
