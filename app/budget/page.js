"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PREDEFINED_CATEGORIES = [
  { name: "Food", icon: "🍔" },
  { name: "Grocery", icon: "🛒" },
  { name: "Medical", icon: "🏥" },
  { name: "Travel", icon: "🚗" },
  { name: "Shopping", icon: "🛍️" },
  { name: "Entertainment", icon: "🎬" },
  { name: "Utilities", icon: "💡" },
  { name: "Other", icon: "📦" },
];

export default function BudgetManagementPage() {
  const [categoryBudgets, setCategoryBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchBudgetsAndExpenses();
  }, [month]);

  async function fetchBudgetsAndExpenses() {
    setLoading(true);

    try {
      const budgetRes = await fetch("/api/category-budget", {
        credentials: "include",
      });

      if (budgetRes.ok) {
        const budgetData = await budgetRes.json();
        setCategoryBudgets(budgetData.budgets || []);
      }

      const expenseRes = await fetch(`/api/expenses?month=${month}`, {
        credentials: "include",
      });

      if (expenseRes.ok) {
        const expenseData = await expenseRes.json();
        setExpenses(expenseData.expenses || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }

  function getSpentByCategory(categoryName) {
    return expenses
      .filter(
        (e) =>
          e.category?.name === categoryName ||
          e.category === categoryName ||
          e.categoryName === categoryName
      )
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }

  async function saveBudget(categoryName, amount) {
    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const res = await fetch("/api/category-budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          category: categoryName,
          monthlyBudget: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to save budget");
        return;
      }

      alert("Budget saved successfully!");
      setEditingId(null);
      setEditAmount("");
      fetchBudgetsAndExpenses();
    } catch (err) {
      console.error("Error saving budget:", err);
      alert("Server error");
    }
  }

  async function deleteBudget(categoryName) {
    if (!confirm("Delete this budget?")) return;

    try {
      const res = await fetch(
        `/api/category-budget/${encodeURIComponent(categoryName)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete budget");
        return;
      }

      alert("Budget deleted");
      fetchBudgetsAndExpenses();
    } catch (err) {
      console.error("Error deleting budget:", err);
      alert("Server error");
    }
  }

  const budgetMap = categoryBudgets.reduce((acc, b) => {
    acc[b.category] = Number(b.amount || 0);
    return acc;
  }, {});

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10 text-lg">Loading budgets...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            💰 Budget Management
          </h1>
          <p className="text-muted mt-2">
            Set category limits and track spending
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Label className="font-semibold">Select Month:</Label>
              <Input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="max-w-xs"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREDEFINED_CATEGORIES.map((cat) => {
            const spent = getSpentByCategory(cat.name);
            const budget = budgetMap[cat.name] || 0;
            const isExceeded = budget > 0 && spent > budget;
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;

            return (
              <Card
                key={cat.name}
                className={
                  isExceeded
                    ? "border-2 border-red-500 shadow-lg"
                    : "hover:shadow-lg"
                }
              >
                <CardHeader className={isExceeded ? "bg-red-50" : ""}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{cat.icon}</span>
                      <div>
                        <CardTitle className="text-xl">{cat.name}</CardTitle>
                        {budget > 0 && (
                          <p className="text-xs text-muted mt-1">
                            Budget: ₹{budget.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    {isExceeded && (
                      <div className="animate-pulse text-2xl">🚨</div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted font-semibold">
                      This Month Spent:
                    </span>
                    <span
                      className={`text-2xl font-bold ${
                        isExceeded ? "text-red-600" : "text-gray-800"
                      }`}
                    >
                      ₹{spent.toFixed(2)}
                    </span>
                  </div>

                  {budget > 0 ? (
                    <>
                      <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            isExceeded
                              ? "bg-red-600"
                              : percentage > 80
                              ? "bg-yellow-500"
                              : "bg-green-600"
                          }`}
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-muted">
                        <span>{Math.round(percentage)}% used</span>
                        <span>
                          ₹{Math.max(budget - spent, 0).toFixed(2)} remaining
                        </span>
                      </div>

                      {isExceeded && (
                        <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm font-semibold">
                          ❌ Budget exceeded by ₹
                          {(spent - budget).toFixed(2)}
                        </div>
                      )}

                      {percentage > 80 && percentage <= 100 && (
                        <div className="p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg text-sm font-semibold">
                          ⚠️ Approaching limit
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-3 bg-gray-100 text-gray-600 rounded-lg text-sm text-center italic">
                      No budget set for this category
                    </div>
                  )}

                  <div className="border-t pt-4">
                    {editingId === cat.name ? (
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">
                          Set Budget ₹
                        </Label>

                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Enter amount"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                          />

                          <Button
                            onClick={() => saveBudget(cat.name, editAmount)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            ✓
                          </Button>

                          <Button
                            onClick={() => {
                              setEditingId(null);
                              setEditAmount("");
                            }}
                            variant="outline"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setEditingId(cat.name);
                            setEditAmount(budget ? String(budget) : "");
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {budget > 0 ? "📝 Edit" : "➕ Set"}
                        </Button>

                        {budget > 0 && (
                          <Button
                            onClick={() => deleteBudget(cat.name)}
                            variant="destructive"
                          >
                            🗑️
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>📊 Summary</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted mb-1">Total Budget</p>
              <p className="text-2xl font-bold">
                ₹
                {Object.values(budgetMap)
                  .reduce((a, b) => a + b, 0)
                  .toFixed(2)}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted mb-1">Total Spent</p>
              <p className="text-2xl font-bold text-orange-600">
                ₹
                {expenses
                  .reduce((a, e) => a + Number(e.amount || 0), 0)
                  .toFixed(2)}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted mb-1">Categories Set</p>
              <p className="text-2xl font-bold text-blue-600">
                {Object.keys(budgetMap).length}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted mb-1">Over Budget</p>
              <p className="text-2xl font-bold text-red-600">
                {
                  Object.keys(budgetMap).filter(
                    (cat) =>
                      budgetMap[cat] > 0 &&
                      getSpentByCategory(cat) > budgetMap[cat]
                  ).length
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}