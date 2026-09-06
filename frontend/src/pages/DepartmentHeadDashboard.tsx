import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ClearanceTask, DepartmentKpi } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TaskActionModal } from '../components/TaskActionModal';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  Check,
  SlidersHorizontal
} from 'lucide-react';
import { safeFormat } from '../utils/dateUtils';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const DepartmentHeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<DepartmentKpi | null>(null);
  const [tasks, setTasks] = useState<ClearanceTask[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedTask, setSelectedTask] = useState<ClearanceTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    if (!user?.departmentId) return;
    setLoading(true);
    try {
      const kpiRes = await api.get<DepartmentKpi>(`/departments/${user.departmentId}/kpis`).catch(() => ({ data: null }));
      if (kpiRes.data) {
        setKpis(kpiRes.data);
      }

      const [overdueRes, delayedRes, escRes] = await Promise.all([
        api.get<{ content: ClearanceTask[] }>('/tasks', { params: { isOverdue: true } }).catch(() => ({ data: { content: [] } })),
        api.get<{ content: ClearanceTask[] }>('/tasks', { params: { status: 'DELAYED' } }).catch(() => ({ data: { content: [] } })),
        api.get<{ content: any[] }>('/escalations').catch(() => ({ data: { content: [] } })),
      ]);

      const overdue = overdueRes.data?.content || [];
      const delayed = delayedRes.data?.content || [];
      
      const map = new Map<string, ClearanceTask>();
      delayed.forEach((t) => map.set(t.id, t));
      overdue.forEach((t) => map.set(t.id, t));
      setTasks(Array.from(map.values()));

      setEscalations(escRes.data?.content || []);
    } catch {
      // fallback empty state
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

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
        <Skeleton variant="table" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-700 px-2 py-0.5 rounded bg-navy-50 border border-navy-200">
              Department Head Executive Portal
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-olive-100 text-olive-700 border border-olive-200">
              {user?.departmentCode || 'HEAD'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-700 tracking-tight mt-1">
            Executive Oversight: {user?.departmentName || 'Department'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Department Head: <span className="font-bold text-slate-800">{user?.fullName}</span>
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchData}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Overview
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Escalation Alerts"
          value={kpis?.unresolvedEscalationsCount}
          subtitle="Awaiting Head intervention"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          color="rose"
        />
        <StatCard
          title="Overdue Tasks"
          value={kpis?.overdueCount}
          subtitle="Exceeded 48h SLA timeframe"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          color="amber"
        />
        <StatCard
          title="Pending Queue"
          value={kpis?.pendingCount}
          subtitle="Currently in staff audit"
          icon={<ShieldCheck className="w-5 h-5 text-navy-600" />}
          color="navy"
        />
        <StatCard
          title="Approved Clearance"
          value={kpis?.approvedCount}
          subtitle="Total verified cleared"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          color="emerald"
        />
      </div>

      {/* ESCALATIONS SECTION */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Departmental Escalations Inbox</span>
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {escalations.length} Active Escalations
            </span>
          </div>
        }
      >
        {escalations.length === 0 ? (
          <EmptyState
            title="No Active Escalations"
            description="Your department has zero unresolved SLA escalations. All clearance requests are processing within designated timeframes."
            icon={<CheckCircle2 className="w-8 h-8 text-emerald-600" />}
          />
        ) : (
          <div className="space-y-3">
            {escalations.map((esc) => (
              <div key={esc.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">SLA Escalation</span>
                    <span className="text-[11px] text-slate-500">
                      {safeFormat(esc.createdAt, 'MMM dd, yyyy', 'Recent')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 font-semibold">
                    {esc.reason || 'SLA processing deadline exceeded for candidate request.'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Candidate: {esc.studentName || 'Student'} ({esc.studentRollNo || esc.studentId || 'N/A'})
                  </p>
                </div>

                {resolvingId === esc.id ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Resolution notes..."
                      className="text-xs rounded-xl border border-slate-300 px-3 py-1.5 bg-white"
                    />
                    <Button variant="primary" size="sm" onClick={() => handleResolveEscalation(esc.id)} leftIcon={<Check className="w-3.5 h-3.5" />}>
                      Resolve
                    </Button>
                  </div>
                ) : (
                  <Button variant="danger" size="sm" onClick={() => setResolvingId(esc.id)}>
                    Expedite &amp; Resolve
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* DEPARTMENT ATTENTION QUEUE: DELAYED & OVERDUE TASKS */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-navy-700">
                Department Attention Queue (Delayed &amp; Overdue Requests)
              </h3>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {tasks.length} Requires Oversight
            </span>
          </div>
        }
      >
        {tasks.length === 0 ? (
          <EmptyState
            title="All Clear — Zero Bottlenecks"
            description="There are currently no delayed or overdue clearance tasks in your department. All clearance operations are processing within SLA."
            icon={<CheckCircle2 className="w-8 h-8 text-emerald-600" />}
          />
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs space-y-3 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {task.studentName || 'Student'}
                      </span>
                      <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {task.studentRollNo || task.studentIdNumber || 'N/A'}
                      </span>
                      {task.studentProgram && (
                        <span className="text-xs text-slate-500 hidden sm:inline">
                          • {task.studentProgram}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Assigned Officer: <span className="font-semibold text-slate-700">{task.assignedStaffName || 'Clearance Desk'}</span> • Due: {safeFormat(task.dueAt, 'MMM dd, yyyy • hh:mm a', 'Within 48h')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {task.overdue && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Overdue SLA
                      </span>
                    )}
                    <StatusBadge status={task.status} size="sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsModalOpen(true);
                      }}
                      leftIcon={<SlidersHorizontal className="w-3 h-3" />}
                    >
                      Executive Action
                    </Button>
                  </div>
                </div>

                {/* Delay reason information */}
                {task.delayInfo ? (
                  <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-900 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Delay Category: {task.delayInfo.category?.replace(/_/g, ' ')}
                      </span>
                      {task.delayInfo.expectedResolutionDate && (
                        <span className="text-[11px] text-amber-800 font-medium">
                          Expected Resolution: {safeFormat(task.delayInfo.expectedResolutionDate, 'MMM dd, yyyy')}
                        </span>
                      )}
                    </div>
                    <p className="text-amber-950 font-medium leading-relaxed">
                      {task.delayInfo.explanation}
                    </p>
                    {task.delayInfo.nextAction && (
                      <p className="text-[11px] text-amber-800 pt-1 border-t border-amber-200/60">
                        <span className="font-semibold">Next Action: </span>
                        {task.delayInfo.nextAction}
                      </p>
                    )}
                  </div>
                ) : (
                  task.overdue && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
                      <span>Task exceeded default 48-hour institutional verification SLA. Immediate action recommended.</span>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <TaskActionModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
};
