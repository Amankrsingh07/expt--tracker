"use client";

import Layout from "@/components/Layout";
import DashboardCharts from "@/components/DashboardCharts";
import FinancialDashboard from "@/components/FinancialDashboard";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ✅ Dashboard always shows latest/current month
  const month = getCurrentMonth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);

    try {
      const userRes = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!userRes.ok) {
        router.push("/login");
        return;
      }

      const userData = await userRes.json();
      setUser(userData.user);

      const [expenseRes, budgetRes, incomeRes] = await Promise.all([
        fetch(`/api/expenses?month=${month}`, { credentials: "include" }),
        fetch(`/api/category-budget?month=${month}`, {
          credentials: "include",
        }),
        fetch(`/api/incomes?month=${month}`, { credentials: "include" }),
      ]);

      if (expenseRes.ok) {
        const data = await expenseRes.json();
        setExpenses(
          Array.isArray(data) ? data : data.expenses || data.data || []
        );
      } else {
        setExpenses([]);
      }

      if (budgetRes.ok) {
        const data = await budgetRes.json();
        setBudgets(Array.isArray(data) ? data : data.budgets || data.data || []);
      } else {
        setBudgets([]);
      }

      if (incomeRes.ok) {
        const data = await incomeRes.json();
        setIncomes(Array.isArray(data) ? data : data.incomes || data.data || []);
      } else {
        setIncomes([]);
      }
    } catch (error) {
      console.error("Dashboard Error:", error);
      setExpenses([]);
      setBudgets([]);
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  }

  const summary = useMemo(() => {
    const totalExpense = expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    const totalBudget = budgets.reduce(
      (sum, b) => sum + Number(b.amount || 0),
      0
    );

    const totalIncome = incomes.reduce(
      (sum, i) => sum + Number(i.amount || 0),
      0
    );

    const remainingBudget = totalBudget - totalExpense;
    const savings = totalIncome - totalExpense;

    const budgetUsed =
      totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0;

    const categorySpend = {};

    expenses.forEach((e) => {
      const category =
        e.category?.name || e.categoryName || e.category || "Other";

      categorySpend[category] =
        (categorySpend[category] || 0) + Number(e.amount || 0);
    });

    const categoryRows = budgets.map((b) => {
      const spent = categorySpend[b.category] || 0;
      const limit = Number(b.amount || 0);
      const remaining = limit - spent;
      const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;

      return {
        category: b.category,
        limit,
        spent,
        remaining,
        percent,
        exceeded: spent > limit,
      };
    });

    return {
      totalExpense,
      totalBudget,
      totalIncome,
      remainingBudget,
      savings,
      budgetUsed,
      categoryRows,
    };
  }, [expenses, budgets, incomes]);

  function downloadJSON() {
    const data = {
      month,
      user,
      summary,
      incomes,
      budgets,
      expenses,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    downloadFile(blob, `dashboard-latest-${month}.json`);
  }

  function downloadCSV() {
    const rows = [["Type", "Category/Source", "Amount", "Date", "Description"]];

    incomes.forEach((i) => {
      rows.push([
        "Income",
        i.source || "Other",
        i.amount || 0,
        i.date || i.createdAt || "",
        "",
      ]);
    });

    expenses.forEach((e) => {
      rows.push([
        "Expense",
        e.category?.name || e.categoryName || e.category || "Other",
        e.amount || 0,
        e.date || "",
        e.description || "",
      ]);
    });

    budgets.forEach((b) => {
      rows.push([
        "Budget",
        b.category || "Other",
        b.amount || 0,
        b.month || month,
        "Category Budget",
      ]);
    });

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    downloadFile(blob, `dashboard-latest-${month}.csv`);
  }

  function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

  function printReport() {
    window.print();
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-16 text-lg">Loading dashboard...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 print:bg-white">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white p-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Welcome back, {user?.name || "User"} 👋
              </h1>
              <p className="mt-2 text-white/90">
                Latest dashboard data for current month: {month}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchDashboardData}
                className="px-4 py-2 bg-white text-indigo-700 rounded-lg font-semibold"
              >
                🔄 Refresh
              </button>

              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-white text-indigo-700 rounded-lg font-semibold"
              >
                ⬇ CSV
              </button>

              <button
                onClick={downloadJSON}
                className="px-4 py-2 bg-white text-indigo-700 rounded-lg font-semibold"
              >
                ⬇ JSON
              </button>

              <button
                onClick={printReport}
                className="px-4 py-2 bg-white text-indigo-700 rounded-lg font-semibold"
              >
                🖨 PDF
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
          <StatCard title="Income" value={summary.totalIncome} icon="💰" color="green" />
          <StatCard title="Expenses" value={summary.totalExpense} icon="💳" color="red" />
          <StatCard title="Budget" value={summary.totalBudget} icon="📊" color="blue" />
          <StatCard
            title="Remaining"
            value={summary.remainingBudget}
            icon="✅"
            color={summary.remainingBudget < 0 ? "red" : "purple"}
          />
          <StatCard
            title="Savings"
            value={summary.savings}
            icon="🎯"
            color={summary.savings < 0 ? "red" : "green"}
          />
        </div>

        <div className="bg-surface rounded-2xl shadow-lg p-6">
          <div className="flex justify-between mb-3">
            <h2 className="text-xl font-bold">Monthly Budget Usage</h2>
            <span
              className={`font-bold ${
                summary.budgetUsed > 100
                  ? "text-red-600"
                  : summary.budgetUsed > 80
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              {summary.budgetUsed}%
            </span>
          </div>

          <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                summary.budgetUsed > 100
                  ? "bg-red-600"
                  : summary.budgetUsed > 80
                  ? "bg-yellow-500"
                  : "bg-green-600"
              }`}
              style={{ width: `${Math.min(summary.budgetUsed, 100)}%` }}
            />
          </div>

          {summary.budgetUsed > 100 && (
            <div className="mt-4 bg-red-100 text-red-700 border border-red-300 p-4 rounded-xl font-semibold">
              🚨 You used your monthly budget limit.
            </div>
          )}
        </div>

        <div className="flex bg-surface border rounded-xl p-1 w-fit">
          <button
            onClick={() => setShowAdvanced(false)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold ${
              !showAdvanced ? "bg-indigo-600 text-white" : "text-muted"
            }`}
          >
            Simple
          </button>

          <button
            onClick={() => setShowAdvanced(true)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold ${
              showAdvanced ? "bg-indigo-600 text-white" : "text-muted"
            }`}
          >
            Advanced
          </button>
        </div>

        <div className="bg-surface rounded-2xl shadow-lg p-6">
          {!showAdvanced ? (
            <>
              <h2 className="text-xl font-bold mb-5">Expense Overview</h2>
              <DashboardCharts
                expenses={expenses}
                incomes={incomes}
                budgets={budgets}
              />
            </>
          ) : (
            <FinancialDashboard />
          )}
        </div>

        <div className="bg-surface rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-5">Category Budget Status</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-right">Limit</th>
                  <th className="p-3 text-right">Spent</th>
                  <th className="p-3 text-right">Remaining</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {summary.categoryRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-gray-500">
                      No category budgets set for current month.
                    </td>
                  </tr>
                ) : (
                  summary.categoryRows.map((row) => (
                    <tr key={row.category} className="border-b">
                      <td className="p-3 font-semibold">{row.category}</td>
                      <td className="p-3 text-right text-blue-600 font-bold">
                        ₹{row.limit.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-red-600 font-bold">
                        ₹{row.spent.toFixed(2)}
                      </td>
                      <td
                        className={`p-3 text-right font-bold ${
                          row.remaining < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        ₹{row.remaining.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            row.exceeded
                              ? "bg-red-100 text-red-700"
                              : row.percent > 80
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {row.exceeded ? "Exceeded" : `${row.percent}% used`}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-5">Recent Expenses</h2>

          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-gray-500">No current month expenses found.</p>
            ) : (
              expenses.slice(0, 8).map((expense) => (
                <div
                  key={expense.id}
                  className="flex justify-between items-center border rounded-xl p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {expense.description || "No description"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {expense.category?.name ||
                        expense.categoryName ||
                        expense.category ||
                        "Other"}{" "}
                      • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="font-bold text-red-600">
                    ₹{Number(expense.amount || 0).toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    green: "bg-green-50 text-green-700 border-green-400",
    red: "bg-red-50 text-red-700 border-red-400",
    blue: "bg-blue-50 text-blue-700 border-blue-400",
    purple: "bg-purple-50 text-purple-700 border-purple-400",
  };

  return (
    <div className={`rounded-2xl border-l-4 p-5 shadow ${colors[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-2xl font-bold mt-2">
            ₹{Number(value || 0).toFixed(2)}
          </p>
        </div>

        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}