"use client";

import Layout from "@/components/Layout";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value || 0));
}

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function SummaryBar({ income = 0, expense = 0 }) {
  const total = Math.max(income + expense, 1);
  const incomePct = (income / total) * 100;
  const expensePct = (expense / total) * 100;

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden h-4 shadow-sm">
      <div
        className="h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full"
        style={{ width: `${Math.max(0, incomePct)}%` }}
      />
      <div
        className="h-4 bg-gradient-to-r from-red-400 to-red-500 rounded-full"
        style={{
          width: `${Math.max(0, expensePct)}%`,
          marginLeft: `-${expensePct}%`,
        }}
      />
    </div>
  );
}

export default function ExpensesPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    categoryId: "all",
    min: "",
    max: "",
    search: "",
  });

  useEffect(() => {
    loadAllData();
  }, [month]);

  async function loadAllData() {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("month", month);

      if (filters.search) params.set("search", filters.search);
      if (filters.from) params.set("fromDate", filters.from);
      if (filters.to) params.set("toDate", filters.to);
      if (filters.categoryId && filters.categoryId !== "all") {
        params.set("categoryId", filters.categoryId);
      }
      if (filters.min) params.set("min", filters.min);
      if (filters.max) params.set("max", filters.max);

      const [expenseRes, incomeRes, categoryRes] = await Promise.all([
        fetch(`/api/expenses?${params.toString()}`, {
          credentials: "include",
        }),
        fetch(`/api/incomes?month=${month}`, {
          credentials: "include",
        }),
        fetch("/api/categories", {
          credentials: "include",
        }),
      ]);

      const expenseJson = await expenseRes.json();
      const incomeJson = await incomeRes.json();
      const categoryJson = await categoryRes.json();

      setExpenses(expenseJson.expenses || []);
      setIncomes(incomeJson.incomes || []);
      setCategories(categoryJson.categories || []);
    } catch (error) {
      console.error("Expense page load error:", error);
      setExpenses([]);
      setIncomes([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteExpense(id) {
    if (!confirm("Delete this expense?")) return;

    const res = await fetch(`/api/expenses/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      loadAllData();
    }
  }

  function resetFilters() {
    setFilters({
      from: "",
      to: "",
      categoryId: "all",
      min: "",
      max: "",
      search: "",
    });

    setTimeout(() => {
      loadAllData();
    }, 0);
  }

  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const totalIncome = useMemo(() => {
    return incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  }, [incomes]);

  const remaining = totalIncome - totalExpense;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              💳 Expenses
            </h1>
            <p className="text-muted mt-2">
              Track and manage expenses for selected month: {month}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border rounded-lg px-4 py-2 bg-white text-black dark:bg-slate-800 dark:text-white dark:border-slate-600"
            />

            <Button
              asChild
              className="h-12 px-6 text-base font-bold bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-lg"
            >
              <a href="/add-expense">➕ Add Expense</a>
            </Button>
          </div>
        </div>

        {/* Summary */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              📊 Summary
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
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
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-orange-600 dark:text-orange-400"
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
                    ? `${Math.round(
                        (totalExpense / totalIncome) * 100
                      )}% of income spent`
                    : "No income data for this month"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
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
                  value={filters.categoryId}
                  onChange={(e) =>
                    setFilters({ ...filters, categoryId: e.target.value })
                  }
                  className="w-full p-2 h-10 border-2 rounded-lg mt-2 bg-white text-black dark:bg-slate-800 dark:text-white dark:border-slate-600"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
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
              <Button
                onClick={loadAllData}
                className="px-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-lg"
              >
                ✓ Apply Filters
              </Button>

              <Button onClick={resetFilters} variant="outline">
                ↻ Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            📋 {expenses.length} Expense{expenses.length !== 1 ? "s" : ""}
          </h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              Loading expenses...
            </div>
          ) : (
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
                            📅{" "}
                            {new Date(e.date).toLocaleDateString("en-IN", {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-lg font-bold mt-1">
                            {e.category?.name || "❓ No Category"}
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
                    No expenses found for {month}
                  </p>
                  <p className="text-sm text-muted mt-1">
                    Try another month or add a new expense.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}