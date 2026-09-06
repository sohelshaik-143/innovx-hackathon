import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ShieldCheck, ArrowRight, KeyRound, SearchCheck, CheckCircle2 } from 'lucide-react';

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
      setError(err.response?.data?.message || 'Invalid username or password.');
    }
  };

  const demoAccounts = [
    { label: 'Student Alex', role: 'Student (Active Clearance)', user: 'student.alex', pass: 'student123', color: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/40' },
    { label: 'Student Sarah', role: 'Student (New / Clean)', user: 'student.sarah', pass: 'student123', color: 'border-blue-200 hover:border-blue-400 bg-blue-50/40' },
    { label: 'Library Staff', role: 'Department Verifier', user: 'staff.library', pass: 'staff123', color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/40' },
    { label: 'Hostel Staff', role: 'Department Verifier', user: 'staff.hostel', pass: 'staff123', color: 'border-amber-200 hover:border-amber-400 bg-amber-50/40' },
    { label: 'Sports Staff', role: 'Department Verifier', user: 'staff.sports', pass: 'staff123', color: 'border-purple-200 hover:border-purple-400 bg-purple-50/40' },
    { label: 'Accounts Staff', role: 'Department Verifier', user: 'staff.accounts', pass: 'staff123', color: 'border-cyan-200 hover:border-cyan-400 bg-cyan-50/40' },
    { label: 'Dept Head (Library)', role: 'Escalations & Workload', user: 'head.library', pass: 'head123', color: 'border-slate-300 hover:border-slate-500 bg-slate-100/50' },
    { label: 'College Admin', role: 'SLA & Governance', user: 'admin', pass: 'admin123', color: 'border-rose-200 hover:border-rose-400 bg-rose-50/40' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
          CampusClear Governance Portal
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Apex Institute of Technology • Automated No-Dues & Digital Clearance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Username or Official Email
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., student.alex or admin"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3.5 py-2.5 shadow-2xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs rounded-lg border border-slate-300 px-3.5 py-2.5 shadow-2xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Sign In to Portal'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick Demo Login Picker */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <KeyRound className="w-3.5 h-3.5 text-brand-600" />
                <span>Single-Click Demo Accounts</span>
              </div>
              <span className="text-[10px] text-amber-700 bg-amber-100 font-semibold px-2 py-0.5 rounded-full">
                Evaluation Presets
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Select any institutional role to automatically authenticate and evaluate the system:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((item) => (
                <button
                  key={item.user}
                  type="button"
                  onClick={() => switchDemoUser(item.user, item.pass)}
                  className={`p-2.5 text-left rounded-lg border text-xs transition ${item.color}`}
                >
                  <div className="font-bold text-slate-900 leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{item.role}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Public Verification Link */}
          <div className="mt-6 text-center">
            <Link
              to="/verify-certificate"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition"
            >
              <SearchCheck className="w-4 h-4 text-emerald-600" />
              Public Certificate Verification Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
