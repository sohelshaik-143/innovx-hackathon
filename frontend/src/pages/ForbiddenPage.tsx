import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { getDashboardRoute } from '../utils/roleUtils';

export const ForbiddenPage: React.FC = () => {
  const { user } = useAuth();

  const getHomeRoute = () => {
    return getDashboardRoute(user);
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center space-y-6 py-8 px-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase text-rose-600 tracking-wider">
            HTTP 403 • Access Denied
          </span>
          <h1 className="text-xl font-black text-navy-800 tracking-tight">
            Unauthorized Department Route
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your authenticated identity ({user?.fullName || 'User'}) lacks the required role or department privileges to view this section.
          </p>
        </div>

        {user && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1 font-medium text-slate-700">
            <p><span className="text-slate-400">Assigned Role:</span> <strong className="text-slate-900">{user.roles?.join(', ')}</strong></p>
            {user.departmentName && (
              <p><span className="text-slate-400">Assigned Dept:</span> <strong className="text-slate-900">{user.departmentName} ({user.departmentCode})</strong></p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to={getHomeRoute()}>
            <Button variant="primary" size="sm" leftIcon={<Home className="w-4 h-4" />}>
              Return to My Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForbiddenPage;
