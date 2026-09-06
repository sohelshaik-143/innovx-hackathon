import axios from 'axios';

const configuredApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();

const normalizeApiBaseUrl = (value: string) => {
  const normalized = value.replace(/\/+$/, '');
  if (normalized === '/api' || normalized.endsWith('/api')) {
    return normalized;
  }
  return `${normalized}/api`;
};

// Vercel must provide VITE_API_URL because the Spring Boot API is deployed separately.
// Docker/local development can use the relative /api proxy.
const getBaseURL = () => {
  if (configuredApiUrl) {
    return normalizeApiBaseUrl(configuredApiUrl);
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nodues_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const pathname = window.location.pathname;
      if (
        !pathname.startsWith('/login') &&
        !pathname.startsWith('/register') &&
        !pathname.startsWith('/create-account') &&
        !pathname.startsWith('/verify-certificate')
      ) {
        localStorage.removeItem('nodues_token');
        localStorage.removeItem('nodues_user');
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
