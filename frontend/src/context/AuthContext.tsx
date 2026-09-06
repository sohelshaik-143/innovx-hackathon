import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  register: (registerData: any) => Promise<AuthResponse>;
  logout: () => void;
  switchDemoUser: (username: string, password: string) => Promise<void>;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nodues_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nodues_token'));
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    if (!token) return;
    try {
      const res = await api.get<{ unreadCount: number }>('/notifications/unread-count');
      setUnreadCount(res.data.unreadCount);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (token) {
      refreshUnreadCount();
      // Poll notifications every 30s
      const interval = setInterval(refreshUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const login = async (username: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/login', { username, password });
      const authData = res.data;

      localStorage.setItem('nodues_token', authData.token);
      setToken(authData.token);

      const userInfo: User = {
        id: authData.userId,
        username: authData.username,
        email: authData.email,
        fullName: authData.fullName,
        roles: authData.roles,
        active: true,
        demo: authData.isDemo,
        departmentId: authData.departmentId,
        departmentCode: authData.departmentCode,
        departmentName: authData.departmentName,
        head: authData.isHead,
        studentId: authData.studentId,
      };

      localStorage.setItem('nodues_user', JSON.stringify(userInfo));
      setUser(userInfo);
      return authData;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registerData: any): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/register', registerData);
      const authData = res.data;

      localStorage.setItem('nodues_token', authData.token);
      setToken(authData.token);

      const userInfo: User = {
        id: authData.userId,
        username: authData.username,
        email: authData.email,
        fullName: authData.fullName,
        roles: authData.roles,
        active: true,
        demo: authData.isDemo,
        departmentId: authData.departmentId,
        departmentCode: authData.departmentCode,
        departmentName: authData.departmentName,
        head: authData.isHead,
        studentId: authData.studentId,
      };

      localStorage.setItem('nodues_user', JSON.stringify(userInfo));
      setUser(userInfo);
      return authData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('nodues_token');
    localStorage.removeItem('nodues_user');
    setUser(null);
    setToken(null);
    setUnreadCount(0);
    window.location.href = '/login';
  };

  const switchDemoUser = async (username: string, password: string) => {
    const authData = await login(username, password);
    // Route to appropriate dashboard
    if (authData.roles.includes('ROLE_ADMIN')) {
      window.location.href = '/admin';
    } else if (authData.roles.includes('ROLE_DEPARTMENT_HEAD')) {
      window.location.href = '/head';
    } else if (authData.roles.includes('ROLE_DEPARTMENT_STAFF')) {
      window.location.href = '/department';
    } else {
      window.location.href = '/student';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoUser,
        unreadCount,
        refreshUnreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
