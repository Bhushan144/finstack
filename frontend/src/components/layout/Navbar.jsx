// src/components/layout/Navbar.jsx
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Map route paths to readable page titles
const pageTitles = {
  '/dashboard'    : 'Dashboard',
  '/transactions' : 'Transactions',
  '/users'        : 'Manage Users',
};

const Navbar = () => {
  const { user } = useAuth();
  const location  = useLocation();

  const title = pageTitles[location.pathname] || 'finStack';

  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-10">

      {/* Page title */}
      <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>

      {/* Right side — greeting */}
      <p className="text-sm text-zinc-400">
        Hey, <span className="text-zinc-200 font-medium">{user?.name}</span>
      </p>

    </header>
  );
};

export default Navbar;