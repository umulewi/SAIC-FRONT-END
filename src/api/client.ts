import axios from 'axios';

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE ?? ''}/api`,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('saic_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AUTH_ENDPOINTS = ['/login', '/forgot-password', '/reset-password'];

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const url: string = err.config?.url ?? '';
    const isAuthCall = AUTH_ENDPOINTS.some((ep) => url.includes(ep));
    if (!isAuthCall && (err.response?.status === 401 || err.response?.status === 403)) {
      localStorage.removeItem('saic_token');
      localStorage.removeItem('saic_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;
