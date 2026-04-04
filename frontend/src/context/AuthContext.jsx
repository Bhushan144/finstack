// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);  // { id, name, role }
  const [isLoading, setIsLoading] = useState(true); // waiting for silent refresh

  // On page load — check if the refresh token cookie is still valid
  // If yes, get a new access token silently so the user stays logged in
  useEffect(() => {
    const silentRefresh = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        const token = data.data.accessToken;
        setAccessToken(token);

        // Decode the JWT payload to get user info (no library needed)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, role: payload.role });
      } catch {
        // Cookie expired or missing — user must log in
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    silentRefresh();
  }, []);

  // Listen for forced logout triggered by the axios interceptor
  useEffect(() => {
    const handleLogout = () => { setUser(null); setAccessToken(null); };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  // ── Auth functions ──────────────────────────────────────────────────────────

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = data.data;
    setAccessToken(accessToken);
    setUser(userData); // { id, name, role }
  };

  const register = async (name, email, password) => {
    await api.post('/auth/register', { name, email, password });
    // Registration doesn't auto-login — redirect to /login after
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  // ── Simple role booleans (easier to use in components) ──────────────────────
  const isAdmin   = user?.role === 'ADMIN';
  const isAnalyst = user?.role === 'ANALYST';
  const isViewer  = user?.role === 'VIEWER';

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin,
      isAnalyst,
      isViewer,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};