// src/pages/LandingPage.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800/50">
        <div>
          <span className="text-xl font-bold text-white">fin</span>
          <span className="text-xl font-bold text-blue-500">Stack</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-zinc-400 hover:text-zinc-100 text-sm transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">

        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #3b82f6, transparent)',
              animation: 'pulse 4s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full opacity-10 blur-3xl"
            style={{
              background: 'radial-gradient(circle, #8b5cf6, transparent)',
              animation: 'pulse 6s ease-in-out infinite reverse',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full mb-6">
            Finance Dashboard
          </span>
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Manage your finances
            <span className="text-blue-500"> with clarity</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
            Track income and expenses, visualize spending patterns,
            and manage your team — all in one place.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

      </main>

      {/* Features section */}
      <section className="px-8 py-16 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Role-Based Access',
              desc:  'Admins, Analysts, and Viewers each see exactly what they need.',
              icon:  '🔐',
            },
            {
              title: 'Real-Time Dashboard',
              desc:  'Income, expenses, and balance calculated in a single DB query.',
              icon:  '📊',
            },
            {
              title: 'Audit Trail',
              desc:  'Every create, update, and delete is logged with old and new values.',
              icon:  '📋',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors"
            >
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="text-zinc-100 font-medium mb-1">{feature.title}</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-8 py-5 text-center text-zinc-500 text-sm">
        finStack — Built for the Zorvyn Backend Internship Assignment
      </footer>

    </div>
  );
};

export default LandingPage;