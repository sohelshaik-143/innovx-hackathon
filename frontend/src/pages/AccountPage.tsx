import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { User } from '../types';
import {
  Building2,
  ShieldCheck,
  User as UserIcon,
  Mail,
  GraduationCap,
  KeyRound,
  LogOut,
  Clock,
  CheckCircle2,
  Award,
  ArrowLeft,
  FileCheck2,
  Lock,
  ExternalLink,
  BadgeCheck
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(authUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get<User>('/auth/me');
        if (res.data) {
          setProfile((prev) => ({ ...prev, ...res.data }));
        }
      } catch {
        // Keep authenticated context profile on fetch error
      } finally {
        setLoading(false);
      }
    };
    fetchLatestProfile();
  }, []);

  const user = profile || authUser;

  const getRoleLabel = () => {
    if (!user) return 'Authorized Member';
    if (user.roles.includes('ROLE_ADMIN')) return 'University System Administrator';
    if (user.roles.includes('ROLE_DEPARTMENT_HEAD')) return `Department Head (${user.departmentName || 'Division'})`;
    if (user.roles.includes('ROLE_DEPARTMENT_STAFF')) return `Verification Officer (${user.departmentName || 'Division'})`;
    if (user.roles.includes('ROLE_STUDENT')) return 'Student Clearance Candidate';
    return 'Authorized User';
  };

  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.roles.includes('ROLE_ADMIN')) return '/admin';
    if (user.roles.includes('ROLE_DEPARTMENT_HEAD')) return '/head';
    if (user.roles.includes('ROLE_DEPARTMENT_STAFF')) return '/department';
    return '/student';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action */}
      <div className="flex items-center justify-between">
        <Link
          to={getDashboardUrl()}
          className="text-xs font-semibold text-slate-600 hover:text-rgukt-primary flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Operational Dashboard
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* Header Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-50/70 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rgukt-primary to-rgukt-navy text-white flex items-center justify-center font-black text-xl shadow-md border border-amber-300/40 shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {user?.fullName || 'User Profile'}
                </h1>
                {user?.demo && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Institutional Demo Persona
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-rgukt-primary">
                {getRoleLabel()}
              </p>
              <p className="text-[11px] text-slate-500">
                Rajiv Gandhi University of Knowledge Technologies • Andhra Pradesh
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={getDashboardUrl()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rgukt-primary hover:bg-rgukt-navy shadow-xs transition"
            >
              Open Dashboard
            </Link>
            <Link
              to="/verify-certificate"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-2xs"
            >
              Public Verification
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Details & Governance Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Institutional Credentials */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-rgukt-primary" />
                <h2 className="text-sm font-bold text-slate-900">Institutional Identity &amp; Particulars</h2>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <BadgeCheck className="w-3.5 h-3.5" />
                Active Record
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Official University Email
                </span>
                <span className="text-slate-900 font-semibold block mt-0.5">
                  {user?.email || 'N/A'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  System Username
                </span>
                <span className="text-slate-900 font-mono font-bold block mt-0.5">
                  {user?.username || 'N/A'}
                </span>
              </div>

              {user?.studentId && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Student ID Number
                  </span>
                  <span className="text-slate-900 font-mono font-bold block mt-0.5">
                    {user.studentId}
                  </span>
                </div>
              )}

              {user?.rollNo && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    University Roll Number
                  </span>
                  <span className="text-slate-900 font-mono font-bold block mt-0.5">
                    {user.rollNo}
                  </span>
                </div>
              )}

              {user?.program && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Academic Program &amp; Department
                  </span>
                  <span className="text-slate-900 font-semibold block mt-0.5">
                    {user.program}
                  </span>
                </div>
              )}

              {user?.departmentName && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Assigned Operational Division
                  </span>
                  <span className="text-slate-900 font-bold block mt-0.5">
                    {user.departmentName} ({user.departmentCode})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Institutional Governance Standards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">CampusClear Operational Mandate</h2>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Zero Paper Policy:</strong> Physical clearance slips and sign-off forms are officially phased out across all campus departments. All clearance applications are orchestrated digitally.
              </p>
              <p>
                <strong>48-Hour SLA Guarantee:</strong> Department verifiers are obligated to audit records and clear tasks within 48 hours of student submission. Overdue requests are escalated to executive oversight.
              </p>
              <p>
                <strong>Cryptographic Verification:</strong> Completed certificates carry a SHA-256 integrity signature and a verifiable ZXing QR code accessible through the public verification registry.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Access Control & Security */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Lock className="w-4 h-4 text-slate-500" />
              <h2 className="text-sm font-bold text-slate-900">Access Control &amp; Security</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Authentication Type</span>
                <span className="font-semibold text-slate-800">Stateful JWT Bearer Token</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Granted Security Roles</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {user?.roles.map((role) => (
                    <span
                      key={role}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[10px] font-bold border border-slate-200"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Account Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Active &amp; Authenticated
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block text-[11px]">Password Management</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Institutional accounts are managed through RGUKT directory services. Contact administrative support for credentials reset.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Help Card */}
          <div className="p-5 bg-brand-50/70 rounded-2xl border border-brand-200 space-y-2 text-xs">
            <h3 className="font-bold text-brand-900">Need Assistance?</h3>
            <p className="text-brand-700 leading-relaxed text-[11px]">
              For discrepancies with department clearances or institutional records, submit a clarification directly to the respective department office or university administration.
            </p>
            <div className="pt-1">
              <a
                href="mailto:governance@campus.edu"
                className="font-bold text-rgukt-primary hover:underline text-[11px] inline-flex items-center gap-1"
              >
                governance@campus.edu
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
