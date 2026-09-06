import { User } from '../types';

export const getDashboardRoute = (user: User | null): string => {
  if (!user || !user.roles || user.roles.length === 0) {
    return '/login';
  }
  if (user.roles.includes('ROLE_ADMIN')) {
    return '/admin';
  }
  if (user.roles.includes('ROLE_DEPARTMENT_HEAD')) {
    return '/head';
  }
  if (user.roles.includes('ROLE_DEPARTMENT_STAFF')) {
    return '/department';
  }
  if (user.roles.includes('ROLE_STUDENT')) {
    return '/student';
  }
  return '/403';
};
