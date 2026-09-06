import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'table';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
}) => {
  const base = 'animate-pulse bg-slate-200/70 rounded-lg';

  if (variant === 'circle') {
    return <div className={`${base} rounded-full ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`p-5 rounded-2xl border border-slate-200 bg-white space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-4 w-1/3 bg-slate-200 animate-pulse rounded" />
          <div className="h-8 w-8 bg-slate-200 animate-pulse rounded-xl" />
        </div>
        <div className="h-8 w-1/2 bg-slate-200 animate-pulse rounded" />
        <div className="h-3 w-3/4 bg-slate-200 animate-pulse rounded" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 w-full bg-slate-100 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return <div className={`${base} h-4 w-full ${className}`} />;
};
