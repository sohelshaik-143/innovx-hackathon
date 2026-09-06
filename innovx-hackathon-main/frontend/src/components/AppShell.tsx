import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NotificationDrawer } from './NotificationDrawer';
import { DemoBanner } from './DemoBanner';
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
  Menu,
  X,
  PlusCircle,
  LayoutDashboard,
  Clock,
  AlertOctagon,
  Award,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, logout, unreadCount } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isRole = (role: string) => user?.roles.includes(role);

  const getRoleBadge = () => {
    if (!user) return 'Guest';
    if (isRole('ROLE_ADMIN')) return 'University Administrator';
    if (isRole('ROLE_DEPARTMENT_HEAD')) return `Head of ${user.departmentName || 'Department'}`;
    if (isRole('ROLE_DEPARTMENT_STAFF')) return `${user.departmentName || 'Department'} Officer`;
    if (isRole('ROLE_STUDENT')) return 'Student Candidate';
    return 'Authorized Member';
  };

  // Student Navigation Items
  const studentNav = [
    { name: 'Clearance Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'My Applications', path: '/student?tab=history', icon: FileCheck2 },
    { name: 'Official Certificate', path: user?.studentId ? `/student#certificate` : '/student', icon: Award },
    { name: 'My Profile & Account', path: '/account', icon: UserIcon },
  ];

  // Department Staff Navigation Items
  const departmentNav = [
    { name: 'Operational Queue', path: '/department', icon: LayoutDashboard },
    { name: 'Pending Review', path: '/department?status=PENDING', icon: Clock },
    { name: 'Overdue SLA Breaches', path: '/department?status=OVERDUE', icon: AlertOctagon },
    { name: 'Staff Profile & Settings', path: '/account', icon: UserIcon },
  ];

  // Department Head Navigation Items
  const headNav = [
    { name: 'Executive Oversight', path: '/head', icon: ShieldCheck },
    { name: 'Escalations Inbox', path: '/head', icon: AlertOctagon },
    { name: 'Executive Account', path: '/account', icon: UserIcon },
  ];

  // Admin Navigation Items
  const adminNav = [
    { name: 'Governance Center', path: '/admin', icon: SlidersHorizontal },
    { name: 'Department Backlog', path: '/admin#bottlenecks', icon: Building2 },
    { name: 'Immutable Audit Trail', path: '/admin#audit', icon: Users },
    { name: 'Admin Account & Policy', path: '/account', icon: UserIcon },
  ];

  const currentNav = isRole('ROLE_ADMIN')
    ? adminNav
    : isRole('ROLE_DEPARTMENT_HEAD')
    ? headNav
    : isRole('ROLE_DEPARTMENT_STAFF')
    ? departmentNav
    : studentNav;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Demo/Evaluation Switcher */}
      <DemoBanner />

      <div className="flex flex-1 overflow-hidden">
        {/* DESKTOP LEFT SIDEBAR */}
        <aside aria-label="Sidebar navigation" className="hidden md:flex md:w-64 md:flex-col bg-white border-r border-slate-200 shrink-0">
          <div className="flex flex-col flex-1 min-h-0">
            {/* RGUKT University Identity Header */}
            <div className="p-4 border-b border-slate-100">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-rgukt-primary flex items-center justify-center text-white shadow-xs group-hover:bg-rgukt-navy transition border border-amber-300/40 relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-rgukt-primary to-rgukt-navy opacity-90" />
                  <svg className="w-6 h-6 text-amber-300 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 13l-8-3.64V17c0 3.31 3.58 6 8 6s8-2.69 8-6v-5.64L12 15z" />
                  </svg>
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-slate-900 tracking-tight leading-tight">CampusClear</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-1 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 rounded">
                      RGUKT
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    Rajiv Gandhi Univ. of Tech
                  </p>
                </div>
              </Link>
            </div>

            {/* Authenticated User Status Card in Sidebar */}
            <div className="p-3 mx-3 mt-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-rgukt-primary text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-[10px] text-rgukt-primary font-semibold truncate leading-tight mt-0.5">
                    {getRoleBadge()}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Portal Menu
              </span>
              {currentNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path.split('?')[0].split('#')[0];
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-rgukt-light text-rgukt-primary font-bold shadow-2xs border border-brand-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-rgukt-primary' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-rgukt-primary" />}
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-slate-100 mt-4 space-y-1">
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Verification &amp; Tools
                </span>
                <Link
                  to="/verify-certificate"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition border border-transparent hover:border-emerald-200"
                >
                  <SearchCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Public QR Verification</span>
                </Link>

                <button
                  onClick={() => setShowNotifications(true)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <span>Audit Notifications</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="text-[10px] text-slate-400 font-medium">
                <span>RGUKT Clearance v1.0</span>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR DRAWER OVERLAY */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-rgukt-primary flex items-center justify-center text-white font-bold text-xs">
                    RC
                  </div>
                  <span className="text-sm font-black text-slate-900">RGUKT CampusClear</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {currentNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                <Link
                  to="/verify-certificate"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 mt-2"
                >
                  <SearchCheck className="w-4 h-4 text-emerald-600" />
                  <span>Public QR Verification</span>
                </Link>
              </div>

              <div className="p-4 border-t border-slate-200">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN LAYOUT WRAPPER (TOPBAR + CONTENT) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* TOPBAR */}
          <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs h-14 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center space-x-3">
              {/* Mobile menu trigger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                  Rajiv Gandhi University of Knowledge Technologies
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-xs font-medium text-slate-500">
                  Digital Clearance Portal
                </span>
              </div>
            </div>

            {/* Topbar Right Tools */}
            <div className="flex items-center space-x-2.5">
              <Link
                to="/verify-certificate"
                className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-rgukt-primary px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
              >
                <SearchCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify Certificate</span>
              </Link>

              {/* Notification Button */}
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div className="h-5 w-px bg-slate-200" />

              {/* User Avatar Chip */}
              <Link
                to="/account"
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition group"
                title="View My Profile & Account Settings"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-rgukt-primary transition leading-none">
                    {user?.fullName}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1">{getRoleBadge()}</p>
                </div>
                <div className="w-7 h-7 rounded-full bg-rgukt-light border border-brand-200 flex items-center justify-center text-rgukt-primary font-bold text-xs group-hover:scale-105 transition">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          </header>

          {/* MAIN PAGE BODY */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>

      {/* Notification Slide Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};
