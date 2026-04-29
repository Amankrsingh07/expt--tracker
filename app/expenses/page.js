'use client';

import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function formatCurrency(value) {
  try {
    const n = Number(value) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(n);
  } catch (e) {
    return `₹${Number(value || 0).toFixed(2)}`;
  }
}

function SummaryBar({ income = 0, expense = 0 }) {
  const total = Math.max(income + expense, 1);
  const incomePct = (income / total) * 100;
  const expensePct = (expense / total) * 100;

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden h-4 shadow-sm flex">
      <div
        className="h-4 bg-gradient-to-r from-green-400 to-green-500"
        style={{ width: `${Math.max(0, incomePct)}%` }}
      />
      <div
        className="h-4 bg-gradient-to-r from-red-400 to-red-500"
        style={{ width: `${Math.max(0, expensePct)}%` }}
      />
    </div>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [filters, setFilters] = useState({
    from: '',
    to: '',
    category: '',
    min: '',
    max: '',
    search: ''
  });

  useEffect(() => {
    loadCats();
  }, []);

  useEffect(() => {
    load();
    loadIncomes();
  }, [filters]);

  async function loadCats() {
    try {
      const res = await fetch('/api/categories', {
        credentials: 'include'
      });

      if (res.ok) {
        const json = await res.json();
        setCategories(json.categories || []);
      }
    } catch (e) {
      console.error('loadCats error', e);
      setCategories([]);
    }
  }

  async function load() {
    try {
      const params = new URLSearchParams();

      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);

      // ✅ Default current month filter
      if (!filters.from && !filters.to) {
        const now = new Date();
        const month = now.toISOString().slice(0, 7); // example: 2026-04
        params.set('month', month);
      }

      if (filters.category) params.set('category', filters.category);
      if (filters.min) params.set('min', String(filters.min));
      if (filters.max) params.set('max', String(filters.max));
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`/api/expenses?${params.toString()}`, {
        credentials: 'include'
      });

      if (!res.ok) {
        console.error('Failed to load expenses', res.status);
        setExpenses([]);
        return;
      }

      const json = await res.json();
      setExpenses(json.expenses || []);
    } catch (e) {
      console.error('load expenses error', e);
      setExpenses([]);
    }
  }

  async function loadIncomes() {
    try {
      const res = await fetch('/api/incomes', {
        credentials: 'include'
      });

      if (!res.ok) {
        setIncomes([]);
        return;
      }

      const json = await res.json();

      if (Array.isArray(json)) {
        setIncomes(json);
      } else {
        setIncomes(json.incomes || []);
      }
    } catch (e) {
      console.error('loadIncomes error', e);
      setIncomes([]);
    }
  }

  async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;

    const res = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (res.ok) {
      load();
    }
  }

  function resetFilters() {
    setFilters({
      from: '',
      to: '',
      category: '',
      min: '',
      max: '',
      search: ''
    });
  }

  const totalExpense = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalIncome = incomes.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const remaining = totalIncome - totalExpense;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              💳 Expenses
            </h1>
            <p className="text-muted mt-2">
              Track and manage all your expenses
            </p>
          </div>

          <Button
            asChild
            className="h-12 px-6 text-base font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-lg"
          >
            <Link href="/add-expense">➕ Add Expense</Link>
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              📊 Summary
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                  <div className="text-sm text-muted font-semibold">
                    Total Income
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                    {formatCurrency(totalIncome)}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 border-red-500">
                  <div className="text-sm text-muted font-semibold">
                    Total Expense
                  </div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                    {formatCurrency(totalExpense)}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
                  <div className="text-sm text-muted font-semibold">
                    Remaining
                  </div>
                  <div
                    className={`text-2xl font-bold mt-2 ${
                      remaining >= 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {formatCurrency(remaining)}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <p className="text-sm font-semibold text-muted mb-3">
                  Income vs Expense
                </p>
                <SummaryBar income={totalIncome} expense={totalExpense} />
                <p className="text-xs text-muted mt-2">
                  {totalIncome > 0
                    ? `${Math.round((totalExpense / totalIncome) * 100)}% of income spent`
                    : 'No income data'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters Card */}
        <Card className="border-amber-200 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔍 Search & Filter
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="font-semibold">
                  Search by description or category
                </Label>
                <Input
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  placeholder="🔎 Search expenses..."
                  className="h-10 mt-2 bg-white text-black dark:bg-slate-800 dark:text-white dark:border-slate-600"
                />
              </div>

              <div>
                <Label className="font-semibold">From Date</Label>
                <Input
                  type="date"
                  value={filters.from}
                  onChange={(e) =>
                    setFilters({ ...filters, from: e.target.value })
                  }
                  className="h-10 mt-2 bg-white text-black dark:bg-slate-800 dark:text-white dark:border-slate-600"
                />
              </div>

              <div>
                <Label className="font-semibold">To Date</Label>
                <Input
                  type="date"
                  value={filters.to}
                  onChange={(e) =>
                    setFilters({ ...filters, to: e.target.value })
                  }
                  className="h-10 mt-2 bg-white text-black dark:bg-slate-800 dark:text-white dark:border-slate-600"
                />
              </div>

              <div>
                <Label className="font-semibold">Category</Label>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                  className="w-full p-2 h-10 border-2 rounded-lg mt-2 bg-white text-black dark:bg-slate-800 dark:text-white dark:border-slate-600 transition"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="font-semibold">Amount Range</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.min}
                    onChange={(e) =>
                      setFilters({ ...filters, min: e.target.value })
                    }
                    className="h-10 bg-white text-black dark:bg-slate-800 dark:text-white dark:border-slate-600"
                  />

                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.max}
                    onChange={(e) =>
                      setFilters({ ...filters, max: e.target.value })
                    }
                    className="h-10 bg-white text-black dark:bg-slate-800 dark:text-white dark:border-slate-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={resetFilters} variant="outline">
                ↻ Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            📋 {expenses.length} Expense{expenses.length !== 1 ? 's' : ''}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenses.length > 0 ? (
              expenses.map((e) => (
                <Card
                  key={e.id}
                  className="hover:shadow-lg transition-all hover:scale-105 duration-300 border-l-4 border-red-400"
                >
                  <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted">
                          📅{' '}
                          {new Date(e.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-lg font-bold mt-1">
                          {e.category?.name || '❓ No Category'}
                        </p>
                      </div>

                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(e.amount)}
                      </p>
                    </div>

                    {e.description && (
                      <p className="text-sm text-muted bg-surface p-2 rounded line-clamp-2">
                        {e.description}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Link href={`/expenses/${e.id}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          👁️ View
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteExpense(e.id)}
                        className="flex-1"
                      >
                        🗑️ Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-3xl mb-3">📭</p>
                <p className="text-lg text-muted font-semibold">
                  No expenses found
                </p>
                <p className="text-sm text-muted mt-1">
                  Try adjusting your filters or add a new expense
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}