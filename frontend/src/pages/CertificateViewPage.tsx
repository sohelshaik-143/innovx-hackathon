import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { Certificate } from '../types';
import {
  Award,
  Download,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  ShieldCheck,
  ExternalLink,
  Printer
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

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
      <div className="max-w-4xl mx-auto py-12 space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  if (errorMsg || !certificate) {
    return (
      <div className="max-w-md mx-auto my-12">
        <Card className="text-center space-y-3 py-8">
          <p className="text-xs text-rose-700 font-semibold">{errorMsg || 'Certificate not found'}</p>
          <Link to="/student">
            <Button variant="outline" size="sm">
              Return to Student Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
        <Link
          to="/student"
          className="text-xs font-bold text-slate-600 hover:text-olive-600 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Candidate Dashboard</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-3.5 h-3.5" />}
          >
            Print
          </Button>

          <a href={certificate.qrVerificationUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
              Public Verification
            </Button>
          </a>

          <a href={`/api/certificates/${certificate.id}/pdf`} download>
            <Button variant="primary" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
              Download Official PDF
            </Button>
          </a>
        </div>
      </div>

      {/* Official Certificate Sheet */}
      <div className="bg-white rounded-3xl border-4 border-double border-olive-500/40 shadow-card-hover p-8 sm:p-12 relative overflow-hidden space-y-8">
        {/* Certificate Watermark Seal */}
        <div className="text-center space-y-2 pb-6 border-b border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-olive-500 text-white flex items-center justify-center mx-auto shadow-md mb-3">
            <Award className="w-9 h-9 text-olive-100" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-navy-700 tracking-tight uppercase">
            Rajiv Gandhi University of Knowledge Technologies
          </h2>
          <p className="text-xs font-bold text-olive-600 tracking-wider uppercase">
            Official Institutional No-Dues &amp; Digital Clearance Certificate
          </p>
          <p className="text-[11px] text-slate-400 font-mono">
            Certificate Serial: #{certificate.certificateNumber}
          </p>
        </div>

        {/* Certificate Body */}
        <div className="text-center space-y-4 max-w-2xl mx-auto py-2">
          <p className="text-xs text-slate-600">This official document certifies that student candidate</p>
          <h3 className="text-2xl sm:text-3xl font-black text-navy-700 tracking-tight border-b-2 border-olive-500 pb-2 inline-block px-6">
            {certificate.studentName}
          </h3>
          <p className="text-xs text-slate-600">
            Roll Number: <span className="font-bold text-slate-900">{certificate.rollNo || certificate.studentId}</span> • Program: <span className="font-bold text-slate-900">{certificate.program || 'B.Tech'}</span>
          </p>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-3">
            has successfully fulfilled all institutional obligations and completed parallel clearance reconciliation across Central Library, Hostel Administration, Sports &amp; Athletics, and Accounts Divisions with clean records.
          </p>
        </div>

        {/* Audit Details & Security Hash */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-xs text-slate-600 text-center sm:text-left">
            <p className="flex items-center gap-1.5 justify-center sm:justify-start">
              <Calendar className="w-3.5 h-3.5 text-olive-600" />
              <span>Issued Date: <strong>{certificate.issueDate ? format(new Date(certificate.issueDate), 'MMMM dd, yyyy') : 'N/A'}</strong></span>
            </p>
            <p className="flex items-center gap-1.5 justify-center sm:justify-start">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Digital Verification Hash: <strong className="font-mono text-[10px] text-slate-700">{certificate.verificationHash || certificate.certificateNumber}</strong></span>
            </p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
            <div className="w-20 h-20 bg-slate-900 text-white rounded-xl p-2 flex flex-col items-center justify-center font-mono text-[9px] break-all leading-tight">
              <span>AUTHENTIC</span>
              <span className="text-olive-400 font-bold">VERIFIED</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 block uppercase">QR Verification Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
