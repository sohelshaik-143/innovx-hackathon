import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppShell } from './components/AppShell';
import { AuthenticationGate } from './components/AuthenticationGate';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { DepartmentDashboard } from './pages/DepartmentDashboard';
import { DepartmentHeadDashboard } from './pages/DepartmentHeadDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PublicVerifyPage } from './pages/PublicVerifyPage';
import { CertificateViewPage } from './pages/CertificateViewPage';
import { AccountPage } from './pages/AccountPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { getDashboardRoute } from './utils/roleUtils';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: string }> = ({
  children,
  requiredRole,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !user.roles?.includes(requiredRole)) {
    return <ForbiddenPage />;
  }

  return <AppShell>{children}</AppShell>;
};

const HomeRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardRoute(user)} replace />;
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/create-account" element={<RegisterPage />} />
      <Route path="/verify-certificate" element={<PublicVerifyPage />} />
      <Route path="/verify-certificate/:certificateNumber" element={<PublicVerifyPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

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

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AuthenticationGate>
            <AppContent />
          </AuthenticationGate>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
