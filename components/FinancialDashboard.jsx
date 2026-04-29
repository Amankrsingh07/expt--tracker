'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#0088FE', '#00C49F', '#FF8C42', '#6A0572'];

export default function FinancialDashboard({ period = 'month' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/dashboard/summary?month=${month}`, {
          credentials: 'include'
        });

        if (!res.ok) throw new Error('Failed to fetch');

        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [month]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 animate-pulse">Loading financial data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        Unable to load financial data. Please try again.
      </div>
    );
  }

  const { income, expenses, budget, savings } = data;

  // Data for charts
  const incomeChartData = Object.entries(income.bySource).map(([source, amount]) => ({
    name: source,
    value: amount
  }));

  const expenseChartData = Object.entries(expenses.byCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  const budgetChartData = Object.entries(budget.categoryBudgets).map(([category, data]) => ({
    name: category,
    allocated: data.allocated,
    spent: data.spent,
    remaining: Math.max(data.remaining, 0)
  }));

  // Summary metrics
  const metrics = [
    {
      title: '💰 Total Income',
      value: `₹${income.total.toFixed(2)}`,
      subtitle: `${income.count} sources`,
      bgColor: 'bg-green-50 dark:bg-green-900',
      textColor: 'text-green-600 dark:text-green-300'
    },
    {
      title: '📊 Total Expenses',
      value: `₹${expenses.total.toFixed(2)}`,
      subtitle: `${expenses.count} transactions`,
      bgColor: 'bg-red-50 dark:bg-red-900',
      textColor: 'text-red-600 dark:text-red-300'
    },
    {
      title: '💳 Budget Used',
      value: `${budget.percentUsed}%`,
      subtitle: `₹${budget.remaining.toFixed(2)} remaining`,
      bgColor: 'bg-blue-50 dark:bg-blue-900',
      textColor: 'text-blue-600 dark:text-blue-300'
    },
    {
      title: '🎯 Savings',
      value: `₹${savings.total.toFixed(2)}`,
      subtitle: `${savings.rate}% saved`,
      bgColor: 'bg-purple-50 dark:bg-purple-900',
      textColor: 'text-purple-600 dark:text-purple-300'
    }
  ];

 return (
  <div className="space-y-8">

    {/* 🔝 Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h1 className="text-2xl font-bold">Financial Dashboard</h1>

      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="input w-48 bg-white text-black 
             dark:bg-slate-800 dark:text-white 
             dark:border-slate-600gi  
        "
      />
    </div>

    {/* 💰 Metrics */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((m, i) => (
        <div key={i} className="card hover:shadow-xl transition">
          <p className="text-sm text-muted">{m.title}</p>
          <p className="text-2xl font-bold mt-2">{m.value}</p>
          <p className="text-xs text-muted mt-1">{m.subtitle}</p>
        </div>
      ))}
    </div>

    {/* ⚠️ Alert */}
    {data.status.isBudgetExceeded && (
      <div className="card border-l-4 border-red-500 bg-red-50 dark:bg-red-900/30">
        <p className="font-semibold text-red-600">
          ⚠ Budget exceeded by ₹{(budget.spent - budget.monthlyLimit).toFixed(2)}
        </p>
      </div>
    )}

    {/* 📊 Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Income */}
      <div className="card">
        <h2 className="font-semibold mb-4">Income Sources</h2>
        <div className="min-w-0 min-h-0">
          <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={incomeChartData} dataKey="value" outerRadius={90}>
              {incomeChartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
          </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expenses */}
      <div className="card">
        <h2 className="font-semibold mb-4">Expense Categories</h2>
        <div className="min-w-0 min-h-0">
          <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={expenseChartData} dataKey="value" outerRadius={90}>
              {expenseChartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
          </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>

    {/* 📊 Bar Chart */}
    <div className="card">
      <h2 className="font-semibold mb-4">Budget vs Spending</h2>
      <div className="min-w-0 min-h-0">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={budgetChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
          <Legend />
          <Bar dataKey="allocated" fill="#6366f1" />
          <Bar dataKey="spent" fill="#ef4444" />
          <Bar dataKey="remaining" fill="#22c55e" />
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* 📋 Table */}
    <div className="card overflow-x-auto">
      <h2 className="font-semibold mb-4">Category Summary</h2>

      <table className="w-full text-sm">
        <thead className="border-b">
          <tr className="text-muted">
            <th className="text-left p-3">Category</th>
            <th className="text-right p-3">Allocated</th>
            <th className="text-right p-3">Spent</th>
            <th className="text-right p-3">Remaining</th>
            <th className="text-right p-3">%</th>
          </tr>
        </thead>

        <tbody>
          {Object.entries(budget.categoryBudgets).map(([cat, d]) => (
            <tr key={cat} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <td className="p-3 font-medium">{cat}</td>

              <td className="text-right p-3">₹{d.allocated.toFixed(0)}</td>

              <td className="text-right p-3 text-red-500 font-semibold">
                ₹{d.spent.toFixed(0)}
              </td>

              <td className={`text-right p-3 font-semibold ${
                d.remaining >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                ₹{d.remaining.toFixed(0)}
              </td>

              <td className="text-right p-3">
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  d.percentUsed > 100 ? 'bg-red-100 text-red-600' :
                  d.percentUsed > 80 ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {d.percentUsed}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* 📈 Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="card text-center">
        <p className="text-muted text-sm">Income</p>
        <p className="text-2xl font-bold text-green-500">₹{income.total.toFixed(0)}</p>
      </div>

      <div className="card text-center">
        <p className="text-muted text-sm">Expenses</p>
        <p className="text-2xl font-bold text-red-500">₹{expenses.total.toFixed(0)}</p>
      </div>

      <div className="card text-center">
        <p className="text-muted text-sm">Savings</p>
        <p className="text-2xl font-bold text-indigo-500">₹{savings.total.toFixed(0)}</p>
      </div>
    </div>

  </div>
);
}
