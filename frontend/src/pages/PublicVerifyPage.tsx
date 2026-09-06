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
  Lock,
  QrCode,
  Check
} from 'lucide-react';
import { format } from 'date-fns';

export const PublicVerifyPage: React.FC = () => {
  const { certificateNumber } = useParams<{ certificateNumber?: string }>();
  const [searchInput, setSearchInput] = useState(certificateNumber || '');
  const [result, setResult] = useState<PublicCertificateVerify | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const performVerification = async (certId: string) => {
    if (!certId.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setSearched(true);
    try {
      const res = await api.get<PublicCertificateVerify>(`/public/certificates/verify/${certId.trim()}`);
      setResult(res.data);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Certificate could not be verified.');
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

  // Extract student name and ID if studentIdentifier follows "Name (ID)" format
  const parsedStudent = React.useMemo(() => {
    if (!result?.studentIdentifier) return { name: 'N/A', id: 'N/A' };
    const match = result.studentIdentifier.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      return { name: match[1], id: match[2] };
    }
    return { name: result.studentIdentifier, id: result.studentIdentifier };
  }, [result?.studentIdentifier]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Institutional Topbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-slate-900 hover:text-brand-600 transition">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight block text-slate-900 leading-tight">
                RGUKT Certificate Authority
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                Rajiv Gandhi University of Knowledge Technologies
              </span>
            </div>
          </Link>
          <Link
            to="/login"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 py-1.5 px-3 rounded-lg border border-brand-200 bg-brand-50/50 hover:bg-brand-50 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Sign In to Portal
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Title & Search Section */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mb-3 border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Institutional Certificate Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Verify the authenticity and digital integrity of official No-Dues clearance certificates issued by Rajiv Gandhi University of Knowledge Technologies (RGUKT).
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Certificate Number (e.g. CERT-2026-...)"
                className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 shadow-2xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchInput.trim()}
              className="px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verify
                </>
              )}
            </button>
          </form>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 text-center mb-6 shadow-2xs space-y-1">
            <div className="font-bold flex items-center justify-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Certificate could not be verified</span>
            </div>
            <p className="text-rose-600">{errorMsg}</p>
          </div>
        )}

        {/* Verification Result Card */}
        {result && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-3xl mx-auto">
            {/* Status Ribbon - Explicitly Green & "CERTIFICATE VALID" ONLY if result.valid === true */}
            {result.valid ? (
              <div className="p-5 bg-emerald-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold tracking-tight">
                      CERTIFICATE VALID
                    </h2>
                    <p className="text-xs text-emerald-100 font-medium">
                      Authentic digital clearance confirmed by RGUKT Authority
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-black/20 border border-white/20 inline-block">
                    {result.certificateNumber}
                  </span>
                  <span className="text-[10px] text-emerald-100 block mt-1">
                    Verified: {result.verificationTimestamp ? format(new Date(result.verificationTimestamp), 'dd MMM yyyy, hh:mm a') : 'Now'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-rose-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold tracking-tight">
                      CERTIFICATE COULD NOT BE VERIFIED
                    </h2>
                    <p className="text-xs text-rose-100 font-medium">
                      {result.statusMessage || 'This record is either non-existent or has been formally revoked.'}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded bg-black/20 border border-white/20 inline-block">
                    {result.certificateNumber}
                  </span>
                </div>
              </div>
            )}

            {/* Valid Certificate Details */}
            {result.valid && (
              <div className="p-6 sm:p-8 space-y-6">
                {/* Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block text-[11px]">Student Legal Name</span>
                    <span className="text-slate-900 font-bold text-sm mt-0.5 block">
                      {parsedStudent.name}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block text-[11px]">Institutional Student ID</span>
                    <span className="text-slate-900 font-mono font-bold text-sm mt-0.5 block">
                      {parsedStudent.id}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block text-[11px]">Certificate Number</span>
                    <span className="text-slate-900 font-mono font-bold text-xs mt-0.5 block break-all">
                      {result.certificateNumber}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block text-[11px]">Awarding Institution</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block">
                      {result.institutionName || 'Rajiv Gandhi University of Knowledge Technologies'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block text-[11px]">Academic Program</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block">
                      {result.program || 'Undergraduate'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-medium block text-[11px]">Official Issue Date</span>
                    <span className="text-slate-800 font-semibold mt-0.5 block">
                      {result.issueDate ? format(new Date(result.issueDate), 'dd MMMM yyyy') : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Departmental Clearances Checklist */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3.5">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Department Clearances Verified
                    </h3>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      Zero Institutional Dues
                    </span>
                  </div>

                  {result.verifiedDepartments && result.verifiedDepartments.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {result.verifiedDepartments.map((dept, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white text-xs shadow-2xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800 block">{dept.departmentName}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {dept.verifiedAt ? format(new Date(dept.verifiedAt), 'dd MMM yyyy, hh:mm a') : 'Verified'}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            <Check className="w-3.5 h-3.5" />
                            Cleared
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                      Standard departmental reconciliation confirmed.
                    </div>
                  )}
                </div>

                {/* Scannable Verification QR Code Display */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                      <Lock className="w-4 h-4 text-slate-500" />
                      <span>Cryptographic Verification &amp; Tamper-Proof Audit</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">
                      This record is stored and timestamped directly in the RGUKT clearance registry. Anyone with this certificate ID can independently verify these credentials.
                    </p>
                  </div>

                  <div className="shrink-0 text-center p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <img
                      src={`/api/public/certificates/qr/${result.certificateNumber}`}
                      alt={`Verification QR Code for ${result.certificateNumber}`}
                      className="w-20 h-20 mx-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fb = document.getElementById('public-qr-fallback');
                        if (fb) fb.style.display = 'block';
                      }}
                    />
                    <div id="public-qr-fallback" style={{ display: 'none' }}>
                      <QrCode className="w-16 h-16 text-slate-700 mx-auto" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 block mt-1">
                      Scannable QR
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Initial Empty State before searching */}
        {!result && !errorMsg && !loading && (
          <div className="max-w-md mx-auto text-center py-12 px-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <QrCode className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Certificate Queried</h3>
            <p className="text-xs text-slate-500">
              Enter an official Certificate ID in the search field above or scan the QR code located on any physical or digital RGUKT No-Dues Certificate.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
