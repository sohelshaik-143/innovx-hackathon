import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ClearanceRequestDetail, ClearanceTask } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { TimelineView } from '../components/TimelineView';
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
  HelpCircle
} from 'lucide-react';
import { format } from 'date-fns';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = useState<ClearanceRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New request form state
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [semester, setSemester] = useState('Semester 8');
  const [reason, setReason] = useState('Graduation & Degree Award');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchActiveRequest = async () => {
    setLoading(true);
    try {
      const res = await api.get<ClearanceRequestDetail>('/students/clearance/active');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Student Identification Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Welcome, {user?.fullName}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Student ID: {user?.studentId || 'N/A'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Roll No: {user?.rollNo || '2022CS0142'} • Program: {user?.program || 'B.Tech Computer Science'}
          </p>
        </div>

        {!activeRequest && !loading && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            Start No-Dues Clearance
          </button>
        )}
      </div>

      {loading && (
        <div className="py-20 text-center text-sm text-slate-500">
          Loading student clearance records...
        </div>
      )}

      {!loading && !activeRequest && (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No Active Clearance Request</h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            Eliminate physical forms and repeated department visits. Initiate a single digital clearance request to simultaneously coordinate Library, Hostels, Sports, and Accounts.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              Start No-Dues Clearance
            </button>
          </div>
        </div>
      )}

      {!loading && activeRequest && (
        <>
          {/* Certificate Ready Banner if completed */}
          {activeRequest.overallStatus === 'COMPLETED' && activeRequest.certificateNumber && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold">Official No-Dues Certificate Issued!</h2>
                    <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded font-mono font-semibold">
                      {activeRequest.certificateNumber}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    All institutional departments have approved your clearance. Your certificate is authentic and verifiable.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/certificate/${activeRequest.certificateId}`}
                  className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  View Certificate
                </Link>
                <a
                  href={`/api/certificates/${activeRequest.certificateId}/pdf`}
                  download
                  className="px-4 py-2 bg-emerald-800/80 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              </div>
            </div>
          )}

          {/* Clearance Summary Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Clearance Request
                </span>
                <span className="text-xs font-mono font-bold text-slate-800">
                  ID: {activeRequest.id}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Submitted: {format(new Date(activeRequest.createdAt), 'dd MMM yyyy, hh:mm a')}
                </span>
                <StatusBadge status={activeRequest.overallStatus} size="md" />
              </div>
            </div>

            {/* Progress Gauge */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1.5">
                <span>Verification Progress</span>
                <span className="font-bold text-brand-700">
                  {activeRequest.approvedTasks} of {activeRequest.totalTasks} Departments Approved ({activeRequest.progressPercentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-brand-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${activeRequest.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Department Cards Grid (4 MVP Departments) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Departmental Verification Status
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                SLA: 2 calendar days per department
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRequest.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl p-5 border transition shadow-xs flex flex-col justify-between ${
                    task.status === 'APPROVED'
                      ? 'border-emerald-200/80 bg-emerald-50/10'
                      : task.status === 'DELAYED'
                      ? 'border-amber-200/80 bg-amber-50/10'
                      : task.status === 'REJECTED'
                      ? 'border-rose-200/80 bg-rose-50/10'
                      : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 leading-tight">
                            {task.departmentName}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Code: {task.departmentCode}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={task.status} size="sm" />
                    </div>

                    {/* Delay Box if applicable */}
                    {task.delayInfo && task.status === 'DELAYED' && (
                      <div className="mt-3.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-amber-950 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Delay Category: {task.delayInfo.category}</span>
                        </div>
                        <p className="text-xs leading-relaxed text-amber-900">
                          <strong>Reason:</strong> {task.delayInfo.explanation}
                        </p>
                        <p className="text-[11px] text-amber-800">
                          <strong>Expected Resolution:</strong> {task.delayInfo.expectedResolutionDate} • <strong>Next Action:</strong> {task.delayInfo.nextAction}
                        </p>
                      </div>
                    )}

                    {/* Rejection Box if applicable */}
                    {task.rejectionInfo && task.status === 'REJECTED' && (
                      <div className="mt-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-rose-950 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Issue: {task.rejectionInfo.reasonTitle}</span>
                        </div>
                        <p className="text-xs text-rose-900 leading-relaxed">
                          <strong>Explanation:</strong> {task.rejectionInfo.explanation}
                        </p>
                        <div className="p-2 bg-white/80 rounded-lg border border-rose-200 font-semibold text-rose-950 text-xs">
                          👉 Action Required: {task.rejectionInfo.requiredStudentAction}
                        </div>
                      </div>
                    )}

                    {/* Remarks if approved */}
                    {task.status === 'APPROVED' && task.verificationRemarks && (
                      <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900">
                        <span className="font-semibold">Verification Record:</span> {task.verificationRemarks}
                        {task.referenceNumber && (
                          <span className="block text-[11px] text-emerald-800 mt-0.5 font-mono">
                            Ref: {task.referenceNumber}
                          </span>
                        )}
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
                        <span className="truncate">{task.officialEmail}</span>
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
              ))}
            </div>
          </div>

          {/* Chronological Timeline */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-6">
              Chronological Clearance Accountability Timeline
            </h3>
            <TimelineView events={activeRequest.timeline} />
          </div>
        </>
      )}

      {/* Start Clearance Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setShowCreateModal(false)}
            />

            <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-200">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Initiate Digital Clearance Request
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 rounded-md p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester / Term *
                  </label>
                  <input
                    type="text"
                    required
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purpose / Reason for Clearance *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="Graduation & Degree Award">Graduation & Degree Award</option>
                    <option value="Semester Transfer / Migration">Semester Transfer / Migration</option>
                    <option value="Course Completion">Course Completion</option>
                    <option value="Withdrawal of Admission">Withdrawal of Admission</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
                  Submitting this will automatically generate 4 clearance tasks for Library, Hostels, Sports, and Accounts under the institution's 2-day SLA policy.
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
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
