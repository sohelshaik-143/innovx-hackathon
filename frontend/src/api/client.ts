import axios from 'axios';

// Determine API base URL based on environment
const getBaseURL = () => {
  // If VITE_API_URL is set, use it (for Vercel)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Otherwise use relative path (works with Vercel rewrites and local proxy)
  return '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
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
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Ensure response has expected structure
    if (!response.data) {
      console.warn('Empty response body');
    }
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // If unauthorized and not on public pages, clear token
      const pathname = window.location.pathname;
      if (
        !pathname.startsWith('/login') &&
        !pathname.startsWith('/register') &&
        !pathname.startsWith('/create-account') &&
        !pathname.startsWith('/verify-certificate')
      ) {
        localStorage.removeItem('nodues_token');
        localStorage.removeItem('nodues_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
