"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function money(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#f59e0b",
  "#0891b2",
  "#db2777",
  "#64748b",
];

export default function AdvancedDashboardCharts({ expenses = [], incomes = [], budgets = [] }) {
  const categoryData = {};

  expenses.forEach((e) => {
    const category = e.category?.name || e.categoryName || e.category || "Other";
    categoryData[category] = (categoryData[category] || 0) + Number(e.amount || 0);
  });

  const categoryChart = Object.entries(categoryData).map(([name, amount]) => ({
    name,
    amount,
  }));

  const budgetVsSpent = budgets.map((b) => {
    const spent = categoryData[b.category] || 0;

    return {
      category: b.category,
      budget: Number(b.amount || 0),
      spent,
      remaining: Number(b.amount || 0) - spent,
    };
  });

  const dailyMap = {};

  expenses.forEach((e) => {
    const day = new Date(e.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });

    dailyMap[day] = (dailyMap[day] || 0) + Number(e.amount || 0);
  });

  const dailyExpenseData = Object.entries(dailyMap).map(([date, amount]) => ({
    date,
    amount,
  }));

  const incomeExpenseData = [
    {
      name: "Income",
      amount: incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0),
    },
    {
      name: "Expense",
      amount: expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Category Pie */}
        <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6 shadow">
          <h2 className="text-xl font-bold mb-1">Category Expense Share</h2>
          <p className="text-sm text-gray-500 mb-5">
            Which category is using most of your money
          </p>

          {categoryChart.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="h-80 min-w-0 min-h-0">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={categoryChart}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    label
                  >
                    {categoryChart.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => money(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Income vs Expense */}
        <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6 shadow">
          <h2 className="text-xl font-bold mb-1">Income vs Expense</h2>
          <p className="text-sm text-gray-500 mb-5">
            Compare earning and spending
          </p>

          <div className="h-80 min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => money(value)} />
                <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
                  {incomeExpenseData.map((_, index) => (
                    <Cell key={index} fill={index === 0 ? "#16a34a" : "#dc2626"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Budget vs Spent */}
      <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6 shadow">
        <h2 className="text-xl font-bold mb-1">Budget vs Spent</h2>
        <p className="text-sm text-gray-500 mb-5">
          Category-wise budget comparison
        </p>

          {budgetVsSpent.length === 0 ? (
          <EmptyChart />
        ) : (
          <div className="h-96 min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height={384}>
              <BarChart data={budgetVsSpent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => money(value)} />
                <Legend />
                <Bar dataKey="budget" fill="#2563eb" radius={[8, 8, 0, 0]} />
                <Bar dataKey="spent" fill="#dc2626" radius={[8, 8, 0, 0]} />
                <Bar dataKey="remaining" fill="#16a34a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Daily Expense Trend */}
      <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6 shadow">
        <h2 className="text-xl font-bold mb-1">Daily Spending Trend</h2>
        <p className="text-sm text-gray-500 mb-5">
          See how your expenses changed during the month
        </p>

          {dailyExpenseData.length === 0 ? (
          <EmptyChart />
        ) : (
          <div className="h-96 min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height={384}>
              <AreaChart data={dailyExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => money(value)} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#2563eb"
                  fill="#bfdbfe"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category Line */}
      <div className="rounded-2xl border bg-white dark:bg-gray-900 p-6 shadow">
        <h2 className="text-xl font-bold mb-1">Category Amount Graph</h2>
        <p className="text-sm text-gray-500 mb-5">
          Compare category spending in line form
        </p>

        {categoryChart.length === 0 ? (
          <EmptyChart />
        ) : (
          <div className="h-80 min-w-0 min-h-0">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={categoryChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => money(value)} />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#9333ea"
                  strokeWidth={3}
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="h-64 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 border border-dashed">
      <p className="text-gray-500">No data available for this chart</p>
    </div>
  );
}