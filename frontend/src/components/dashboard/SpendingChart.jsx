// src/components/dashboard/SpendingChart.jsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Month number → short name  e.g. 3 → "Mar"
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// The backend sends: [{ year, month, type, total }, ...]
// Recharts needs:    [{ month: "Mar", INCOME: 5000, EXPENSE: 2000 }, ...]
const transformData = (trend) => {
  const map = {};

  trend.forEach(({ year, month, type, total }) => {
    const key = `${MONTHS[month - 1]} ${year}`;
    if (!map[key]) map[key] = { month: key, INCOME: 0, EXPENSE: 0 };
    map[key][type] = total;
  });

  // Sort chronologically
  return Object.values(map);
};

// Custom tooltip so it matches our dark theme
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm">
      <p className="text-zinc-300 font-medium mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: ₹{entry.value?.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

const SpendingChart = ({ trend }) => {
  if (!trend?.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">No trend data available</p>
      </div>
    );
  }

  const data = transformData(trend);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="text-sm font-medium text-zinc-400 mb-4">Income vs Expenses</h2>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />

          <XAxis
            dataKey="month"
            tick={{ fill: '#71717a', fontSize: 12 }}
            axisLine={{ stroke: '#3f3f46' }}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: '#71717a', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }}
          />

          <Line
            type="monotone"
            dataKey="INCOME"
            stroke="#34d399"
            strokeWidth={2}
            dot={{ fill: '#34d399', r: 3 }}
            activeDot={{ r: 5 }}
          />

          <Line
            type="monotone"
            dataKey="EXPENSE"
            stroke="#fb7185"
            strokeWidth={2}
            dot={{ fill: '#fb7185', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendingChart;