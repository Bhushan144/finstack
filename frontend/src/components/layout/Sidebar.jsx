// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Simple SVG icons as components (no extra library needed)
const DashboardIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

const TransactionIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const Sidebar = () => {
  const { user, isAdmin, isAnalyst, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Base style for all nav links
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-blue-500/10 text-blue-400 font-medium'
        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
    }`;

  return (
    <aside className="w-60 min-h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col">

      {/* Logo */}
      <div className="px-6 py-5 border-b border-zinc-800">
        <span className="text-xl font-bold text-white">fin</span>
        <span className="text-xl font-bold text-blue-500">Stack</span>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-zinc-800">
        <p className="text-sm font-medium text-zinc-100 truncate">{user?.name}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
          user?.role === 'ADMIN'   ? 'bg-purple-500/15 text-purple-400' :
          user?.role === 'ANALYST' ? 'bg-blue-500/15 text-blue-400'    :
                                     'bg-zinc-700 text-zinc-300'
        }`}>
          {user?.role}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">

        {/* Dashboard — visible to everyone */}
        <NavLink to="/dashboard" className={linkClass}>
          <DashboardIcon />
          Dashboard
        </NavLink>

        {/* Transactions — Analysts and Admins only */}
        {(isAdmin || isAnalyst) && (
          <NavLink to="/transactions" className={linkClass}>
            <TransactionIcon />
            Transactions
          </NavLink>
        )}

        {/* Users — Admins only */}
        {isAdmin && (
          <NavLink to="/users" className={linkClass}>
            <UsersIcon />
            Manage Users
          </NavLink>
        )}
      </nav>

      {/* Logout button at the bottom */}
      <div className="px-3 py-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;