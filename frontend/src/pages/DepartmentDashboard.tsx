import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ClearanceTask, DepartmentKpi } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TaskActionModal } from '../components/TaskActionModal';
import {
  Building2,
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  CheckSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

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
      const kpiRes = await api.get<DepartmentKpi>(`/departments/${user.departmentId}/kpis`).catch(() => ({ data: null }));
      if (kpiRes.data) {
        setKpis(kpiRes.data);
      }

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
      setTasks([]);
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

  const handleTaskUpdated = () => {
    fetchDepartmentData();
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
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-olive-600 px-2 py-0.5 rounded bg-olive-100 border border-olive-200">
              Department Verification Officer Workspace
            </span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-navy-50 text-navy-700 border border-navy-200">
              {user?.departmentCode || 'DEPT'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-700 tracking-tight mt-1">
            {user?.departmentName || 'Department'} Operational Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Officer: <span className="font-bold text-slate-800">{user?.fullName}</span> ({user?.email})
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchDepartmentData}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Queue
        </Button>
      </div>

      {/* KPIS / STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Queue"
          value={kpis?.pendingCount}
          subtitle="Requests awaiting staff audit"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          color="amber"
        />
        <StatCard
          title="Approved Clearance"
          value={kpis?.approvedCount}
          subtitle="Dues reconciled & cleared"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          color="emerald"
        />
        <StatCard
          title="SLA Breaches"
          value={kpis?.overdueCount}
          subtitle="Exceeded 48h resolution SLA"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          color="rose"
        />
        <StatCard
          title="Total Audited"
          value={(kpis?.approvedCount || 0) + (kpis?.rejectedCount || 0)}
          subtitle="Total candidate requests processed"
          icon={<Building2 className="w-5 h-5 text-navy-600" />}
          color="navy"
        />
      </div>

      {/* FILTER & SEARCH BAR */}
      <Card>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'OVERDUE'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-olive-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status === 'ALL' ? 'All Queue' : status === 'PENDING' ? 'Pending' : status === 'APPROVED' ? 'Approved' : status === 'REJECTED' ? 'Rejected' : 'SLA Breaches'}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidate name or ID..."
                className="w-full text-xs rounded-xl border border-slate-300 pl-8 pr-3 py-2 bg-white focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
              />
            </div>
            <Button variant="secondary" size="sm" type="submit">
              Search
            </Button>
          </form>
        </div>
      </Card>

      {/* OPERATIONAL QUEUE TABLE */}
      {tasks.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            title="No Requests in Queue"
            description={
              statusFilter !== 'ALL'
                ? `No clearance requests match status '${statusFilter}'. Change filter criteria to inspect other items.`
                : 'There are currently no student clearance requests pending review for your department.'
            }
            icon={<CheckCircle2 className="w-8 h-8 text-emerald-600" />}
          />
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Candidate Student</th>
                  <th className="py-3.5 px-4">Roll / Student ID</th>
                  <th className="py-3.5 px-4">Request Date</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{task.studentName || 'Student Candidate'}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{task.officialEmail || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {task.studentRollNo || task.studentIdNumber || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {task.assignedAt ? format(new Date(task.assignedAt), 'MMM dd, yyyy') : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={task.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant={task.status === 'PENDING' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => openActionModal(task)}
                        leftIcon={<CheckSquare className="w-3.5 h-3.5" />}
                      >
                        {task.status === 'PENDING' ? 'Audit & Clear' : 'View Details'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Task Action Modal */}
      {selectedTask && (
        <TaskActionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          task={selectedTask}
          onSuccess={handleTaskUpdated}
        />
      )}
    </div>
  );
};
