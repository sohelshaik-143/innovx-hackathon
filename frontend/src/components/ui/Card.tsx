import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  header,
  footer,
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-card transition-all duration-200 hover:shadow-card-hover overflow-hidden ${className}`}>
      {header && (
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30">
          {footer}
        </div>
      )}
    </div>
  );
};
