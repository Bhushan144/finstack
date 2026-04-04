// src/components/dashboard/CategoryChart.jsx
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// A set of colors to cycle through for each category slice
const COLORS = ['#3b82f6','#34d399','#fb7185','#f59e0b','#a78bfa','#22d3ee','#f97316'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm">
      <p className="text-zinc-300 font-medium">{name}</p>
      <p className="text-zinc-400">₹{value?.toLocaleString('en-IN')}</p>
    </div>
  );
};

const CategoryChart = ({ byCategory }) => {
  if (!byCategory?.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">No category data available</p>
      </div>
    );
  }

  // Backend sends: [{ _id: "Food", total: 500 }, ...]
  // Recharts needs: [{ name: "Food", value: 500 }, ...]
  const data = byCategory.map((item) => ({
    name:  item._id,
    value: item.total,
  }));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <h2 className="text-sm font-medium text-zinc-400 mb-4">Spending by Category</h2>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;