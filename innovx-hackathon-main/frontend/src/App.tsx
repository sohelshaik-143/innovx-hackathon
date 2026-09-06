import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/AppShell';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { DepartmentDashboard } from './pages/DepartmentDashboard';
import { DepartmentHeadDashboard } from './pages/DepartmentHeadDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PublicVerifyPage } from './pages/PublicVerifyPage';
import { CertificateViewPage } from './pages/CertificateViewPage';
import { AccountPage } from './pages/AccountPage';
import { RegisterPage } from './pages/RegisterPage';

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
  return <AppShell>{children}</AppShell>;
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
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/create-account" element={<RegisterPage />} />
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

      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
