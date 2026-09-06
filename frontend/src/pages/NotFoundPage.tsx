import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, GraduationCap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.roles?.includes('ROLE_ADMIN')) return '/admin';
    if (user.roles?.includes('ROLE_DEPARTMENT_HEAD')) return '/head';
    if (user.roles?.includes('ROLE_DEPARTMENT_STAFF')) return '/department';
    return '/student';
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-card space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-olive-100 border border-olive-200 text-olive-700 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-black text-navy-700 tracking-tight block">404</span>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Looks like this page hasn't been cleared yet.
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            The institutional resource or page URL you requested could not be located on CampusClear.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Go Back
          </Button>
          <Link to={getDashboardUrl()}>
            <Button variant="primary" size="sm" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
