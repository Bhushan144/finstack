// src/components/transactions/TransactionModal.jsx
import { useState, useEffect } from 'react';

const CATEGORIES = [
  'Salary', 'Freelance', 'Investments', 'Dividends',
  'Food', 'Rent', 'Transport', 'Entertainment',
  'Healthcare', 'Software Subscriptions', 'Other'
];

// Build a fresh empty form with today's date
const getEmptyForm = () => ({
  type:     'EXPENSE',
  amount:   '',
  category: 'Food',
  note:     '',
  date:     new Date().toISOString().split('T')[0],
});

const TransactionModal = ({ isOpen, onClose, onSubmit, editData }) => {
  const [form, setForm]     = useState(getEmptyForm);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // If editData is passed, pre-fill the form for editing
  useEffect(() => {
    if (editData) {
      setForm({
        type:     editData.type,
        amount:   editData.amount,
        category: editData.category,
        note:     editData.note || '',
        date:     editData.date.split('T')[0],
      });
    } else {
      setForm(getEmptyForm());
    }
    setError('');
  }, [editData, isOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }
    if (!form.date) {
      setError('Please select a date.');
      return;
    }

    setLoading(true);
    try {
      // Convert amount to number and date to ISO string before sending
      await onSubmit({
        ...form,
        amount: Number(form.amount),
        date:   new Date(form.date).toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass =
    'bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-blue-500 transition-colors w-full';

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      onClick={onClose} // click outside to close
    >
      {/* Modal box — stop click from bubbling to backdrop */}
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-zinc-100">
            {editData ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400">Type</label>
            <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400">Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0"
              min="1"
              className={inputClass}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400">Category</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Note */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-400">Note (optional)</label>
            <input
              type="text"
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="e.g. Monthly grocery run"
              className={inputClass}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : editData ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TransactionModal;