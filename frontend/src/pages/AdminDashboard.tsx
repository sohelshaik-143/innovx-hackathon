import React, { useEffect, useState } from 'react';
import api from '../api/client';
import {
  AdminDashboardStats,
  SlaConfig,
  AuditLog,
  Department
} from '../types';
import {
  SlidersHorizontal,
  Building2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Save,
  RefreshCw,
  Plus,
  Search,
  Users,
  Award,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [slaConfig, setSlaConfig] = useState<SlaConfig | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // SLA form state
  const [slaHours, setSlaHours] = useState(48);
  const [savingSla, setSavingSla] = useState(false);
  const [slaSuccess, setSlaSuccess] = useState(false);

  // New Department modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptEmail, setDeptEmail] = useState('');
  const [deptLocation, setDeptLocation] = useState('');
  const [deptPhone, setDeptPhone] = useState('');
  const [creatingDept, setCreatingDept] = useState(false);

  // Audit filter state
  const [auditSearch, setAuditSearch] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, slaRes, logsRes, deptRes] = await Promise.all([
        api.get<AdminDashboardStats>('/admin/stats').catch(() => ({ data: null })),
        api.get<SlaConfig>('/admin/sla').catch(() => ({ data: null })),
        api.get<{ content: AuditLog[] }>('/admin/audit-logs').catch(() => ({ data: { content: [] } })),
        api.get<Department[]>('/departments').catch(() => ({ data: [] })),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (slaRes.data) {
        setSlaConfig(slaRes.data);
        setSlaHours(slaRes.data.slaHours || 48);
      }
      setAuditLogs(logsRes.data.content || []);
      setDepartments(deptRes.data || []);
    } catch {
      // fallback empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateSla = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSla(true);
    setSlaSuccess(false);
    try {
      await api.put('/admin/sla', {
        slaHours: Number(slaHours),
        institutionName: slaConfig?.institutionName,
        portalBaseUrl: slaConfig?.portalBaseUrl,
        supportEmail: slaConfig?.supportEmail,
      });
      setSlaSuccess(true);
      fetchAdminData();
      setTimeout(() => setSlaSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update SLA configuration.');
    } finally {
      setSavingSla(false);
    }
  };

  const handleTriggerSlaCheck = async () => {
    try {
      const res = await api.post<{ escalatedTasksCount: number; message: string }>('/escalations/trigger-check');
      alert(res.data.message || `SLA audit check executed. ${res.data.escalatedTasksCount} tasks checked.`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to trigger SLA check.');
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingDept(true);
    try {
      await api.post('/departments', {
        code: deptCode.trim().toUpperCase(),
        name: deptName.trim(),
        officialEmail: deptEmail.trim(),
        officeLocation: deptLocation.trim(),
        officialPhone: deptPhone.trim(),
        active: true,
      });
      setShowDeptModal(false);
      setDeptCode('');
      setDeptName('');
      setDeptEmail('');
      setDeptLocation('');
      setDeptPhone('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create department.');
    } finally {
      setCreatingDept(false);
    }
  };

  const filteredLogs = auditLogs.filter(
    (log) =>
      !auditSearch ||
      log.username?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action?.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.details?.toLowerCase().includes(auditSearch.toLowerCase())
  );

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
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-navy-700 px-2 py-0.5 rounded bg-navy-50 border border-navy-200">
              Central Institutional Governance
            </span>
            <span className="text-xs font-semibold text-slate-400">• RGUKT Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-700 tracking-tight mt-1">
            University Governance Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervising clearance workloads, configuring SLA compliance, and auditing system actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleTriggerSlaCheck}
            leftIcon={<Zap className="w-3.5 h-3.5" />}
          >
            Trigger SLA Audit
          </Button>
          <Button
            variant="outline"
            onClick={fetchAdminData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* SYSTEM STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Active Requests"
          value={stats?.totalActiveRequests}
          subtitle="Registered active clearance requests"
          icon={<Users className="w-5 h-5 text-navy-600" />}
          color="navy"
        />
        <StatCard
          title="Pending Requests"
          value={stats?.pendingRequests}
          subtitle="In-progress multi-dept review"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          color="amber"
        />
        <StatCard
          title="Completed Clearances"
          value={stats?.completedRequests}
          subtitle="Certificates issued"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          color="emerald"
        />
        <StatCard
          title="Overdue Requests"
          value={stats?.overdueRequests}
          subtitle="Overdue department tasks"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          color="rose"
        />
      </div>

      {/* SLA CONFIG & DEPARTMENTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Config Card */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-700 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-olive-600" />
                <span>Global SLA Duration Configuration</span>
              </h3>
            </div>
          }
        >
          <form onSubmit={handleUpdateSla} className="space-y-4">
            {slaSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
                ✓ SLA duration updated to {slaHours} hours successfully.
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700">Department Audit SLA (Hours)</label>
              <input
                type="number"
                min={1}
                max={168}
                required
                value={slaHours}
                onChange={(e) => setSlaHours(Number(e.target.value))}
                className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tasks unreviewed after this timeframe are automatically flagged as SLA Breaches.
              </p>
            </div>

            <Button variant="primary" size="sm" type="submit" isLoading={savingSla} leftIcon={<Save className="w-3.5 h-3.5" />}>
              Save SLA Configuration
            </Button>
          </form>
        </Card>

        {/* Departments List Card */}
        <Card
          className="lg:col-span-2"
          header={
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-olive-600" />
                <span>Active University Departments ({departments.length})</span>
              </h3>
              <Button variant="outline" size="sm" onClick={() => setShowDeptModal(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add Department
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {departments.map((d) => (
              <div key={d.id} className="p-3.5 rounded-xl border border-slate-200 bg-ivory-50/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-700">{d.name}</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-olive-100 text-olive-800 border border-olive-200">
                    {d.code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{d.officialEmail || 'department@campus.edu'}</p>
                <p className="text-[10px] text-slate-400">{d.officeLocation || 'Campus Building'}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* SYSTEM AUDIT TRAIL */}
      <Card
        header={
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <h3 className="text-sm font-bold text-navy-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-olive-600" />
              <span>System-Wide Audit Trail Log</span>
            </h3>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search audit log..."
                className="w-full text-xs rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 bg-white"
              />
            </div>
          </div>
        }
      >
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No Audit Records Found"
            description="No system audit log entries match your search criteria."
            icon={<ShieldCheck className="w-8 h-8 text-olive-600" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredLogs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {log.timestamp ? format(new Date(log.timestamp), 'MMM dd, yyyy • hh:mm a') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.username || 'System'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-navy-50 text-navy-700 border border-navy-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{log.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* CREATE DEPARTMENT MODAL */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-navy-700">Add University Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Department Code (3-6 uppercase letters)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LAB"
                  className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Science & Instrumentation Laboratory"
                  className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Official Email</label>
                <input
                  type="email"
                  required
                  value={deptEmail}
                  onChange={(e) => setDeptEmail(e.target.value)}
                  placeholder="e.g. lab.clearance@campus.edu"
                  className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Office Location</label>
                <input
                  type="text"
                  value={deptLocation}
                  onChange={(e) => setDeptLocation(e.target.value)}
                  placeholder="e.g. Science Block, Room 204"
                  className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setShowDeptModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={creatingDept}>
                  Create Department
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
