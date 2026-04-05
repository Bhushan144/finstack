// src/components/transactions/FilterBar.jsx
import { useState } from 'react';
import { CATEGORIES } from '../../utils/constants';

const FilterBar = ({ onFilter }) => {
  const [type, setType]               = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [showCatDropdown, setShowCatDropdown] = useState(false);

  // Toggle a category in/out of the selected list
  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)  // remove if already selected
        : [...prev, cat]                  // add if not selected
    );
  };

  const handleApply = () => {
    const filters = {};
    if (type)                        filters.type = type;
    if (selectedCategories.length)   filters.category = selectedCategories.join(',');
    if (startDate && endDate) {
      filters.startDate = startDate;
      filters.endDate   = endDate;
    }
    onFilter(filters);
    setShowCatDropdown(false);
  };

  const handleReset = () => {
    setType('');
    setSelectedCategories([]);
    setStartDate('');
    setEndDate('');
    onFilter({});
    setShowCatDropdown(false);
  };

  const inputClass =
    'bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500 transition-colors';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-wrap gap-3 items-end">

      {/* Type filter */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-400">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={inputClass}
        >
          <option value="">All</option>
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>

      {/* Category multi-select dropdown */}
      <div className="flex flex-col gap-1.5 relative">
        <label className="text-xs text-zinc-400">Category</label>

        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setShowCatDropdown((prev) => !prev)}
          className={`${inputClass} flex items-center justify-between gap-4 min-w-44 text-left`}
        >
          <span className={selectedCategories.length ? 'text-zinc-100' : 'text-zinc-500'}>
            {selectedCategories.length === 0
              ? 'All categories'
              : selectedCategories.length === 1
              ? selectedCategories[0]
              : `${selectedCategories.length} selected`}
          </span>
          {/* Chevron icon */}
          <svg
            width="14" height="14"
            fill="none" stroke="currentColor" strokeWidth="2"
            viewBox="0 0 24 24"
            className={`text-zinc-400 transition-transform ${showCatDropdown ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* Dropdown list */}
        {showCatDropdown && (
          <div className="absolute top-full mt-1 left-0 z-20 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl min-w-52 py-1">

            {/* Select All / Clear All */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700">
              <button
                onClick={() => setSelectedCategories([...CATEGORIES])}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Select all
              </button>
              <button
                onClick={() => setSelectedCategories([])}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Clear
              </button>
            </div>

            {/* Category checkboxes */}
            {CATEGORIES.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-700/50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="accent-blue-500 w-3.5 h-3.5"
                />
                <span className="text-sm text-zinc-200">{cat}</span>
              </label>
            ))}

          </div>
        )}
      </div>

      {/* Date range */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-400">From</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-400">To</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
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