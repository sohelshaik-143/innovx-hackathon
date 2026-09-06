import React from 'react';
import { ClearanceTimelineEvent } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Award, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { safeFormat } from '../utils/dateUtils';

interface TimelineViewProps {
  events: ClearanceTimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">
        No chronological clearance history recorded yet.
      </div>
    );
  }

  const getEventIcon = (type: string, status?: string) => {
    switch (type) {
      case 'REQUEST_CREATED':
        return <FileText className="w-4 h-4 text-brand-600" />;
      case 'DEPARTMENTS_ASSIGNED':
        return <Clock className="w-4 h-4 text-slate-500" />;
      case 'STATUS_CHANGE':
        if (status === 'APPROVED') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
        if (status === 'REJECTED') return <XCircle className="w-4 h-4 text-rose-600" />;
        if (status === 'DELAYED') return <Clock className="w-4 h-4 text-amber-600" />;
        return <ArrowRight className="w-4 h-4 text-slate-500" />;
      case 'DELAY_RECORDED':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'REJECTION_RECORDED':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'ESCALATION':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case 'CERTIFICATE_ISSUED':
        return <Award className="w-4 h-4 text-indigo-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getDotBg = (type: string, status?: string) => {
    switch (type) {
      case 'REQUEST_CREATED':
        return 'bg-brand-100 border-brand-300';
      case 'STATUS_CHANGE':
        if (status === 'APPROVED') return 'bg-emerald-100 border-emerald-300';
        if (status === 'REJECTED') return 'bg-rose-100 border-rose-300';
        if (status === 'DELAYED') return 'bg-amber-100 border-amber-300';
        return 'bg-slate-100 border-slate-300';
      case 'DELAY_RECORDED':
        return 'bg-amber-100 border-amber-300';
      case 'REJECTION_RECORDED':
        return 'bg-rose-100 border-rose-300';
      case 'ESCALATION':
        return 'bg-red-100 border-red-300';
      case 'CERTIFICATE_ISSUED':
        return 'bg-indigo-100 border-indigo-300';
      default:
        return 'bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id || eventIdx}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={`h-8 w-8 rounded-full border flex items-center justify-center ring-4 ring-white ${getDotBg(
                      event.eventType,
                      event.status
                    )}`}
                  >
                    {getEventIcon(event.eventType, event.status)}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex justify-between items-baseline gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {event.title}
                    </h4>
                    <time className="text-[11px] text-slate-500 whitespace-nowrap">
                      {safeFormat(event.timestamp, 'dd MMM yyyy, hh:mm a', 'Recent')}
                    </time>
                  </div>
                  {event.departmentName && (
                    <p className="text-[11px] font-medium text-brand-700 mt-0.5">
                      {event.departmentName}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    Actor: {event.actorName || 'System'}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
