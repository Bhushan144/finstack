// src/components/transactions/TransactionTable.jsx
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const TransactionTable = ({ transactions, pagination, onPageChange, onEdit, onDelete }) => {
  const { isAdmin, isAnalyst } = useAuth();

  if (!transactions?.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
        <p className="text-zinc-500 text-sm">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Category</th>
              <th className="text-left px-5 py-3 font-medium">Type</th>
              <th className="text-left px-5 py-3 font-medium">Date</th>
              <th className="text-left px-5 py-3 font-medium">Note</th>
              <th className="text-right px-5 py-3 font-medium">Amount</th>
              {/* Show actions column to Admin and Analyst */}
              {(isAdmin || isAnalyst) && (
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx._id}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors last:border-0"
              >
                <td className="px-5 py-3.5 text-zinc-200 font-medium">{tx.category}</td>

                <td className="px-5 py-3.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    tx.type === 'INCOME'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {tx.type}
                  </span>
                </td>

                <td className="px-5 py-3.5 text-zinc-400">{formatDate(tx.date)}</td>

                <td className="px-5 py-3.5 text-zinc-500 italic">
                  {tx.note || '—'}
                </td>

                <td className={`px-5 py-3.5 text-right font-semibold ${
                  tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                </td>

                {/* Edit + Delete — Admin and Analyst */}
                {(isAdmin || isAnalyst) && (
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(tx)}
                        className="text-xs text-zinc-400 hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-blue-500/10"
                      >
                        Edit
                      </button>
                      {/* Only Admin can delete financial records */}
                      {isAdmin && (
                        <button
                          onClick={() => onDelete(tx._id)}
                          className="text-xs text-zinc-400 hover:text-rose-400 transition-colors px-2 py-1 rounded hover:bg-rose-500/10"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800">
          <p className="text-xs text-zinc-500">
            Page {pagination.page} of {pagination.totalPages} —{' '}
            {pagination.total} total records
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default TransactionTable;