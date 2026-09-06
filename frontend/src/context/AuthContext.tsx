import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { User, AuthResponse } from '../types';
import { getDashboardRoute } from '../utils/roleUtils';

interface UserSummaryDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  roles: string[];
  active: boolean;
  demo: boolean;
  departmentId?: string;
  departmentCode?: string;
  departmentName?: string;
  head: boolean;
  studentId?: string;
  rollNo?: string;
  program?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthResponse>;
  register: (registerData: any) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  switchDemoUser: (username: string, password: string) => Promise<void>;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nodues_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nodues_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const logout = useCallback(() => {
    localStorage.removeItem('nodues_token');
    localStorage.removeItem('nodues_user');
    setUser(null);
    setToken(null);
    setUnreadCount(0);
    window.location.href = '/login';
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const currentToken = localStorage.getItem('nodues_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return null;
    }
    try {
      const res = await api.get<UserSummaryDto>('/auth/me');
      const profile = res.data;
      const updatedUser: User = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        fullName: profile.fullName,
        roles: Array.isArray(profile.roles) ? profile.roles : [],
        active: profile.active,
        demo: profile.demo,
        departmentId: profile.departmentId,
        departmentCode: profile.departmentCode,
        departmentName: profile.departmentName,
        head: profile.head,
        studentId: profile.studentId,
        rollNo: profile.rollNo,
        program: profile.program,
      };
      localStorage.setItem('nodues_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      console.warn('Failed to verify user profile from backend on mount:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('nodues_token');
        localStorage.removeItem('nodues_user');
        setUser(null);
        setToken(null);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    const currentToken = localStorage.getItem('nodues_token');
    if (!currentToken) return;
    try {
      const res = await api.get<{ unreadCount: number }>('/notifications/unread-count');
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      // ignore notification count errors
    }
  }, []);

  // Initial mount verification
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('nodues_token');
      if (savedToken) {
        await refreshUser();
      } else {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [refreshUser]);

  useEffect(() => {
    if (token && user) {
      refreshUnreadCount();
      const interval = setInterval(refreshUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token, user, refreshUnreadCount]);

  const login = async (username: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/login', { username, password });
      const authData = res.data;

      if (!authData.token) {
        throw new Error('No authentication token received from server');
      }

      localStorage.setItem('nodues_token', authData.token);
      setToken(authData.token);

      const userInfo: User = {
        id: authData.userId || 'unknown',
        username: authData.username || username,
        email: authData.email || 'unknown',
        fullName: authData.fullName || 'User',
        roles: Array.isArray(authData.roles) ? authData.roles : [],
        active: true,
        demo: authData.isDemo ?? false,
        departmentId: authData.departmentId,
        departmentCode: authData.departmentCode,
        departmentName: authData.departmentName,
        head: authData.isHead ?? false,
        studentId: authData.studentId,
      };

      localStorage.setItem('nodues_user', JSON.stringify(userInfo));
      setUser(userInfo);

      // Verify authoritative profile from backend asynchronously
      refreshUser().catch(() => {});

      return authData;
    } catch (error) {
      setToken(null);
      setUser(null);
      localStorage.removeItem('nodues_token');
      localStorage.removeItem('nodues_user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (registerData: any): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/register', registerData);
      const authData = res.data;

      if (!authData.token) {
        throw new Error('No authentication token received from server');
      }

      localStorage.setItem('nodues_token', authData.token);
      setToken(authData.token);

      const userInfo: User = {
        id: authData.userId || 'unknown',
        username: authData.username || registerData.username,
        email: authData.email || registerData.email,
        fullName: authData.fullName || registerData.fullName,
        roles: Array.isArray(authData.roles) ? authData.roles : [],
        active: true,
        demo: authData.isDemo ?? false,
        departmentId: authData.departmentId,
        departmentCode: authData.departmentCode,
        departmentName: authData.departmentName,
        head: authData.isHead ?? false,
        studentId: authData.studentId,
      };

      localStorage.setItem('nodues_user', JSON.stringify(userInfo));
      setUser(userInfo);
      return authData;
    } catch (error) {
      setToken(null);
      setUser(null);
      localStorage.removeItem('nodues_token');
      localStorage.removeItem('nodues_user');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoUser = async (username: string, password: string) => {
    const authData = await login(username, password);
    const userObj = { roles: authData.roles } as any;
    window.location.href = getDashboardRoute(userObj);
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
        refreshUser,
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
