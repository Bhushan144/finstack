// src/components/dashboard/RecentActivity.jsx
import { formatCurrency, formatDate } from '../../utils/formatters';

const RecentActivity = ({ recent }) => {
  if (!recent?.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Recent Activity</h2>
        <p className="text-zinc-500 text-sm">No recent transactions</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="text-sm font-medium text-zinc-400 mb-4">Recent Activity</h2>

      <div className="flex flex-col gap-3">
        {recent.map((tx) => (
          <div
            key={tx._id}
            className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
          >
            {/* Left side — category + date */}
            <div>
              <p className="text-sm text-zinc-200 font-medium">{tx.category}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{formatDate(tx.date)}</p>
              {tx.note && (
                <p className="text-xs text-zinc-600 mt-0.5 italic">{tx.note}</p>
              )}
            </div>

            {/* Right side — amount + type badge */}
            <div className="text-right">
              <p className={`text-sm font-semibold ${
                tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                tx.type === 'INCOME'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}>
                {tx.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;