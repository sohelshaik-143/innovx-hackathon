import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ClearanceTask, DepartmentKpi, TaskStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TaskActionModal } from '../components/TaskActionModal';
import {
  Building2,
  Search,
  Clock,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Filter,
  ArrowUpDown,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import { format } from 'date-fns';

export const DepartmentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ClearanceTask[]>([]);
  const [kpis, setKpis] = useState<DepartmentKpi | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<ClearanceTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDepartmentData = async () => {
    if (!user?.departmentId) return;
    setLoading(true);
    try {
      // Fetch KPIs
      const kpiRes = await api.get<DepartmentKpi>(`/departments/${user.departmentId}/kpis`).catch(() => ({ data: null }));
      if (kpiRes.data) {
        setKpis(kpiRes.data);
      }

      // Fetch Tasks
      const params: any = {};
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'OVERDUE') {
          params.isOverdue = true;
        } else {
          params.status = statusFilter;
        }
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const tasksRes = await api.get<{ content: ClearanceTask[] }>('/tasks', { params });
      setTasks(tasksRes.data.content || []);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentData();
  }, [user?.departmentId, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDepartmentData();
  };

  const openActionModal = (task: ClearanceTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleTaskUpdated = (updated: ClearanceTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    fetchDepartmentData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Department Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {user?.departmentName || 'Department'} Clearance Queue
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
              {user?.departmentCode || 'DEPT'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as {user?.fullName} ({user?.head ? 'Department Head' : 'Department Staff'})
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>SLA: <strong>48 Hours</strong></span>
          </div>
        </div>
      </div>

      {/* Operational KPIs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setStatusFilter('PENDING')}
          className={`cursor-pointer p-4 rounded-xl border transition shadow-2xs ${statusFilter === 'PENDING'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${statusFilter === 'PENDING' ? 'text-slate-300' : 'text-slate-500'}`}>
              Pending
            </span>
            <Clock className={`w-4 h-4 ${statusFilter === 'PENDING' ? 'text-slate-300' : 'text-slate-400'}`} />
          </div>
          <p className="text-2xl font-bold mt-2">{kpis?.pendingCount ?? 0}</p>
        </div>

        <div
          className="p-4 rounded-xl border bg-white border-slate-200 shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Due Today</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{kpis?.dueTodayCount ?? 0}</p>
        </div>

        <div
          onClick={() => setStatusFilter('OVERDUE')}
          className={`cursor-pointer p-4 rounded-xl border transition shadow-2xs ${statusFilter === 'OVERDUE'
              ? 'bg-rose-900 text-white border-rose-900'
              : 'bg-white border-rose-200 hover:border-rose-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${statusFilter === 'OVERDUE' ? 'text-rose-200' : 'text-rose-700'}`}>
              Overdue (SLA)
            </span>
            <AlertOctagon className={`w-4 h-4 ${statusFilter === 'OVERDUE' ? 'text-rose-200' : 'text-rose-600'}`} />
          </div>
          <p className={`text-2xl font-bold mt-2 ${statusFilter === 'OVERDUE' ? 'text-white' : 'text-rose-700'}`}>
            {kpis?.overdueCount ?? 0}
          </p>
        </div>

        <div
          onClick={() => setStatusFilter('DELAYED')}
          className={`cursor-pointer p-4 rounded-xl border transition shadow-2xs ${statusFilter === 'DELAYED'
              ? 'bg-amber-800 text-white border-amber-800'
              : 'bg-white border-amber-200 hover:border-amber-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${statusFilter === 'DELAYED' ? 'text-amber-200' : 'text-amber-700'}`}>
              Delayed
            </span>
            <AlertTriangle className={`w-4 h-4 ${statusFilter === 'DELAYED' ? 'text-amber-200' : 'text-amber-600'}`} />
          </div>
          <p className={`text-2xl font-bold mt-2 ${statusFilter === 'DELAYED' ? 'text-white' : 'text-amber-800'}`}>
            {kpis?.delayedCount ?? 0}
          </p>
        </div>

        <div
          onClick={() => setStatusFilter('APPROVED')}
          className={`cursor-pointer p-4 rounded-xl border transition shadow-2xs ${statusFilter === 'APPROVED'
              ? 'bg-emerald-900 text-white border-emerald-900'
              : 'bg-white border-emerald-200 hover:border-emerald-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${statusFilter === 'APPROVED' ? 'text-emerald-200' : 'text-emerald-700'}`}>
              Approved
            </span>
            <CheckCircle2 className={`w-4 h-4 ${statusFilter === 'APPROVED' ? 'text-emerald-200' : 'text-emerald-600'}`} />
          </div>
          <p className={`text-2xl font-bold mt-2 ${statusFilter === 'APPROVED' ? 'text-white' : 'text-emerald-800'}`}>
            {kpis?.approvedCount ?? 0}
          </p>
        </div>

        <div
          onClick={() => setStatusFilter('REJECTED')}
          className={`cursor-pointer p-4 rounded-xl border transition shadow-2xs ${statusFilter === 'REJECTED'
              ? 'bg-rose-950 text-white border-rose-950'
              : 'bg-white border-rose-200 hover:border-rose-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold ${statusFilter === 'REJECTED' ? 'text-rose-200' : 'text-rose-700'}`}>
              Rejected
            </span>
            <XCircle className={`w-4 h-4 ${statusFilter === 'REJECTED' ? 'text-rose-200' : 'text-rose-600'}`} />
          </div>
          <p className={`text-2xl font-bold mt-2 ${statusFilter === 'REJECTED' ? 'text-white' : 'text-rose-800'}`}>
            {kpis?.rejectedCount ?? 0}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Student ID, Name, or Request ID..."
            className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </form>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Filter:</span>
          {['ALL', 'PENDING', 'OVERDUE', 'DELAYED', 'APPROVED', 'REJECTED'].map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setStatusFilter(filterKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${statusFilter === filterKey
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {filterKey}
            </button>
          ))}
        </div>
      </div>

      {/* Task Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-600">
              <tr>
                <th scope="col" className="px-5 py-3 text-left">Student Info</th>
                <th scope="col" className="px-4 py-3 text-left">Request ID</th>
                <th scope="col" className="px-4 py-3 text-left">Assigned At</th>
                <th scope="col" className="px-4 py-3 text-left">SLA Deadline</th>
                <th scope="col" className="px-4 py-3 text-left">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Loading department tasks...
                  </td>
                </tr>
              )}

              {!loading && tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No clearance tasks found matching the current filter.
                  </td>
                </tr>
              )}

              {!loading &&
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">
                        {task.studentName || 'Student Pending'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {task.studentIdNumber || task.studentRollNo || `Task #${task.id.substring(0, 8)}`}
                        {task.studentProgram ? ` • ${task.studentProgram}` : ''}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      {task.requestId.substring(0, 8)}...
                    </td>

                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                      {format(new Date(task.assignedAt), 'dd MMM yyyy, hh:mm a')}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={task.overdue ? 'text-rose-700 font-bold' : 'text-slate-700 font-medium'}>
                          {format(new Date(task.dueAt), 'dd MMM, hh:mm a')}
                        </span>
                        {task.overdue && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={task.status} size="sm" />
                      {task.delayInfo && (
                        <span className="block text-[10px] text-amber-700 mt-1 truncate max-w-xs font-medium">
                          Delay: {task.delayInfo.explanation}
                        </span>
                      )}
                      {task.rejectionInfo && (
                        <span className="block text-[10px] text-rose-700 mt-1 truncate max-w-xs font-medium">
                          Rejection: {task.rejectionInfo.reasonTitle}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => openActionModal(task)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition shadow-2xs"
                      >
                        Verify / Action
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      <TaskActionModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTaskUpdated}
      />
    </div>
  );
};
