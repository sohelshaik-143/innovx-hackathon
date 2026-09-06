import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ClearanceRequestDetail, NotificationItem } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TimelineView } from '../components/TimelineView';
import { getDepartmentConfig } from '../config/departmentConfig';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Award, 
  Mail, 
  PlusCircle, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { safeFormat, safeFormatDistanceToNow } from '../utils/dateUtils';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = useState<ClearanceRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semester, setSemester] = useState('Semester 8');
  const [reason, setReason] = useState('Graduation & Degree Award');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchActiveRequest = async () => {
    setLoading(true);
    try {
      const res = await api.get<ClearanceRequestDetail>('/students/clearance/active').catch(() => ({ data: null }));
      setActiveRequest(res.data || null);
    } catch {
      setActiveRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRequest();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const res = await api.post<ClearanceRequestDetail>('/students/clearance', {
        academicYear,
        semester,
        reason,
      });
      setActiveRequest(res.data);
      setShowCreateModal(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit clearance request.');
    } finally {
      setSubmitting(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const tasks = activeRequest?.tasks || [];
  const approvedTasks = tasks.filter((t) => t.status === 'APPROVED');
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING');
  const delayedTasks = tasks.filter((t) => t.status === 'DELAYED');
  const rejectedTasks = tasks.filter((t) => t.status === 'REJECTED');

  const overallPercent = activeRequest?.progressPercentage ?? (tasks.length > 0 ? Math.round((approvedTasks.length / tasks.length) * 100) : 0);

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
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* GREETING & HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-olive-600 px-2 py-0.5 rounded bg-olive-100 border border-olive-200">
              Student Candidate Portal
            </span>
            <span className="text-xs font-semibold text-slate-400">• RGUKT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-700 tracking-tight mt-1">
            {getGreeting()}, {user?.fullName || 'Student Candidate'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional Roll Number: <span className="font-bold text-slate-800">{user?.username || user?.studentId || 'Awaiting ID'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!activeRequest && (
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Initiate Clearance Request
            </Button>
          )}
          <Button
            variant="outline"
            onClick={fetchActiveRequest}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* IF NO ACTIVE REQUEST: HONEST EMPTY STATE */}
      {!activeRequest ? (
        <Card className="py-12">
          <EmptyState
            title="No Active Clearance Request Found"
            description="You do not currently have an active clearance request underway. Initiate a single clearance request to begin multi-department review under transparent 48-hour SLAs."
            icon={<FileText className="w-8 h-8 text-olive-600" />}
            actionLabel="Initiate Single Clearance Request"
            onAction={() => setShowCreateModal(true)}
          />
        </Card>
      ) : (
        <>
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Overall Progress"
              value={`${overallPercent}%`}
              subtitle={`${approvedTasks.length} of ${tasks.length} departments cleared`}
              icon={<ShieldCheck className="w-5 h-5 text-olive-600" />}
              color="olive"
            />
            <StatCard
              title="Pending Reviews"
              value={pendingTasks.length}
              subtitle="Awaiting staff audit"
              icon={<Clock className="w-5 h-5 text-amber-600" />}
              color="amber"
            />
            <StatCard
              title="Cleared Departments"
              value={approvedTasks.length}
              subtitle="Dues reconciled"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              color="emerald"
            />
            <StatCard
              title="SLA Breaches"
              value={delayedTasks.length + rejectedTasks.length}
              subtitle={rejectedTasks.length > 0 ? 'Action required' : 'Standard timeframe'}
              icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
              color="rose"
            />
          </div>

          {/* MAIN CLEARANCE SUMMARY CARD */}
          <Card
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-olive-100 border border-olive-200 flex items-center justify-center text-olive-700 font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Clearance Request #{activeRequest.certificateNumber || activeRequest.id.substring(0, 8)}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Initiated on {safeFormat(activeRequest.createdAt, 'MMM dd, yyyy • hh:mm a')}
                    </p>
                  </div>
                </div>
                <StatusBadge status={activeRequest.overallStatus} size="md" />
              </div>
            }
          >
            <div className="space-y-6">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Department Verification Journey</span>
                  <span className="text-olive-600">{overallPercent}% Complete</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-olive-500 transition-all duration-500"
                    style={{ width: `${overallPercent}%` }}
                  />
                </div>
              </div>

              {/* Timeline View */}
              {activeRequest.timeline && activeRequest.timeline.length > 0 && (
                <TimelineView events={activeRequest.timeline} />
              )}

              {/* Digital Certificate Download Banner (If Cleared) */}
              {(activeRequest.overallStatus === 'APPROVED' || activeRequest.overallStatus === 'COMPLETED') && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">Official No-Dues Digital Certificate Issued</h4>
                      <p className="text-xs text-emerald-800">All departments have verified clean records. Download your QR-signed certificate.</p>
                    </div>
                  </div>
                  <Link to={`/certificate/${activeRequest.certificateId || activeRequest.id}`}>
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Certificate
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* DEPARTMENT CLEARANCE CARDS GRID */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-navy-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-olive-600" />
                <span>Department Clearance Breakdown</span>
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                Real-Time Department Statuses
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => {
                const config = getDepartmentConfig(task.departmentCode);
                return (
                  <Card key={task.id} className="hover:border-olive-300">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm">
                            {task.departmentCode?.substring(0, 3)}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                              {task.departmentName}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">{task.officeLocation || 'Campus Office'}</p>
                          </div>
                        </div>
                        <StatusBadge status={task.status} size="sm" />
                      </div>

                      {/* Delay Information Banner */}
                      {task.delayInfo && (
                        <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs space-y-2">
                          <div className="flex items-center justify-between font-bold text-amber-800">
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Delay Reason: {task.delayInfo.category?.replace(/_/g, ' ')}</span>
                            </span>
                            {task.delayInfo.expectedResolutionDate && (
                              <span className="text-[11px] text-amber-700 font-medium">
                                Expected: {safeFormat(task.delayInfo.expectedResolutionDate, 'MMM dd, yyyy')}
                              </span>
                            )}
                          </div>
                          <p className="text-amber-900 leading-relaxed font-medium">
                            {task.delayInfo.explanation}
                          </p>
                          {task.delayInfo.nextAction && (
                            <div className="pt-1.5 border-t border-amber-200/80 text-[11px] text-amber-800">
                              <span className="font-semibold">Next Action: </span>
                              <span>{task.delayInfo.nextAction}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Rejection Information Banner */}
                      {task.rejectionInfo && (
                        <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 text-xs space-y-2">
                          <div className="flex items-center justify-between font-bold text-rose-800">
                            <span className="flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Hold / Dues Issue: {task.rejectionInfo.reasonTitle}</span>
                            </span>
                          </div>
                          <p className="text-rose-900 leading-relaxed font-medium">
                            {task.rejectionInfo.explanation}
                          </p>
                          {task.rejectionInfo.requiredStudentAction && (
                            <div className="pt-1.5 border-t border-rose-200/80 text-[11px] text-rose-800">
                              <span className="font-semibold">Required Action: </span>
                              <span>{task.rejectionInfo.requiredStudentAction}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Staff remarks */}
                      <div className="p-3 rounded-xl bg-ivory-50 border border-slate-200/60 text-xs space-y-1">
                        <span className="font-bold text-slate-700 block">Department Verification Remarks:</span>
                        <p className="text-slate-600 leading-relaxed italic">
                          {task.verificationRemarks || 'No remarks added by department verifier yet.'}
                        </p>
                      </div>

                      {/* Contact Info */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{task.officialEmail || 'department@campus.edu'}</span>
                        </span>
                        <span className="text-slate-400">
                          {safeFormatDistanceToNow(task.completedAt, { addSuffix: true }, 'Awaiting audit')}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* CREATE CLEARANCE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-modal border border-slate-200 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-olive-100 text-olive-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-navy-700">Initiate Single Clearance</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                >
                  <option>2025-2026</option>
                  <option>2024-2025</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                >
                  <option>Semester 8</option>
                  <option>Semester 7</option>
                  <option>Semester 6</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Reason for Clearance</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Graduation & Degree Award"
                  className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="ghost" type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={submitting}>
                  Submit Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
