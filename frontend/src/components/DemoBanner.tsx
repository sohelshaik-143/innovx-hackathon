import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, UserCheck } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { user, switchDemoUser } = useAuth();

  const demoAccounts = [
    { label: 'Student Alex', role: 'STUDENT', user: 'student.alex', pass: 'student123' },
    { label: 'Student Sarah', role: 'STUDENT', user: 'student.sarah', pass: 'student123' },
    { label: 'Library Staff', role: 'STAFF', user: 'staff.library', pass: 'staff123' },
    { label: 'Hostel Staff', role: 'STAFF', user: 'staff.hostel', pass: 'staff123' },
    { label: 'Sports Staff', role: 'STAFF', user: 'staff.sports', pass: 'staff123' },
    { label: 'Accounts Staff', role: 'STAFF', user: 'staff.accounts', pass: 'staff123' },
    { label: 'Dept Head (Library)', role: 'HEAD', user: 'head.library', pass: 'head123' },
    { label: 'College Admin', role: 'ADMIN', user: 'admin', pass: 'admin123' },
  ];

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 text-xs px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong className="font-semibold text-amber-950">Demo Environment:</strong> Institutional governance simulation with isolated mock records.
          </span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5">
          <span className="text-amber-800/80 font-medium whitespace-nowrap mr-1">Switch Role:</span>
          {demoAccounts.map((account) => {
            const isCurrent = user?.username === account.user;
            return (
              <button
                key={account.user}
                onClick={() => switchDemoUser(account.user, account.pass)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition whitespace-nowrap flex items-center gap-1 ${
                  isCurrent
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-amber-300/40 hover:border-amber-400'
                }`}
                title={`Switch to ${account.label} (${account.user})`}
              >
                {isCurrent && <UserCheck className="w-3 h-3" />}
                {account.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
