import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from './ui/Skeleton';

export const AuthenticationGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-navy-700 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md border border-navy-600">
            CC
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-navy-800 tracking-tight">Authenticating Identity</h3>
            <p className="text-xs text-slate-500 font-medium">Communicating with backend identity authority...</p>
          </div>
          <div className="w-48 mx-auto space-y-2">
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-2 w-3/4 mx-auto rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthenticationGate;
