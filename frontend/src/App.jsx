// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import { useAuth } from './hooks/useAuth';

import LandingPage      from './pages/LandingPage';
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import DashboardPage    from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import UsersPage        from './pages/UsersPage';

// Separate component so it can use useAuth (must be inside AuthProvider)
const AppRoutes = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Any logged-in user */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Analysts and Admins only */}
      <Route path="/transactions" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'ANALYST']}>
          <AppLayout><TransactionsPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Admins only */}
      <Route path="/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AppLayout><UsersPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />  {/* ← AppRoutes is inside AuthProvider so useAuth works */}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;