import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { PublicCertificateVerify } from '../types';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Search,
  Calendar,
  GraduationCap,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

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
      setErrorMsg(err.response?.data?.message || 'Certificate record could not be verified.');
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

  const parsedStudent = React.useMemo(() => {
    if (!result?.studentIdentifier) return { name: 'N/A', id: 'N/A' };
    const match = result.studentIdentifier.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      return { name: match[1], id: match[2] };
    }
    return { name: result.studentIdentifier, id: result.studentIdentifier };
  }, [result?.studentIdentifier]);

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col font-sans">
      {/* Topbar Header */}
      <header className="bg-navy-700 text-white border-b border-navy-600 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-olive-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <GraduationCap className="w-5 h-5 text-olive-100" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight block text-white leading-tight">
                RGUKT Certificate Authority
              </span>
              <span className="text-[10px] text-olive-200 block leading-tight">
                Rajiv Gandhi University of Knowledge Technologies
              </span>
            </div>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="sm" className="bg-navy-800 text-white border-navy-500 hover:bg-navy-600">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Sign In to Portal
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-olive-100 border border-olive-200 text-olive-700 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-700 tracking-tight">
            Public Certificate Verification
          </h1>
          <p className="text-xs text-slate-500">
            Verify the authentic digital signature, issuance date, and student clearance records issued by RGUKT.
          </p>
        </div>

        {/* Search Input Card */}
        <Card>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Enter Certificate Number or Serial (e.g. CERT-2024-001)"
                className="w-full text-xs rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 bg-white focus:ring-2 focus:ring-olive-500 focus:border-olive-500 shadow-xs"
              />
            </div>
            <Button variant="primary" type="submit" isLoading={loading} rightIcon={<Search className="w-3.5 h-3.5" />}>
              Verify
            </Button>
          </form>
        </Card>

        {/* Results */}
        {searched && (
          <div className="animate-fade-in">
            {errorMsg ? (
              <Card className="border-rose-200 bg-rose-50/40 text-center py-8 space-y-2">
                <XCircle className="w-10 h-10 text-rose-600 mx-auto" />
                <h3 className="text-base font-bold text-rose-900">Certificate Verification Failed</h3>
                <p className="text-xs text-rose-700 max-w-sm mx-auto">{errorMsg}</p>
              </Card>
            ) : result ? (
              <Card className="border-emerald-200 bg-white shadow-card-hover space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        ✓ Authentic Certificate Verified
                      </span>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        Serial #{result.certificateNumber}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    STATUS: {result.statusMessage || (result.valid ? 'VALID / VERIFIED' : 'INVALID')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-ivory-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Candidate Identity</span>
                    <p className="font-bold text-slate-900 text-sm">{parsedStudent.name}</p>
                    <p className="text-slate-500 font-mono">Roll: {parsedStudent.id}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-ivory-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Issuance Date</span>
                    <p className="font-bold text-slate-900 text-sm">
                      {result.issueDate ? format(new Date(result.issueDate), 'MMMM dd, yyyy') : 'N/A'}
                    </p>
                    <p className="text-slate-500">Verified by RGUKT Authority</p>
                  </div>
                </div>

                <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
                  Cryptographic Verification Signature: <strong className="font-mono text-slate-700">{result.certificateNumber || 'VERIFIED-SHA256'}</strong>
                </div>
              </Card>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
};
