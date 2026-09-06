import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { PublicCertificateVerify } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Search, 
  Building2, 
  Calendar, 
  GraduationCap, 
  ArrowLeft,
  FileCheck,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';

export const PublicVerifyPage: React.FC = () => {
  const { certificateNumber } = useParams<{ certificateNumber?: string }>();
  const [searchInput, setSearchInput] = useState(certificateNumber || '');
  const [result, setResult] = useState<PublicCertificateVerify | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const performVerification = async (certId: string) => {
    if (!certId.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get<PublicCertificateVerify>(`/public/certificates/verify/${certId.trim()}`);
      setResult(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Verification service unreachable.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificateNumber) {
      setSearchInput(certificateNumber);
      performVerification(certificateNumber);
    }
  }, [certificateNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(searchInput);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-slate-800 hover:text-brand-600 transition">
            <Building2 className="w-6 h-6 text-brand-600" />
            <span className="text-sm font-bold tracking-tight">Apex Certification Authority</span>
          </Link>
          <Link
            to="/login"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Portal
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-200">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Certificate Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Verify the authenticity and tamper-free status of official No-Dues clearance certificates issued by Apex Institute of Technology.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Certificate ID (e.g. CERT-2026-...)"
                className="w-full text-xs rounded-lg border border-slate-300 pl-9 pr-3 py-2.5 shadow-2xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        </div>

        {errorMsg && (
          <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center">
            {errorMsg}
          </div>
        )}

        {/* Verification Result Card */}
        {result && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-3xl mx-auto">
            {/* Status Ribbon */}
            <div
              className={`p-4 border-b flex items-center justify-between ${
                result.valid
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-900'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold text-sm">
                {result.valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                <span>{result.statusMessage}</span>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-white/80 border border-slate-300/40">
                {result.certificateNumber}
              </span>
            </div>

            {result.valid && (
              <div className="p-6 space-y-6">
                {/* Meta Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block">Awarding Institution</span>
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                      {result.institutionName}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block">Cleared Student Identifier</span>
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                      {result.studentIdentifier}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block">Academic Program</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block">
                      {result.program}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block">Issue Date</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block">
                      {result.issueDate ? format(new Date(result.issueDate), 'dd MMMM yyyy, hh:mm a') : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Verified Departments Breakdown */}
                {result.verifiedDepartments && result.verifiedDepartments.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      Departmental Clearances Verified
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.verifiedDepartments.map((dept, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs"
                        >
                          <span className="font-semibold text-slate-800">{dept.departmentName}</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy & Integrity Disclaimer */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Institutional Privacy &amp; Cryptographic Security:</strong> This public verification interface confirms that all department dues have been reconciled. In accordance with student privacy mandates, confidential contact details and personal records remain strictly protected.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
