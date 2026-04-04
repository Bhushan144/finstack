// src/components/transactions/FilterBar.jsx
import { useState } from 'react';

const FilterBar = ({ onFilter }) => {
  const [filters, setFilters] = useState({
    type:      '',
    category:  '',
    startDate: '',
    endDate:   '',
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleApply = () => {
    // Remove empty fields before sending to parent
    const cleaned = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '')
    );
    onFilter(cleaned);
  };

  const handleReset = () => {
    setFilters({ type: '', category: '', startDate: '', endDate: '' });
    onFilter({});
  };

  const inputClass =
    'bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500 transition-colors';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-wrap gap-3 items-end">

      {/* Type filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-400">Type</label>
        <select
          name="type"
          value={filters.type}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="">All</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>

      {/* Category filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-400">Category</label>
        <input
          type="text"
          name="category"
          value={filters.category}
          onChange={handleChange}
          placeholder="e.g. Food"
          className={inputClass}
        />
      </div>

      {/* Date range */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-400">From</label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-400">To</label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
          className={inputClass}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Apply
        </button>
        <button
          onClick={handleReset}
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>

    </div>
  );
};

export default FilterBar;