import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ClearanceRequestDetail, ClearanceTask, NotificationItem } from '../types';
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
  MapPin, 
  Phone, 
  Download, 
  ExternalLink,
  PlusCircle,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Bell,
  CheckCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = useState<ClearanceRequestDetail | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdSuccessRequest, setCreatedSuccessRequest] = useState<ClearanceRequestDetail | null>(null);

  // New request form state
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semester, setSemester] = useState('Semester 8');
  const [reason, setReason] = useState('Graduation & Degree Award');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchActiveRequest = async () => {
    setLoading(true);
    try {
      const [reqRes, notifRes] = await Promise.all([
        api.get<ClearanceRequestDetail>('/students/clearance/active').catch(() => ({ data: null })),
        api.get<NotificationItem[]>('/notifications/recent').catch(() => ({ data: [] })),
      ]);
      setActiveRequest(reqRes.data || null);
      setNotifications(notifRes.data || []);
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
      setCreatedSuccessRequest(res.data);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to submit clearance request.');
    } finally {
      setSubmitting(false);
    }
  };

  // Greeting based on real local time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Real departmental status counts calculated strictly from active request tasks
  const tasks = activeRequest?.tasks || [];
  const approvedTasks = tasks.filter((t) => t.status === 'APPROVED');
  const pendingTasks = tasks.filter((t) => t.status === 'PENDING');
  const delayedTasks = tasks.filter((t) => t.status === 'DELAYED');
  const rejectedTasks = tasks.filter((t) => t.status === 'REJECTED');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* SCREEN 2: TOP HEADER — Greeting & Student Identification */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rgukt-primary text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-lg border border-amber-300/40">
            {user?.fullName?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {getGreeting()}, {user?.fullName || 'Student Scholar'}
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                ID: {user?.studentId || 'N/A'}
              </span>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-rgukt-light text-rgukt-primary border border-brand-200">
                Roll: {user?.rollNo || '2022CS0142'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Program: <strong className="text-slate-800">{user?.program || 'B.Tech Computer Science & Engineering'}</strong> • Rajiv Gandhi University of Knowledge Technologies
            </p>
          </div>
        </div>

        {!activeRequest && !loading && (
          <button
            onClick={() => {
              setCreatedSuccessRequest(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rgukt-primary hover:bg-rgukt-navy text-white rounded-xl text-xs font-bold shadow-xs transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Raise Clearance Request
          </button>
        )}
      </div>

      {loading && (
        <div className="py-20 text-center text-xs text-slate-500 space-y-2">
          <div className="w-8 h-8 border-2 border-rgukt-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Retrieving student institutional clearance records...</p>
        </div>
      )}

      {/* Honest Empty State: No Active Request */}
      {!loading && !activeRequest && (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 max-w-2xl mx-auto space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-rgukt-light text-rgukt-primary flex items-center justify-center mx-auto border border-brand-200">
            <FileText className="w-7 h-7" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No Active Clearance Request</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Eliminate physical paper forms and repeated department visits. Initiate one digital clearance application to automatically coordinate Library, Hostels, Sports, and Accounts under the institutional 48-hour SLA.
          </p>
          <div>
            <button
              onClick={() => {
                setCreatedSuccessRequest(null);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rgukt-primary hover:bg-rgukt-navy text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              Raise Clearance Request
            </button>
          </div>
        </div>
      )}

      {!loading && activeRequest && (
        <>
          {/* Certificate Ready Banner if completed */}
          {activeRequest.overallStatus === 'COMPLETED' && activeRequest.certificateNumber && (
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold">Official No-Dues Certificate Issued!</h2>
                    <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                      {activeRequest.certificateNumber}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    All institutional departments have approved your clearance. Your certificate is authentic and verifiable online.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/certificate/${activeRequest.certificateId}`}
                  className="px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  View Certificate
                </Link>
                <a
                  href={`/api/certificates/${activeRequest.certificateId}/pdf`}
                  download
                  className="px-4 py-2 bg-emerald-950/60 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              </div>
            </div>
          )}

          {/* SECTION 8: BLOCKER-FIRST STUDENT UX */}
          {rejectedTasks.length > 0 && (
            <div className="space-y-3">
              {rejectedTasks.map((task) => (
                <div 
                  key={task.id}
                  className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-rose-200/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 block">
                          ACTION REQUIRED • CLEARANCE BLOCKED
                        </span>
                        <h2 className="text-sm font-bold text-rose-950">
                          {task.departmentName} has rejected your clearance request.
                        </h2>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-rose-200 text-rose-900">
                      Hold Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5 bg-white/80 p-3.5 rounded-xl border border-rose-200">
                      <span className="text-[10px] font-bold uppercase text-slate-500 block">
                        Reason / Issue Identified:
                      </span>
                      <p className="font-bold text-rose-950 text-xs">
                        {task.rejectionInfo?.reasonTitle || `${task.departmentName} requires your attention.`}
                      </p>
                      <p className="text-slate-700 text-xs leading-relaxed">
                        {task.rejectionInfo?.explanation || 'A clearance hold has been recorded against your candidate record. Please resolve this hold to proceed.'}
                      </p>
                    </div>

                    <div className="space-y-1.5 bg-white/80 p-3.5 rounded-xl border border-rose-200 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-rose-700 block">
                          👉 What You Need To Do:
                        </span>
                        <p className="font-bold text-rose-950 text-xs mt-0.5 leading-relaxed">
                          {task.rejectionInfo?.requiredStudentAction || 'Contact the department coordinator to settle outstanding records.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-rose-100 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{task.officeLocation}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <a href={`mailto:${task.officialEmail}`} className="text-rose-700 font-semibold hover:underline">
                            {task.officialEmail}
                          </a>
                        </div>
                        {task.officialPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{task.officialPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DELAY NOTICE IF APPLICABLE */}
          {delayedTasks.length > 0 && (
            <div className="space-y-3">
              {delayedTasks.map((task) => (
                <div 
                  key={task.id}
                  className="bg-amber-50 border border-amber-300 rounded-2xl p-5 space-y-2 text-xs text-amber-900 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
                    <div className="flex items-center gap-2 font-bold text-amber-950 text-xs">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Clearance Delay Notice: {task.departmentName}</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                      Under Review / Delayed
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-800 block">Delay Category</span>
                      <span className="font-semibold text-amber-950">{task.delayInfo?.category || 'Manual Verification'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-800 block">Department Explanation</span>
                      <p className="text-amber-900">{task.delayInfo?.explanation || 'Staff verification in progress.'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-amber-800 block">Expected Resolution</span>
                      <p className="text-amber-950 font-bold">{task.delayInfo?.expectedResolutionDate || 'Pending'} • Next: {task.delayInfo?.nextAction || 'Verification'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CLEARANCE REQUEST SUMMARY & PROGRESS GAUGE */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Clearance Request
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-mono font-bold text-slate-900">
                    #CLR-{activeRequest.id.substring(0, 8).toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">
                    • Academic Year: <strong>{activeRequest.academicYear}</strong> ({activeRequest.semester})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Submitted: {format(new Date(activeRequest.createdAt), 'dd MMM yyyy, hh:mm a')}
                </span>
                <StatusBadge status={activeRequest.overallStatus} size="md" />
              </div>
            </div>

            {/* REAL PROGRESS BAR & EXPLICIT COUNTERS */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  {approvedTasks.length} of {tasks.length} departments cleared
                </span>
                <span className="text-xs font-bold text-rgukt-primary">
                  {activeRequest.progressPercentage}% Completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-3">
                <div
                  className="bg-rgukt-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${activeRequest.progressPercentage}%` }}
                />
              </div>

              {/* Real Counters (Strictly from backend response) */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                <span className="text-emerald-700 font-bold">Approved: {approvedTasks.length}</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">Pending: {pendingTasks.length}</span>
                {delayedTasks.length > 0 && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-amber-700">Delayed: {delayedTasks.length}</span>
                  </>
                )}
                {rejectedTasks.length > 0 && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-rose-700 font-bold">Rejected: {rejectedTasks.length}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* DEPARTMENT STATUS CARDS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Department Clearance Audit Status
                </h2>
                <p className="text-xs text-slate-500">
                  Real records from institutional department ledgers.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                SLA: 48 Hours
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => {
                const config = getDepartmentConfig(task.departmentCode);
                const Icon = config.icon;

                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-2xl p-5 border transition shadow-xs flex flex-col justify-between ${
                      task.status === 'APPROVED'
                        ? 'border-emerald-200 bg-emerald-50/15'
                        : task.status === 'DELAYED'
                        ? 'border-amber-200 bg-amber-50/15'
                        : task.status === 'REJECTED'
                        ? 'border-rose-200 bg-rose-50/15'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Top Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${config.badgeBg} ${config.badgeText} border ${config.badgeBorder}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-900 leading-tight">
                              {task.departmentName}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-500 font-semibold">
                              Code: {task.departmentCode}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={task.status} size="sm" />
                      </div>

                      {/* Approval Remarks */}
                      {task.status === 'APPROVED' && (
                        <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verification Record Reconciled</span>
                          </div>
                          <p className="text-xs text-emerald-900">
                            {task.verificationRemarks || 'Verified against department records. No outstanding dues.'}
                          </p>
                          {task.referenceNumber && (
                            <p className="text-[11px] font-mono text-emerald-800">
                              Ref: {task.referenceNumber}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Delay Details */}
                      {task.status === 'DELAYED' && task.delayInfo && (
                        <div className="mt-3.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-amber-950 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Delay: {task.delayInfo.category}</span>
                          </div>
                          <p className="text-xs text-amber-900">
                            {task.delayInfo.explanation}
                          </p>
                          <p className="text-[11px] text-amber-800 font-medium">
                            Expected: <strong>{task.delayInfo.expectedResolutionDate}</strong> • Next: {task.delayInfo.nextAction}
                          </p>
                        </div>
                      )}

                      {/* Rejection Details */}
                      {task.status === 'REJECTED' && task.rejectionInfo && (
                        <div className="mt-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-rose-950 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Issue: {task.rejectionInfo.reasonTitle}</span>
                          </div>
                          <p className="text-xs text-rose-900">
                            {task.rejectionInfo.explanation}
                          </p>
                          <div className="p-2 bg-white/80 rounded border border-rose-200 font-semibold text-rose-950 text-[11px]">
                            👉 Action Required: {task.rejectionInfo.requiredStudentAction}
                          </div>
                        </div>
                      )}

                      {/* Pending state notice */}
                      {task.status === 'PENDING' && (
                        <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Awaiting departmental verification</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Target SLA resolution date: {format(new Date(task.dueAt), 'dd MMM yyyy')}.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Responsible Office Contact Details */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{task.officeLocation}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a href={`mailto:${task.officialEmail}`} className="truncate hover:text-rgukt-primary hover:underline">
                            {task.officialEmail}
                          </a>
                        </div>
                        {task.officialPhone && (
                          <div className="flex items-center gap-1 text-slate-400 whitespace-nowrap">
                            <Phone className="w-3 h-3" />
                            <span>{task.officialPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 9: LOWER SECTION — THREE USEFUL MODULES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* A. RECENT NOTIFICATIONS */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-rgukt-primary" />
                  <h3 className="text-sm font-bold text-slate-900">Recent Notifications</h3>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">Real Log</span>
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No new notifications.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs space-y-1 transition ${
                        n.read ? 'bg-slate-50/60 border-slate-200' : 'bg-rgukt-light/40 border-brand-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-[11px] truncate max-w-[180px]">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* B. YOUR TIMELINE */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rgukt-primary" />
                  <h3 className="text-sm font-bold text-slate-900">Your Clearance Timeline</h3>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">Accountability Chain</span>
              </div>

              <TimelineView events={activeRequest.timeline} />
            </div>
          </div>

          {/* C. QUICK ACTIONS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Candidate Quick Actions</h3>
              <p className="text-[11px] text-slate-500">Official tools and verifiable resources for your clearance</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeRequest.certificateId && (
                <>
                  <Link
                    to={`/certificate/${activeRequest.certificateId}`}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>View Certificate</span>
                  </Link>

                  <a
                    href={`/api/certificates/${activeRequest.certificateId}/pdf`}
                    download
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rgukt-primary hover:bg-rgukt-navy flex items-center gap-1.5 transition shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                </>
              )}

              <Link
                to="/verify-certificate"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify Online</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* SCREEN 3: RAISE CLEARANCE REQUEST MODAL WITH SUCCESS STATE */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setShowCreateModal(false)}
            />

            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-200">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Raise Clearance Request
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Submit one request to coordinate all departments
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 rounded-md p-1"
                >
                  ✕
                </button>
              </div>

              {createdSuccessRequest ? (
                /* Proper Success State */
                <div className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Clearance Request Submitted</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Your single digital application has been created and assigned across all 4 institutional departments.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-left space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Request ID:</span>
                      <span className="font-mono font-bold text-slate-900">#{createdSuccessRequest.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Overall Status:</span>
                      <span className="font-bold text-amber-700">In Progress</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SLA Window:</span>
                      <span className="font-semibold text-slate-800">48 Hours Per Department</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rgukt-primary hover:bg-rgukt-navy shadow-xs transition"
                  >
                    Track Clearance
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      1. Academic Year
                    </label>
                    <input
                      type="text"
                      required
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      2. Semester Term
                    </label>
                    <input
                      type="text"
                      required
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      3. Reason for Clearance
                    </label>
                    <input
                      type="text"
                      required
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-1 w-full text-xs rounded-xl border border-slate-300 px-3.5 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-xs font-bold text-white bg-rgukt-primary hover:bg-rgukt-navy rounded-xl shadow-xs transition disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Clearance Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
