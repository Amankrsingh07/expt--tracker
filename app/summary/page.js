'use client';

import { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import { useRouter, useSearchParams } from 'next/navigation';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(Number(value || 0));
}

export default function FinancialSummaryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const userRes = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (!userRes.ok) {
        router.push('/login');
        return;
      }

      const res = await fetch(`/api/dashboard/summary?month=${month}`, {
        credentials: 'include'
      });

      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Summary Error:', error);
    } finally {
      setLoading(false);
    }
  }, [month, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData, searchParams?.get?.('refresh')]);

  useEffect(() => {
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    }

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchData]);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10">Loading...</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="text-center py-10">No data</div>
      </Layout>
    );
  }

  const { income, expenses, budget, savings } = data;

  const categoryBudgets = budget?.categoryBudgets || {};

  // ✅ Correct budget calculation
  const monthlyLimit = Object.values(categoryBudgets).reduce(
    (sum, item) => sum + Number(item.allocated || 0),
    0
  );

  const spent = Number(expenses?.total || 0);
  const remaining = monthlyLimit - spent;
  const percentUsed =
    monthlyLimit > 0 ? Math.round((spent / monthlyLimit) * 100) : 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">💼 Financial Summary</h1>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white text-black dark:bg-slate-800 dark:text-white dark:border-slate-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Income"
            value={income.total}
            subtitle={`${income.count} sources`}
            icon="💰"
            color="green"
          />

          <MetricCard
            title="Total Expenses"
            value={expenses.total}
            subtitle={`${expenses.count} items`}
            icon="💳"
            color="red"
          />

          <MetricCard
            title="Budget Used"
            value={`${percentUsed}%`}
            subtitle={`${formatCurrency(remaining)} left`}
            icon="📊"
            color="blue"
          />

          <MetricCard
            title="Savings"
            value={savings.total}
            subtitle={`${savings.rate}% rate`}
            icon="🎯"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📈 Income Breakdown</h2>

            <div className="space-y-3">
              {Object.entries(income.bySource || {}).map(([source, amount]) => (
                <div
                  key={source}
                  className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 rounded-lg"
                >
                  <span className="font-semibold">{source}</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-300">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📌 Budget Status</h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Monthly Limit</span>
                  <span className="text-sm">
                    {formatCurrency(spent)} / {formatCurrency(monthlyLimit)}
                  </span>
                </div>

                <div className="w-full bg-gray-300 rounded-full h-4">
                  <div
                    className={`h-4 rounded-full transition-all ${
                      percentUsed > 100
                        ? 'bg-red-500'
                        : percentUsed > 80
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  />
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {percentUsed}% used • {formatCurrency(remaining)} remaining
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">🏷️ Category-Wise Breakdown</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="text-left p-3">Category</th>
                  <th className="text-right p-3">Budget</th>
                  <th className="text-right p-3">Spent</th>
                  <th className="text-right p-3">Remaining</th>
                  <th className="text-center p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {Object.entries(categoryBudgets).map(([category, item]) => (
                  <tr key={category} className="border-b hover:bg-surface">
                    <td className="p-3 font-medium">{category}</td>

                    <td className="text-right p-3 text-blue-600 font-semibold">
                      {formatCurrency(item.allocated)}
                    </td>

                    <td className="text-right p-3 text-red-600 font-semibold">
                      {formatCurrency(item.spent)}
                    </td>

                    <td
                      className={`text-right p-3 font-semibold ${
                        item.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(item.remaining)}
                    </td>

                    <td className="text-center p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          item.percentUsed > 100
                            ? 'bg-red-100 text-red-700'
                            : item.percentUsed > 80
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {item.percentUsed}%
                      </span>
                    </td>
                  </tr>
                ))}

                {Object.keys(categoryBudgets).length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-6 text-gray-500">
                      No budget set for this month
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {expenses.count > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📝 Recent Expenses</h2>

            <div className="space-y-4">
              {Object.entries(expenses.categoryDetails || {}).map(
                ([category, item]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-3">{category}</h3>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {item.expenses.map((exp) => (
                        <div
                          key={exp.id}
                          className="flex justify-between text-sm p-2 bg-surface rounded"
                        >
                          <div>
                            <p className="font-medium">
                              {exp.description || 'No description'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(exp.date).toLocaleDateString()}
                            </p>
                          </div>

                          <p className="font-bold text-red-600">
                            {formatCurrency(exp.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function MetricCard({ title, value, subtitle, icon, color }) {
  const colors = {
    green:
      'bg-green-50 dark:bg-green-900 border-green-500 text-green-600 dark:text-green-300',
    red:
      'bg-red-50 dark:bg-red-900 border-red-500 text-red-600 dark:text-red-300',
    blue:
      'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-300',
    purple:
      'bg-purple-50 dark:bg-purple-900 border-purple-500 text-purple-600 dark:text-purple-300'
  };

  return (
    <div className={`p-4 border-l-4 rounded-lg ${colors[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            {title}
          </p>

          <p className="text-2xl font-bold mt-1">
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>

          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>

        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}