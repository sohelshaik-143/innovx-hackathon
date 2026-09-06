import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Certificate } from '../types';
import { 
  Award, 
  Download, 
  CheckCircle2, 
  ArrowLeft, 
  Building2, 
  Calendar, 
  QrCode, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { format } from 'date-fns';

export const CertificateViewPage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      setLoading(true);
      try {
        const res = await api.get<Certificate>(`/certificates/${certificateId}`);
        setCertificate(res.data);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || 'Failed to retrieve certificate.');
      } finally {
        setLoading(false);
      }
    };
    if (certificateId) {
      fetchCertificate();
    }
  }, [certificateId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading certificate credentials...
      </div>
    );
  }

  if (errorMsg || !certificate) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-slate-200 rounded-2xl text-center space-y-3">
        <p className="text-xs text-rose-700 font-semibold">{errorMsg || 'Certificate not found'}</p>
        <Link to="/student" className="text-xs text-brand-600 font-bold inline-block">
          Return to Student Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/student"
          className="text-xs font-semibold text-slate-600 hover:text-brand-600 flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={certificate.qrVerificationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-1 shadow-2xs transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Public Verification
          </a>

          <a
            href={`/api/certificates/${certificate.id}/pdf`}
            download
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Download Official PDF
          </a>
        </div>
      </div>

      {/* Certificate Sheet Display */}
      <div className="bg-white rounded-3xl border-2 border-slate-300 shadow-xl p-8 sm:p-12 relative overflow-hidden">
        {/* Subtle Guilloche / Institutional Watermark */}
        <div className="absolute inset-0 border-8 border-double border-slate-100 rounded-2xl pointer-events-none" />

        {/* Certificate Header */}
        <div className="text-center pb-6 border-b border-slate-200">
          <div className="mx-auto w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-2 shadow-xs">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
            {certificate.institutionName}
          </h1>
          <p className="text-xs font-extrabold text-brand-700 tracking-wider uppercase mt-1">
            Official Digital No-Dues Clearance Certificate
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Certificate Number: <span className="font-mono font-bold text-slate-700">{certificate.certificateNumber}</span>
          </p>
        </div>

        {/* Certificate Body */}
        <div className="py-8 space-y-6 text-center max-w-2xl mx-auto">
          <p className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
            This is to officially certify that
          </p>

          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {certificate.studentName}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
              <span>Student ID: <strong className="text-slate-800">{certificate.studentId}</strong></span>
              <span>•</span>
              <span>University Roll No: <strong className="text-slate-800">{certificate.rollNo}</strong></span>
            </div>
            <p className="text-xs font-semibold text-brand-800 mt-1">
              {certificate.program} ({certificate.batchYear})
            </p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-xl mx-auto">
            has fulfilled all institutional responsibilities and completed comprehensive digital clearance across all administrative, residential, athletic, and financial divisions of the college.
          </p>
        </div>

        {/* Department Verification Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
          <div className="bg-slate-800 text-white text-[11px] font-bold px-4 py-2 flex items-center justify-between">
            <span>Departmental Clearances Verified</span>
            <span>Zero Outstanding Dues</span>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {certificate.verifications.map((v, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50">
                <div>
                  <span className="font-bold text-slate-900">{v.departmentName}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Verified by: {v.verifiedBy} {v.referenceNumber && `(Ref: ${v.referenceNumber})`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold text-emerald-700 bg-emerald-100">
                    <CheckCircle2 className="w-3 h-3" />
                    Reconciled
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {v.verifiedAt ? format(new Date(v.verifiedAt), 'dd MMM yyyy') : 'Verified'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Stamp & Verification Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cryptographic Tamper-Proof Stamp</span>
            </div>
            <p className="text-[10px] text-slate-500 max-w-xs font-mono break-all">
              SHA-256: {certificate.verificationHash}
            </p>
            <p className="text-[10px] text-slate-400">
              Issued: {format(new Date(certificate.issueDate), 'dd MMMM yyyy, hh:mm a')}
            </p>
          </div>

          <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <QrCode className="w-12 h-12 text-slate-700 mx-auto" />
            <span className="text-[10px] font-semibold text-brand-700 block">
              Scan to Verify Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
