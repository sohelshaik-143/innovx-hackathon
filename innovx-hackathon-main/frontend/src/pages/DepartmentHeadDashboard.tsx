import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ClearanceTask, DepartmentKpi } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { 
  ShieldCheck, 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Users, 
  ArrowRight,
  ShieldAlert,
  Check
} from 'lucide-react';
import { format } from 'date-fns';

export const DepartmentHeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<DepartmentKpi | null>(null);
  const [tasks, setTasks] = useState<ClearanceTask[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchData = async () => {
    if (!user?.departmentId) return;
    setLoading(true);
    try {
      const kpiRes = await api.get<DepartmentKpi>(`/departments/${user.departmentId}/kpis`).catch(() => ({ data: null }));
      if (kpiRes.data) {
        setKpis(kpiRes.data);
      }

      const tasksRes = await api.get<{ content: ClearanceTask[] }>('/tasks', {
        params: { isOverdue: true }
      });
      setTasks(tasksRes.data.content || []);

      const escRes = await api.get<{ content: any[] }>('/escalations');
      setEscalations(escRes.data.content || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.departmentId]);

  const handleResolveEscalation = async (id: string) => {
    try {
      await api.post(`/escalations/${id}/resolve`, {
        notes: resolutionNotes || 'Reviewed and expedited by Department Head.',
      });
      setResolvingId(null);
      setResolutionNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resolve escalation.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Department Head Overview Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Department Head Oversight: {user?.departmentName}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Executive Governance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervising staff verification accuracy, reviewing SLA breaches, and resolving departmental escalations.
          </p>
        </div>
      </div>

      {/* KPI Workload Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Unresolved Escalations</span>
          <p className="text-3xl font-black text-rose-700 mt-2">
            {kpis?.unresolvedEscalationsCount ?? 0}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Overdue Clearance Tasks</span>
          <p className="text-3xl font-black text-red-600 mt-2">{kpis?.overdueCount ?? 0}</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Delayed Verifications</span>
          <p className="text-3xl font-black text-amber-700 mt-2">{kpis?.delayedCount ?? 0}</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Approved & Reconciled</span>
          <p className="text-3xl font-black text-emerald-700 mt-2">{kpis?.approvedCount ?? 0}</p>
        </div>
      </div>

      {/* Escalations Inbox */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Departmental Escalations Inbox
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Triggered automatically upon 48-hour SLA expiration
          </span>
        </div>

        {escalations.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-500">
            No active escalations recorded for this department.
          </div>
        )}

        {escalations.map((esc) => (
          <div
            key={esc.id}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  Escalation #{esc.id.substring(0, 8)}
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">
                  {esc.escalationLevel}
                </span>
                {esc.resolvedAt && (
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    RESOLVED
                  </span>
                )}
              </div>
              <p className="text-slate-700">{esc.reason}</p>
              <p className="text-[11px] text-slate-400">
                Triggered: {format(new Date(esc.triggeredAt), 'dd MMM yyyy, hh:mm a')}
              </p>
            </div>

            {!esc.resolvedAt && (
              <div className="shrink-0 flex items-center gap-2">
                {resolvingId === esc.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Resolution notes..."
                      className="text-xs border rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-brand-500"
                    />
                    <button
                      onClick={() => handleResolveEscalation(esc.id)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold shadow-xs hover:bg-emerald-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setResolvingId(null)}
                      className="px-2 py-1.5 text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setResolvingId(esc.id)}
                    className="px-3 py-1.5 bg-brand-600 text-white rounded-lg font-bold shadow-xs hover:bg-brand-700 transition"
                  >
                    Resolve Escalation
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overdue Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          Overdue Clearance Workload
        </h2>

        {tasks.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">
            No overdue tasks currently in queue. All verifications are within the 2-day SLA.
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">
                    Task ID: {t.id.substring(0, 8)} • Request #{t.requestId.substring(0, 8)}
                  </span>
                  <span className="text-[11px] text-rose-700 font-semibold">
                    Deadline was: {format(new Date(t.dueAt), 'dd MMM yyyy, hh:mm a')}
                  </span>
                </div>
                <StatusBadge status={t.status} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
