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
      // The leadership console has its own door — send an expired session back
      // to the portal it came from, not to the departmental admin login.
      const onSuperAdmin = window.location.pathname.startsWith('/super-admin');
      window.location.href = onSuperAdmin ? '/super-admin/login' : '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
