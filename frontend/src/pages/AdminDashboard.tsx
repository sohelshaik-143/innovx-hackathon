import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { 
  AdminDashboardStats, 
  SlaConfig, 
  AuditLog, 
  Department, 
  DepartmentKpi 
} from '../types';
import { 
  SlidersHorizontal, 
  Building2, 
  ShieldCheck, 
  Clock, 
  AlertOctagon, 
  CheckCircle2, 
  Save, 
  RefreshCw, 
  Plus, 
  FileText,
  Search,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

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
  const [auditAction, setAuditAction] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, slaRes, logsRes, deptRes] = await Promise.all([
        api.get<AdminDashboardStats>('/admin/stats'),
        api.get<SlaConfig>('/admin/sla'),
        api.get<{ content: AuditLog[] }>('/admin/audit-logs'),
        api.get<Department[]>('/departments'),
      ]);

      setStats(statsRes.data);
      setSlaConfig(slaRes.data);
      setSlaHours(slaRes.data.slaHours || 48);
      setAuditLogs(logsRes.data.content || []);
      setDepartments(deptRes.data);
    } catch {
      // ignore
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
      alert(`SLA check completed: ${res.data.escalatedTasksCount} overdue tasks evaluated/escalated.`);
      fetchAdminData();
    } catch {
      alert('SLA check failed.');
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingDept(true);
    try {
      await api.post('/admin/departments', {
        code: deptCode.toUpperCase(),
        name: deptName,
        officialEmail: deptEmail,
        officeLocation: deptLocation,
        officialPhone: deptPhone,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Title */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Governance &amp; Administration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global management of clearance departments, SLA accountability, escalations, and immutable audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerSlaCheck}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
            title="Scan for SLA deadline breaches now"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Evaluate SLA Overdue Tasks
          </button>

          <button
            onClick={() => setShowDeptModal(true)}
            className="px-3 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Department
          </button>
        </div>
      </div>

      {/* Global Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Active Requests</span>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {stats ? stats.totalActiveRequests : 0}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Completed & Certified</span>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            {stats ? stats.completedRequests : 0}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pending Verification</span>
          <p className="text-2xl font-black text-slate-700 mt-2">
            {stats ? stats.pendingRequests : 0}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-700">Overdue SLA Breaches</span>
          <p className="text-2xl font-black text-rose-700 mt-2">
            {stats ? stats.overdueRequests : 0}
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-purple-700">Active Escalations</span>
          <p className="text-2xl font-black text-purple-800 mt-2">
            {stats ? stats.activeEscalations : 0}
          </p>
        </div>
      </div>

      {/* SLA Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal className="w-5 h-5 text-brand-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Configurable Institutional SLA Policy
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-6 max-w-2xl leading-relaxed">
          The two-day accountability SLA is dynamically computed from each task's assignment timestamp. Modifying this threshold will automatically govern all future clearance task deadlines.
        </p>

        <form onSubmit={handleUpdateSla} className="max-w-md space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
              <label>Processing SLA (Hours)</label>
              <span className="text-brand-700 font-bold">
                {slaHours} Hours ({(slaHours / 24).toFixed(1)} Days)
              </span>
            </div>
            <input
              type="range"
              min="12"
              max="168"
              step="12"
              value={slaHours}
              onChange={(e) => setSlaHours(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>12h</span>
              <span>24h (1 day)</span>
              <span className="font-bold text-slate-700">48h (Default 2 days)</span>
              <span>72h (3 days)</span>
              <span>7 days</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={savingSla}
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {savingSla ? 'Updating...' : 'Save SLA Settings'}
            </button>
            {slaSuccess && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Updated successfully
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Department Performance Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Department Performance &amp; Accountability Records
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {stats?.hasSufficientData ? 'Live Records' : 'Not enough data for percentage projections'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.departmentPerformance?.map((dept) => (
            <div
              key={dept.departmentId}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 truncate">
                  {dept.departmentName}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border text-slate-600 font-semibold">
                  {dept.departmentCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Pending</span>
                  <span className="text-sm font-bold text-slate-800">{dept.pendingCount}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Approved</span>
                  <span className="text-sm font-bold text-emerald-700">{dept.approvedCount}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Delayed</span>
                  <span className="text-sm font-bold text-amber-700">{dept.delayedCount}</span>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200">
                  <span className="text-[10px] text-slate-500 block">Overdue</span>
                  <span className="text-sm font-bold text-rose-700">{dept.overdueCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Audit Logs Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Institutional Audit Trail (Immutable)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cryptographically timestamped log of approvals, rejections, delays, SLA adjustments, and certificate events.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-600">
              <tr>
                <th className="px-4 py-2.5 text-left">Timestamp</th>
                <th className="px-4 py-2.5 text-left">User / Role</th>
                <th className="px-4 py-2.5 text-left">Action</th>
                <th className="px-4 py-2.5 text-left">Entity</th>
                <th className="px-4 py-2.5 text-left">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 15).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {format(new Date(log.timestamp), 'dd MMM, hh:mm:ss a')}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-bold text-slate-900 block">{log.username}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{log.role || 'SYSTEM'}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[11px] font-bold text-brand-700">
                    {log.action}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[11px] text-slate-700 block">{log.entityType}</span>
                    <span className="text-[10px] text-slate-400 font-mono">#{log.entityId.substring(0, 8)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 text-[11px] max-w-sm truncate">
                    {log.details || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Department Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setShowDeptModal(false)} />

            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-200">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Register Clearance Department
                </h3>
                <button
                  onClick={() => setShowDeptModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDepartment} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Code (e.g., HOSTELS, PLACEMENT) *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    placeholder="PLACEMENT"
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Official Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="Training & Placement Cell"
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={deptEmail}
                    onChange={(e) => setDeptEmail(e.target.value)}
                    placeholder="placement.clearance@campus.edu"
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Physical Office Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptLocation}
                    onChange={(e) => setDeptLocation(e.target.value)}
                    placeholder="Career Services Building, Room 201"
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Phone (Optional)
                  </label>
                  <input
                    type="text"
                    value={deptPhone}
                    onChange={(e) => setDeptPhone(e.target.value)}
                    placeholder="+1 (555) 234-9988"
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeptModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingDept}
                    className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs transition"
                  >
                    {creatingDept ? 'Creating...' : 'Register Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
