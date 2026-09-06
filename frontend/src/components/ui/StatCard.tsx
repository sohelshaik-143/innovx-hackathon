import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number | null | undefined;
  icon?: React.ReactNode;
  subtitle?: string;
  trend?: string;
  badge?: React.ReactNode;
  color?: 'olive' | 'navy' | 'emerald' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  trend,
  badge,
  color = 'olive',
}) => {
  const isAvailable = value !== null && value !== undefined && value !== '';
  const displayValue = isAvailable ? value : 'Awaiting data';

  const iconBg = {
    olive: 'bg-olive-100 text-olive-700 border-olive-200',
    navy: 'bg-navy-50 text-navy-700 border-navy-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
        {icon && (
          <div className={`p-2 rounded-xl border ${iconBg[color]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <h3 className={`font-black tracking-tight ${isAvailable ? 'text-2xl sm:text-3xl text-slate-900' : 'text-base font-semibold text-slate-400 italic'}`}>
          {displayValue}
        </h3>
        {badge}
      </div>

      {(subtitle || trend) && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span>{subtitle}</span>}
          {trend && <span className="font-semibold text-olive-600">{trend}</span>}
        </div>
      )}
    </div>
  );
};
