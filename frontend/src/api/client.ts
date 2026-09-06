import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
