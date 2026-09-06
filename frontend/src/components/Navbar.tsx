import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationDrawer } from './NotificationDrawer';
import {
  Building2,
  Bell,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  SearchCheck,
  FileCheck2,
  Users,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout, unreadCount } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  const isRole = (role: string) => user?.roles.includes(role);

  const navLinks = [
    ...(isRole('ROLE_STUDENT')
      ? [
        { name: 'My Clearance', path: '/student', icon: FileCheck2 },
      ]
      : []),
    ...(isRole('ROLE_DEPARTMENT_STAFF')
      ? [
        { name: 'Department Tasks', path: '/department', icon: Building2 },
      ]
      : []),
    ...(isRole('ROLE_DEPARTMENT_HEAD')
      ? [
        { name: 'Head Overview', path: '/head', icon: ShieldCheck },
      ]
      : []),
    ...(isRole('ROLE_ADMIN')
      ? [
        { name: 'Governance Dashboard', path: '/admin', icon: SlidersHorizontal },
        { name: 'Audit Logs', path: '/admin/audit', icon: Users },
      ]
      : []),
  ];

  const getRoleLabel = () => {
    if (!user) return 'Guest';
    if (isRole('ROLE_ADMIN')) return 'College Administrator';
    if (isRole('ROLE_DEPARTMENT_HEAD')) return `Head of ${user.departmentName || 'Department'}`;
    if (isRole('ROLE_DEPARTMENT_STAFF')) return `${user.departmentName || 'Department'} Staff`;
    if (isRole('ROLE_STUDENT')) return 'Student';
    return 'Authorized User';
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left Brand Identity */}
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-xs group-hover:bg-brand-700 transition">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 tracking-tight">CampusClear</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                      MVP
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">Apex Institute of Technology</p>
                </div>
              </Link>

              {/* Nav Links */}
              <nav className="hidden md:flex space-x-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${isActive
                          ? 'bg-brand-50 text-brand-700 border border-brand-200/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Tools & Profile */}
            <div className="flex items-center space-x-3">
              {/* Public verification quick link */}
              <Link
                to="/verify-certificate"
                className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-brand-600 px-2.5 py-1 rounded-md hover:bg-slate-100 transition"
              >
                <SearchCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verify Certificate
              </Link>

              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div className="h-6 w-px bg-slate-200" />

              {/* User Profile Card */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">{user.fullName}</p>
                    <p className="text-[11px] text-slate-500 leading-tight">{getRoleLabel()}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700 font-semibold text-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <button
                    onClick={logout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs transition"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};
