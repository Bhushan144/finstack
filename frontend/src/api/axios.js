// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let accessToken = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;

// Attach token to every request
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const isRefreshCall = originalRequest.url.includes('/auth/refresh');
    const is401         = error.response?.status === 401;
    const notRetried    = !originalRequest._retry;

    // If the refresh call itself fails — give up, don't retry
    if (isRefreshCall) {
      setAccessToken(null);
      window.dispatchEvent(new CustomEvent('auth:logout'));
      return Promise.reject(error);
    }

    // For any other 401 — try to refresh once
    if (is401 && notRetried) {
      originalRequest._retry = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken  = data.data.accessToken;
        setAccessToken(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;