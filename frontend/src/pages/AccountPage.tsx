import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { User } from '../types';
import {
  ShieldCheck,
  User as UserIcon,
  Mail,
  GraduationCap,
  LogOut,
  ArrowLeft,
  BadgeCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const AccountPage: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(authUser);

  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await api.get<User>('/auth/me');
        if (res.data) {
          setProfile((prev) => ({ ...prev, ...res.data }));
        }
      } catch {
        // Keep authenticated context profile on fetch error
      }
    };
    fetchLatestProfile();
  }, []);

  const user = profile || authUser;

  const getRoleLabel = () => {
    if (!user) return 'Authorized Member';
    if (user.roles?.includes('ROLE_ADMIN')) return 'University System Administrator';
    if (user.roles?.includes('ROLE_DEPARTMENT_HEAD')) return `Department Head (${user.departmentName || 'Division'})`;
    if (user.roles?.includes('ROLE_DEPARTMENT_STAFF')) return `Verification Officer (${user.departmentName || 'Division'})`;
    if (user.roles?.includes('ROLE_STUDENT')) return 'Student Clearance Candidate';
    return 'Authorized User';
  };

  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.roles?.includes('ROLE_ADMIN')) return '/admin';
    if (user.roles?.includes('ROLE_DEPARTMENT_HEAD')) return '/head';
    if (user.roles?.includes('ROLE_DEPARTMENT_STAFF')) return '/department';
    return '/student';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to={getDashboardUrl()}
          className="text-xs font-bold text-slate-600 hover:text-olive-600 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Operational Dashboard</span>
        </Link>
        <Button variant="danger" size="sm" onClick={logout} leftIcon={<LogOut className="w-3.5 h-3.5" />}>
          Sign Out
        </Button>
      </div>

      {/* Header Profile Banner */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-olive-500 text-white flex items-center justify-center font-black text-xl shadow-md border border-olive-400 shrink-0">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-navy-700 tracking-tight">
                  {user?.fullName || 'User Profile'}
                </h1>
                <BadgeCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-olive-600">{getRoleLabel()}</p>
              <p className="text-xs text-slate-500">
                Institutional ID: <span className="font-mono font-bold text-slate-800">{user?.username || user?.studentId || 'N/A'}</span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          header={
            <h3 className="text-sm font-bold text-navy-700 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-olive-600" />
              <span>Institutional Identity Particulars</span>
            </h3>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Full Legal Name:</span>
              <span className="font-bold text-slate-900">{user?.fullName || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Institutional Email:</span>
              <span className="font-bold text-slate-900">{user?.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Portal Username:</span>
              <span className="font-mono font-bold text-slate-900">{user?.username || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Account Status:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ✓ Active Institutional Profile
              </span>
            </div>
          </div>
        </Card>

        <Card
          header={
            <h3 className="text-sm font-bold text-navy-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-olive-600" />
              <span>Role Permissions &amp; Assignment</span>
            </h3>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Role Category:</span>
              <span className="font-bold text-navy-700">{getRoleLabel()}</span>
            </div>
            {user?.departmentName && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Assigned Department:</span>
                <span className="font-bold text-slate-900">{user.departmentName}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-slate-500 font-medium">Security Scope:</span>
              <span className="font-mono text-[11px] text-slate-600">
                {user?.roles?.join(', ') || 'ROLE_STUDENT'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
