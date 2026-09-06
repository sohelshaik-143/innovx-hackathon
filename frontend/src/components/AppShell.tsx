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
  LayoutDashboard,
  Clock,
  AlertOctagon,
  Award,
  ChevronRight,
  ChevronLeft,
  GraduationCap
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, logout, unreadCount } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const isRole = (role: string) => user?.roles?.includes(role);

  const getRoleBadge = () => {
    if (!user) return 'Guest';
    if (isRole('ROLE_ADMIN')) return 'University Admin';
    if (isRole('ROLE_DEPARTMENT_HEAD')) return `Head of ${user.departmentName || user.departmentCode || 'Department'}`;
    if (isRole('ROLE_DEPARTMENT_STAFF')) return `${user.departmentName || user.departmentCode || 'Department'} Officer`;
    if (isRole('ROLE_STUDENT')) return 'Student Candidate';
    return 'Authorized User';
  };

  // Student Navigation Items
  const studentNav = [
    { name: 'Clearance Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'My Applications', path: '/student?tab=history', icon: FileCheck2 },
    { name: 'Official Certificate', path: '/student#certificate', icon: Award },
    { name: 'My Profile & Account', path: '/account', icon: UserIcon },
  ];

  // Department Staff Navigation Items
  const departmentNav = [
    { name: 'Operational Queue', path: '/department', icon: LayoutDashboard },
    { name: 'Pending Review', path: '/department?status=PENDING', icon: Clock },
    { name: 'SLA Breaches', path: '/department?status=OVERDUE', icon: AlertOctagon },
    { name: 'Staff Profile', path: '/account', icon: UserIcon },
  ];

  // Department Head Navigation Items
  const headNav = [
    { name: 'Executive Oversight', path: '/head', icon: ShieldCheck },
    { name: 'Escalations Inbox', path: '/head', icon: AlertOctagon },
    { name: 'Executive Profile', path: '/account', icon: UserIcon },
  ];

  // Admin Navigation Items
  const adminNav = [
    { name: 'Governance Overview', path: '/admin', icon: SlidersHorizontal },
    { name: 'Department Workload', path: '/admin#bottlenecks', icon: Building2 },
    { name: 'Audit Trail', path: '/admin#audit', icon: Users },
    { name: 'System Settings', path: '/account', icon: UserIcon },
  ];

  const currentNav = isRole('ROLE_ADMIN')
    ? adminNav
    : isRole('ROLE_DEPARTMENT_HEAD')
    ? headNav
    : isRole('ROLE_DEPARTMENT_STAFF')
    ? departmentNav
    : isRole('ROLE_STUDENT')
    ? studentNav
    : [];

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col font-sans">
      {/* Top Evaluation Banner */}
      <DemoBanner />

      <div className="flex flex-1 overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside 
          aria-label="Sidebar navigation" 
          className={`hidden md:flex md:flex-col bg-navy-700 text-white transition-all duration-300 shrink-0 ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header Brand */}
            <div className="p-4 border-b border-navy-600 flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3 group overflow-hidden">
                <div className="w-10 h-10 rounded-xl bg-olive-500 flex items-center justify-center text-white shadow-xs group-hover:bg-olive-600 transition shrink-0">
                  <GraduationCap className="w-6 h-6 text-olive-100" />
                </div>
                {!isCollapsed && (
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-white tracking-tight leading-tight">CampusClear</span>
                    </div>
                    <p className="text-[10px] text-olive-200 font-medium truncate mt-0.5">
                      RGUKT Clearance Portal
                    </p>
                  </div>
                )}
              </Link>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-600 transition"
                title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            {/* Authenticated User Status Card */}
            {!isCollapsed && user && (
              <div className="p-3 mx-3 mt-3 rounded-xl bg-navy-600/60 border border-navy-500">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-olive-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-[10px] text-olive-200 font-semibold truncate leading-tight mt-0.5">
                      {getRoleBadge()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {!isCollapsed && (
                <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Portal Navigation
                </span>
              )}
              {currentNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path.split('?')[0].split('#')[0];
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    title={isCollapsed ? item.name : undefined}
                    className={`group flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-olive-500 text-white font-bold shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-navy-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>
                    {!isCollapsed && isActive && <ChevronRight className="w-3.5 h-3.5 text-olive-200" />}
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-navy-600 mt-4 space-y-1">
                {!isCollapsed && (
                  <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Tools &amp; Services
                  </span>
                )}
                <Link
                  to="/verify-certificate"
                  title={isCollapsed ? 'Public Verification' : undefined}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-950/40 transition border border-emerald-500/20`}
                >
                  <SearchCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  {!isCollapsed && <span>Public Verification</span>}
                </Link>

                <button
                  onClick={() => setShowNotifications(true)}
                  title={isCollapsed ? 'Notifications' : undefined}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-navy-600 transition`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Bell className="w-4 h-4 text-slate-400" />
                    {!isCollapsed && <span>Notifications</span>}
                  </div>
                  {unreadCount > 0 && !isCollapsed && (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-navy-600 flex items-center justify-between bg-navy-800">
              {!isCollapsed && (
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  <span>RGUKT Clearance System</span>
                </div>
              )}
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition mx-auto md:mx-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR OVERLAY */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div className="fixed inset-0 bg-navy-900/60 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-navy-700 text-white shadow-xl">
              <div className="p-4 border-b border-navy-600 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-olive-500 flex items-center justify-center text-white font-bold text-xs">
                    CC
                  </div>
                  <span className="text-sm font-black text-white">CampusClear RGUKT</span>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
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
                      className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-navy-600"
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                <Link
                  to="/verify-certificate"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/20 mt-3"
                >
                  <SearchCheck className="w-4 h-4 text-emerald-400" />
                  <span>Public QR Verification</span>
                </Link>
              </div>

              <div className="p-4 border-t border-navy-600">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-500/20 hover:bg-rose-900/50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN BODY AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* TOP HEADER */}
          <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs h-14 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-slate-800 hidden sm:inline">
                  Rajiv Gandhi University of Knowledge Technologies
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="font-semibold text-olive-600">
                  CampusClear Portal
                </span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <Link
                to="/verify-certificate"
                className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-olive-600 px-3 py-1.5 rounded-lg bg-ivory-50 hover:bg-ivory-100 border border-slate-200 transition"
              >
                <SearchCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verify Certificate</span>
              </Link>

              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div className="h-5 w-px bg-slate-200" />

              {/* User Chip */}
              <Link
                to="/account"
                className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition group"
                title="Account Settings"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-olive-600 transition leading-none">
                    {user?.fullName}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-none mt-1">{getRoleBadge()}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-olive-100 border border-olive-200 flex items-center justify-center text-olive-700 font-bold text-xs group-hover:scale-105 transition">
                  <UserIcon className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </header>

          {/* MAIN PAGE CONTENT */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-fade-in">
            {children}
          </main>
        </div>
      </div>

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};
