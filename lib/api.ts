import axios from 'axios';
import { useAuthStore } from './store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const isLoginRequest = err.config?.url?.includes('/admin/auth/login');
    if (err.response?.status === 401 && typeof window !== 'undefined' && !isLoginRequest) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
