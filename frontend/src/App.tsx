import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { DemoBanner } from './components/DemoBanner';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { DepartmentDashboard } from './pages/DepartmentDashboard';
import { DepartmentHeadDashboard } from './pages/DepartmentHeadDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PublicVerifyPage } from './pages/PublicVerifyPage';
import { CertificateViewPage } from './pages/CertificateViewPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({
  children,
  requiredRole,
}) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && !user.roles.includes(requiredRole)) {
    // Redirect to user's authorized home
    if (user.roles.includes('ROLE_ADMIN')) return <Navigate to="/admin" replace />;
    if (user.roles.includes('ROLE_DEPARTMENT_HEAD')) return <Navigate to="/head" replace />;
    if (user.roles.includes('ROLE_DEPARTMENT_STAFF')) return <Navigate to="/department" replace />;
    return <Navigate to="/student" replace />;
  }
  return <>{children}</>;
};

const HomeRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.roles.includes('ROLE_ADMIN')) return <Navigate to="/admin" replace />;
  if (user.roles.includes('ROLE_DEPARTMENT_HEAD')) return <Navigate to="/head" replace />;
  if (user.roles.includes('ROLE_DEPARTMENT_STAFF')) return <Navigate to="/department" replace />;
  return <Navigate to="/student" replace />;
};

export const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <DemoBanner />
      {user && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-certificate" element={<PublicVerifyPage />} />
          <Route path="/verify-certificate/:certificateNumber" element={<PublicVerifyPage />} />

          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="ROLE_STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/department"
            element={
              <ProtectedRoute requiredRole="ROLE_DEPARTMENT_STAFF">
                <DepartmentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/head"
            element={
              <ProtectedRoute requiredRole="ROLE_DEPARTMENT_HEAD">
                <DepartmentHeadDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ROLE_ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/certificate/:certificateId"
            element={
              <ProtectedRoute>
                <CertificateViewPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            CampusClear — Automated No-Dues &amp; Digital Clearance Platform
          </p>
          <p className="text-[11px] text-slate-400">
            Digital Campus Governance Division • Apex Institute of Technology • Verifiable Digital Credentials
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
