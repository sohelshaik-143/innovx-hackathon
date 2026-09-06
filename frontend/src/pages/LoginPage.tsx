import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  SearchCheck, 
  CheckCircle2, 
  Lock, 
  User, 
  GraduationCap, 
  FileCheck2, 
  Award,
  Sparkles
} from 'lucide-react';

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
      
      // Check for server error message
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        return;
      }
      
      // Check for error field
      if (err.response?.data?.error) {
        setError(err.response.data.error);
        return;
      }
      
      // Handle network errors
      if (!err.response) {
        setError('Network error. Please check your connection and try again.');
        return;
      }
      
      // Default error
      setError(err.message || 'Invalid username or password.');
    }
  };

  const demoAccounts = [
    { label: 'Student Alex', role: 'Candidate (Active Clearance)', user: 'student.alex', pass: 'student123', color: 'border-blue-200 hover:border-blue-400 bg-blue-50/60' },
    { label: 'Student Sarah', role: 'Candidate (Clean / New)', user: 'student.sarah', pass: 'student123', color: 'border-sky-200 hover:border-sky-400 bg-sky-50/60' },
    { label: 'Library Staff', role: 'Department Verifier (LIB)', user: 'staff.library', pass: 'staff123', color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/60' },
    { label: 'Hostel Staff', role: 'Department Verifier (HST)', user: 'staff.hostel', pass: 'staff123', color: 'border-amber-200 hover:border-amber-400 bg-amber-50/60' },
    { label: 'Sports Staff', role: 'Department Verifier (SPT)', user: 'staff.sports', pass: 'staff123', color: 'border-teal-200 hover:border-teal-400 bg-teal-50/60' },
    { label: 'Accounts Staff', role: 'Department Verifier (ACC)', user: 'staff.accounts', pass: 'staff123', color: 'border-purple-200 hover:border-purple-400 bg-purple-50/60' },
    { label: 'Dept Head (LIB)', role: 'Executive Oversight', user: 'head.library', pass: 'head123', color: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/60' },
    { label: 'University Admin', role: 'Governance & SLA', user: 'admin', pass: 'admin123', color: 'border-rose-200 hover:border-rose-400 bg-rose-50/60' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 font-sans">
      {/* LEFT COLUMN: RGUKT Campus Visual & Institutional Identity */}
      <div className="lg:w-1/2 bg-rgukt-navy text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Background decorative university elements */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-rgukt-primary/40 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Top University Brand */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-amber-300/40 flex items-center justify-center shadow-md">
              <svg className="w-7 h-7 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 13l-8-3.64V17c0 3.31 3.58 6 8 6s8-2.69 8-6v-5.64L12 15z" />
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                Rajiv Gandhi University of Knowledge Technologies
              </h1>
              <p className="text-xs text-amber-300/90 font-medium">
                AP State University • Automated Institutional Governance
              </p>
            </div>
          </div>
        </div>

        {/* Middle Value Proposition & Workflow Story */}
        <div className="relative z-10 py-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CampusClear Single-Source-of-Truth Clearance</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Eliminating physical paper forms through transparent digital clearance governance.
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
            A unified institutional platform connecting students, departmental verifiers, and executive leadership. Students submit one digital clearance request, departments audit verified records under a strict 48-hour SLA, and authentic certificates are issued with cryptographic QR verification.
          </p>

          {/* Workflow Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
              <FileCheck2 className="w-4 h-4 text-amber-300" />
              <p className="text-xs font-bold text-white">Single Request</p>
              <p className="text-[11px] text-slate-300">Parallel department verification</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <p className="text-xs font-bold text-white">48h SLA</p>
              <p className="text-[11px] text-slate-300">Real-time escalation &amp; tracking</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
              <Award className="w-4 h-4 text-amber-300" />
              <p className="text-xs font-bold text-white">Digital Certificate</p>
              <p className="text-[11px] text-slate-300">Real ZXing scannable QR</p>
            </div>
          </div>
        </div>

        {/* Bottom Institutional Seal Note */}
        <div className="relative z-10 text-[11px] text-slate-400 pt-4 border-t border-white/10 flex items-center justify-between">
          <span>Digital Campus Governance System</span>
          <span>RGUKT-AP Verified Portal</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Institutional Login Form & Evaluation Persona Access */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-rgukt-primary px-2 py-0.5 rounded bg-rgukt-light border border-brand-200">
                Institutional Access
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Sign In to CampusClear
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
                Institutional ID or Email
              </label>
              <div className="mt-1 relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. student.alex or admin"
                  className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 shadow-2xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 font-medium cursor-not-allowed">
                  Forgot password?
                </span>
              </div>
              <div className="mt-1 relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 shadow-2xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl shadow-xs text-xs font-bold text-white bg-rgukt-primary hover:bg-rgukt-navy transition disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>

            <div className="pt-1 text-center">
              <Link
                to="/register"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 rounded-xl border border-brand-200 text-xs font-bold text-rgukt-primary bg-brand-50/60 hover:bg-brand-50 transition"
              >
                New user? Create an Institutional Account →
              </Link>
            </div>
          </form>

          {/* Quick Evaluation Role Switcher */}
          {true && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-rgukt-primary" />
                  <span>Evaluation Quick Login Switcher</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">1-Click Test Access:</span>
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
          )}


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
