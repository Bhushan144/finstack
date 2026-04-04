// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import SummaryCards    from '../components/dashboard/SummaryCards';
import SpendingChart   from '../components/dashboard/SpendingChart';
import CategoryChart   from '../components/dashboard/CategoryChart';
import RecentActivity  from '../components/dashboard/RecentActivity';

const DashboardPage = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Row 1 — Summary cards */}
      <SummaryCards summary={data?.summary} />

      {/* Row 2 — Line chart + Pie chart side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpendingChart  trend={data?.trend} />
        <CategoryChart  byCategory={data?.byCategory} />
      </div>

      {/* Row 3 — Recent activity full width */}
      <RecentActivity recent={data?.recent} />

    </div>
  );
};

export default DashboardPage;