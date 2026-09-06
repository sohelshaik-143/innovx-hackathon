import React, { useState } from 'react';
import { ClearanceTask, DelayCategory } from '../types';
import api from '../api/client';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface TaskActionModalProps {
  task: ClearanceTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedTask: ClearanceTask) => void;
}

export const TaskActionModal: React.FC<TaskActionModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'APPROVE' | 'REJECT' | 'DELAY'>('APPROVE');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Approve state
  const [remarks, setRemarks] = useState('');
  const [refNumber, setRefNumber] = useState('');

  // Reject state
  const [reasonTitle, setReasonTitle] = useState('');
  const [rejectExplanation, setRejectExplanation] = useState('');
  const [studentAction, setStudentAction] = useState('');

  // Delay state
  const [delayCategory, setDelayCategory] = useState<DelayCategory>('MANUAL_VERIFICATION');
  const [delayExplanation, setDelayExplanation] = useState('');
  const [expectedDate, setExpectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [nextAction, setNextAction] = useState('');

  if (!isOpen || !task) return null;

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.post<ClearanceTask>(`/tasks/${task.id}/approve`, {
        verificationRemarks: remarks || 'Verified against department records. No dues.',
        referenceNumber: refNumber || undefined,
      });
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to approve task.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonTitle.trim() || !rejectExplanation.trim() || !studentAction.trim()) {
      setErrorMsg('All fields (Reason Title, Explanation, Required Student Action) are mandatory.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.post<ClearanceTask>(`/tasks/${task.id}/reject`, {
        reasonTitle: reasonTitle.trim(),
        explanation: rejectExplanation.trim(),
        requiredStudentAction: studentAction.trim(),
      });
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to reject task.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delayExplanation.trim() || !expectedDate || !nextAction.trim()) {
      setErrorMsg('All delay fields (Category, Explanation, Expected Date, Next Action) are mandatory.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.post<ClearanceTask>(`/tasks/${task.id}/delay`, {
        category: delayCategory,
        explanation: delayExplanation.trim(),
        expectedResolutionDate: expectedDate,
        nextAction: nextAction.trim(),
      });
      onSuccess(res.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to mark task delayed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200">
          {/* Modal Header */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Verify Clearance: {task.departmentName}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Task ID: {task.id.substring(0, 8)}... | SLA Deadline: {new Date(task.dueAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-md p-1 transition"
            >
              ✕
            </button>
          </div>

          {/* Action Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-100/60 p-1 gap-1">
            <button
              type="button"
              onClick={() => { setActiveTab('APPROVE'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'APPROVE'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Approve (No Dues)
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('DELAY'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'DELAY'
                  ? 'bg-white text-amber-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Mark Delayed
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('REJECT'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'REJECT'
                  ? 'bg-white text-rose-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Reject with Reason
            </button>
          </div>

          <div className="p-6">
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: APPROVE */}
            {activeTab === 'APPROVE' && (
              <form onSubmit={handleApprove} className="space-y-4">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-800 leading-relaxed">
                  <strong className="font-semibold">Institutional Verification:</strong> By approving, you legally confirm that the student has fulfilled all obligations with {task.departmentName} and owes ₹0 dues.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verification Remarks (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="e.g., Records cross-checked against department database. All items returned."
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department Reference / Voucher # (Optional)
                  </label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder="e.g., LIB-2026-09-V482"
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition disabled:opacity-50"
                  >
                    {loading ? 'Approving...' : 'Confirm Approval'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: DELAY */}
            {activeTab === 'DELAY' && (
              <form onSubmit={handleDelay} className="space-y-4">
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
                  <strong className="font-semibold">Accountability Rule:</strong> All delays require a mandatory reason category, detailed explanation, and an expected resolution date.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason Category *
                  </label>
                  <select
                    value={delayCategory}
                    onChange={(e) => setDelayCategory(e.target.value as DelayCategory)}
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="MANUAL_VERIFICATION">Manual Physical Record Verification</option>
                    <option value="RECORDS_UNAVAILABLE">Records Temporarily Unavailable</option>
                    <option value="SYSTEM_ISSUE">Department System / ERP Issue</option>
                    <option value="STUDENT_CLARIFICATION_REQUIRED">Student Clarification Required</option>
                    <option value="STAFF_UNAVAILABLE">Authorized Officer In Transit / Unavailable</option>
                    <option value="OTHER">Other Institutional Cause</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Explanation * (Visible to student)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={delayExplanation}
                    onChange={(e) => setDelayExplanation(e.target.value)}
                    placeholder="e.g., Physical equipment inventory verification scheduled for tomorrow morning."
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expected Resolution Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={expectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setExpectedDate(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Next Departmental Action *
                    </label>
                    <input
                      type="text"
                      required
                      value={nextAction}
                      onChange={(e) => setNextAction(e.target.value)}
                      placeholder="e.g., Inspect equipment & upload log"
                      className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition disabled:opacity-50"
                  >
                    {loading ? 'Recording...' : 'Record Delay Explanation'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: REJECT */}
            {activeTab === 'REJECT' && (
              <form onSubmit={handleReject} className="space-y-4">
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-xs text-rose-900 leading-relaxed">
                  <strong className="font-semibold">Rejection Mandate:</strong> Rejecting pauses the clearance request. You must specify the exact grounds and direct student instructions.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rejection Reason Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={reasonTitle}
                    onChange={(e) => setReasonTitle(e.target.value)}
                    placeholder="e.g., Outstanding Library Books / Unreturned Kit"
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Explanation *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={rejectExplanation}
                    onChange={(e) => setRejectExplanation(e.target.value)}
                    placeholder="e.g., 2 reference books issued on 2026-08-10 remain unreturned according to circulation desk."
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required Student Action *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={studentAction}
                    onChange={(e) => setStudentAction(e.target.value)}
                    placeholder="e.g., Return books to Library circulation counter or pay replacement fee."
                    className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Rejection & Notify Student'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
