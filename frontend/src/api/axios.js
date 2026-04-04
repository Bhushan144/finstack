// src/api/axios.js
import axios from 'axios';

// Create a single axios instance used everywhere in the app
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // sends the HttpOnly refresh token cookie automatically
});

// We store the access token in a simple variable (not localStorage — safer)
let accessToken = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;

// Before every request — attach the token if we have one
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// After every response — if we get a 401, try to refresh the token once
api.interceptors.response.use(
  (response) => response, // success — pass it through

  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors, and don't retry the refresh call itself
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // mark so we don't loop forever

      try {
        // Ask the backend for a new access token using the cookie
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.accessToken;

        setAccessToken(newToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);

      } catch {
        // Refresh failed — force the user to log in again
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;