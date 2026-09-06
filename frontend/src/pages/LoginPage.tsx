import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  SearchCheck, 
  Lock, 
  User, 
  GraduationCap, 
  FileCheck2, 
  Award,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const { login, switchDemoUser, isLoading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const auth = await login(username, password);
      if (auth.roles.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else if (auth.roles.includes('ROLE_DEPARTMENT_HEAD')) {
        navigate('/head');
      } else if (auth.roles.includes('ROLE_DEPARTMENT_STAFF')) {
        navigate('/department');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        return;
      }
      if (err.response?.data?.error) {
        setError(err.response.data.error);
        return;
      }
      if (!err.response) {
        setError('Network connection issue. Please verify backend connectivity.');
        return;
      }
      setError(err.message || 'Invalid username or password.');
    }
  };

  const demoAccounts = [
    { label: 'Student Alex', role: 'Candidate (Active Request)', user: 'student.alex', pass: 'student123', color: 'border-olive-200 bg-olive-50/70 hover:border-olive-400' },
    { label: 'Student Sarah', role: 'Candidate (New / Clean)', user: 'student.sarah', pass: 'student123', color: 'border-sky-200 bg-sky-50/70 hover:border-sky-400' },
    { label: 'Library Staff', role: 'Verifier (LIB)', user: 'staff.library', pass: 'staff123', color: 'border-emerald-200 bg-emerald-50/70 hover:border-emerald-400' },
    { label: 'Hostel Staff', role: 'Verifier (HST)', user: 'staff.hostel', pass: 'staff123', color: 'border-amber-200 bg-amber-50/70 hover:border-amber-400' },
    { label: 'Sports Staff', role: 'Verifier (SPT)', user: 'staff.sports', pass: 'staff123', color: 'border-teal-200 bg-teal-50/70 hover:border-teal-400' },
    { label: 'Accounts Staff', role: 'Verifier (ACC)', user: 'staff.accounts', pass: 'staff123', color: 'border-purple-200 bg-purple-50/70 hover:border-purple-400' },
    { label: 'Dept Head (LIB)', role: 'Executive Oversight', user: 'head.library', pass: 'head123', color: 'border-indigo-200 bg-indigo-50/70 hover:border-indigo-400' },
    { label: 'Univ Administrator', role: 'Governance & SLA', user: 'admin', pass: 'admin123', color: 'border-rose-200 bg-rose-50/70 hover:border-rose-400' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-ivory-100 font-sans">
      {/* LEFT COLUMN: RGUKT Campus Visual & Institutional Identity */}
      <div className="lg:w-1/2 bg-navy-700 text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-olive-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-navy-500/30 blur-3xl pointer-events-none" />

        {/* University Brand Header */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-olive-500/30 backdrop-blur-md border border-olive-400/40 flex items-center justify-center shadow-md">
              <GraduationCap className="w-7 h-7 text-olive-100" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                Rajiv Gandhi University of Knowledge Technologies
              </h1>
              <p className="text-xs text-olive-200 font-medium">
                AP State University • Digital Institutional Governance
              </p>
            </div>
          </div>
        </div>

        {/* Process & Value Proposition */}
        <div className="relative z-10 py-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-600/80 border border-navy-500 text-xs font-semibold text-olive-200">
            <Sparkles className="w-3.5 h-3.5 text-olive-300" />
            <span>CampusClear Digital Governance Platform</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Your Clearance. Digitized.
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
            Automated No-Dues &amp; Digital Clearance for students and university departments. One single request initiates parallel department review under a transparent 48-hour SLA.
          </p>

          {/* Workflow Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-navy-800/70 border border-navy-600 space-y-1">
              <FileCheck2 className="w-4 h-4 text-olive-300" />
              <p className="text-xs font-bold text-white">1. Single Request</p>
              <p className="text-[11px] text-slate-300">Submit digital clearance once</p>
            </div>
            <div className="p-3.5 rounded-xl bg-navy-800/70 border border-navy-600 space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <p className="text-xs font-bold text-white">2. 48h Audit SLA</p>
              <p className="text-[11px] text-slate-300">Parallel department review</p>
            </div>
            <div className="p-3.5 rounded-xl bg-navy-800/70 border border-navy-600 space-y-1">
              <Award className="w-4 h-4 text-amber-300" />
              <p className="text-xs font-bold text-white">3. Digital Certificate</p>
              <p className="text-[11px] text-slate-300">Scannable QR verification</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-slate-400 pt-4 border-t border-navy-600 flex items-center justify-between">
          <span>Digital Clearance Portal v1.0</span>
          <span>Verified RGUKT System</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Sign In Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-olive-600 px-2 py-0.5 rounded bg-olive-100 border border-olive-200">
              Institutional Access
            </span>
            <h2 className="text-2xl font-black text-navy-700 tracking-tight">
              Sign In to Portal
            </h2>
            <p className="text-xs text-slate-500">
              Enter your official RGUKT institutional credentials to continue.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-700">
                Institutional Username or Email
              </label>
              <div className="mt-1 relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. student.alex or admin"
                  className="w-full text-xs rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 shadow-xs focus:ring-2 focus:ring-olive-500 focus:border-olive-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                  Security Password
                </label>
              </div>
              <div className="mt-1 relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 shadow-xs focus:ring-2 focus:ring-olive-500 focus:border-olive-500 transition"
                />
              </div>
            </div>

            <Button
              id="login-btn"
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full py-2.5 text-xs"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Portal
            </Button>

            <div className="pt-1 text-center">
              <Link
                to="/register"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-xl border border-olive-200 text-xs font-bold text-olive-700 bg-olive-50 hover:bg-olive-100 transition"
              >
                New candidate? Create an Institutional Account →
              </Link>
            </div>
          </form>

          {/* Quick Evaluation Role Switcher */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-navy-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-olive-600" />
                <span>Evaluation 1-Click Role Switcher</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">Test Personas:</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.user}
                  type="button"
                  onClick={() => {
                    setUsername(acc.user);
                    setPassword(acc.pass);
                    switchDemoUser(acc.user, acc.pass);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition text-xs ${acc.color}`}
                >
                  <p className="font-bold text-slate-900 leading-tight">{acc.label}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{acc.role}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Public Verification Link */}
          <div className="pt-2 text-center">
            <Link
              to="/verify-certificate"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
            >
              <SearchCheck className="w-4 h-4 text-emerald-600" />
              <span>Verify Official Digital No-Dues Certificate Online</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
