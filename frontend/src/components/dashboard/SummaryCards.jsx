// src/components/dashboard/SummaryCards.jsx
import { formatCurrency } from '../../utils/formatters';

// Each card gets its own color scheme based on what it represents
const cards = (summary) => [
  {
    label:  'Total Income',
    value:  summary.income,
    color:  'text-emerald-400',
    bg:     'bg-emerald-500/10 border-emerald-500/20',
    icon:   '↑',
  },
  {
    label:  'Total Expenses',
    value:  summary.expense,
    color:  'text-rose-400',
    bg:     'bg-rose-500/10 border-rose-500/20',
    icon:   '↓',
  },
  {
    label:  'Net Balance',
    value:  summary.balance,
    // Balance color depends on positive or negative
    color:  summary.balance >= 0 ? 'text-blue-400' : 'text-rose-400',
    bg:     'bg-blue-500/10 border-blue-500/20',
    icon:   '=',
  },
];

const SummaryCards = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards(summary).map((card) => (
        <div
          key={card.label}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
        >
          {/* Icon + label row */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-md border ${card.bg} ${card.color}`}>
              {card.icon}
            </span>
            <span className="text-sm text-zinc-400">{card.label}</span>
          </div>

          {/* Amount */}
          <p className={`text-2xl font-bold ${card.color}`}>
            {formatCurrency(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;