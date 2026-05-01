"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function ExpenseForm({ onSuccess }) {
  const toast = useToast();

  const [form, setForm] = useState({
    amount: "",
    category: "",
    newCategory: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [budgetWarning, setBudgetWarning] = useState(null);
  const [categoryBudgetInfo, setCategoryBudgetInfo] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const res = await fetch("/api/categories", {
        credentials: "include",
      });

      if (!res.ok) {
        setCategories([]);
        return;
      }

      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setCategories([]);
    }
  }

  function handleChange(e) {
    const updatedForm = {
      ...form,
      [e.target.name]: e.target.value,
    };

    setForm(updatedForm);
    setBudgetWarning(null);

    if (
      updatedForm.amount &&
      updatedForm.category &&
      !isNaN(Number(updatedForm.category))
    ) {
      checkCategoryBudget(
        Number(updatedForm.amount),
        Number(updatedForm.category),
        updatedForm.date
      );
    }
  }

  async function checkCategoryBudget(amount, categoryId, selectedDate) {
    if (!amount || !categoryId || !selectedDate) {
      setCategoryBudgetInfo(null);
      setBudgetWarning(null);
      return;
    }

    try {
      const month = selectedDate.slice(0, 7);

      const categoryName =
        categories.find((c) => Number(c.id) === Number(categoryId))?.name ||
        "";

      if (!categoryName) {
        setCategoryBudgetInfo(null);
        setBudgetWarning(null);
        return;
      }

      const budgetRes = await fetch(`/api/category-budget?month=${month}`, {
        credentials: "include",
      });

      if (!budgetRes.ok) return;

      const budgetData = await budgetRes.json();
      const categoryBudgets = budgetData.budgets || [];

      // ✅ Your Budget schema uses category string, not categoryId
      const categoryBudget = categoryBudgets.find(
        (b) => b.category === categoryName && b.month === month
      );

      if (!categoryBudget) {
        setCategoryBudgetInfo(null);
        setBudgetWarning(null);
        return;
      }

      const expenseRes = await fetch(`/api/expenses?month=${month}`, {
        credentials: "include",
      });

      if (!expenseRes.ok) return;

      const expenseData = await expenseRes.json();
      const expenses = expenseData.expenses || [];

      const spent = expenses
        .filter((e) => Number(e.categoryId) === Number(categoryId))
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const budget = Number(categoryBudget.amount || 0);
      const newSpent = spent + Number(amount);
      const remaining = budget - spent;
      const isExceeded = newSpent > budget;

      const info = {
        budget,
        spent,
        remaining,
        newSpent,
        isExceeded,
        categoryName,
      };

      setCategoryBudgetInfo(info);

      if (isExceeded) {
        setBudgetWarning({
          type: "error",
          message: `❌ Budget limit exceeded for ${categoryName}.`,
        });
      } else if (newSpent > budget * 0.8) {
        setBudgetWarning({
          type: "warning",
          message: `⚠️ You are near your ${categoryName} budget limit. Remaining ₹${remaining.toFixed(
            2
          )}`,
        });
      } else {
        setBudgetWarning(null);
      }
    } catch (err) {
      console.error("Error checking budget:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.amount || !form.category || !form.date) {
      toast.push({
        title: "Validation",
        message: "Please fill all fields",
        type: "error",
      });
      return;
    }

    if (budgetWarning?.type === "error") {
      toast.push({
        title: "Budget exceeded",
        message: "Cannot add expense because category budget exceeded.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        amount: Number(form.amount),
        description: "",
        date: form.date || new Date().toISOString().slice(0, 10),
      };

      if (form.category === "__new") {
        if (!form.newCategory.trim()) {
          toast.push({
            title: "Validation",
            message: "Please enter new category name",
            type: "error",
          });
          setLoading(false);
          return;
        }

        const cRes = await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: form.newCategory.trim(),
          }),
        });

        const cData = await cRes.json();

        if (!cRes.ok) {
          throw new Error(cData.error || "Category create failed");
        }

        payload.categoryId = cData.category.id;
      } else {
        payload.categoryId = Number(form.category);
      }

      if (!payload.categoryId || isNaN(Number(payload.categoryId))) {
        toast.push({
          title: "Invalid category",
          message: "Please select or create a valid category.",
          type: "error",
        });
        setLoading(false);
        return;
      }

      // ✅ Monthly budget pre-check using selected date/month
      try {
        const month = payload.date.slice(0, 7);

        const summaryRes = await fetch(`/api/dashboard/summary?month=${month}`, {
          credentials: "include",
        });

        if (summaryRes.ok) {
          const summary = await summaryRes.json();

          const monthlyLimit = Number(summary?.budget?.monthlyLimit || 0);
          const spent = Number(summary?.budget?.spent || 0);
          const newSpent = spent + Number(payload.amount || 0);

          if (monthlyLimit > 0 && newSpent > monthlyLimit) {
            const remaining = monthlyLimit - spent;

            const proceed = window.confirm(
              `⚠️ Monthly Budget Warning:\nYou will exceed monthly limit by ₹${(
                newSpent - monthlyLimit
              ).toFixed(2)}.\nRemaining: ₹${remaining.toFixed(
                2
              )}\n\nContinue anyway?`
            );

            if (!proceed) {
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Budget pre-check failed:", err);
      }

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Error adding expense");
      }

      toast.push({
        title: "Expense added",
        message: "Expense added successfully",
        type: "info",
      });

      try {
        const catName =
          categories.find((c) => Number(c.id) === Number(payload.categoryId))
            ?.name || "category";

        fetch("/api/notifications", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "Expense added",
            body: `₹${payload.amount} in ${catName}`,
          }),
        });
      } catch {}

      setForm({
        amount: "",
        category: "",
        newCategory: "",
        date: new Date().toISOString().slice(0, 10),
      });

      setBudgetWarning(null);
      setCategoryBudgetInfo(null);

      onSuccess?.();
    } catch (error) {
      console.error(error);

      toast.push({
        title: "Error",
        message: error.message || "Unexpected server error",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="card space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Add Expense</h2>
          <p className="text-sm text-muted">
            Track your expense month-wise
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              name="amount"
              placeholder="₹ 0.00"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Category</label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full p-2 h-10 rounded-lg bg-white text-black dark:bg-slate-800 dark:text-white border border-gray-300 dark:border-slate-600"
              required
            >
              <option value="">Select category</option>

              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}

              <option value="__new">+ Create new</option>
            </select>

            {form.category === "__new" && (
              <Input
                type="text"
                name="newCategory"
                placeholder="New category name"
                value={form.newCategory}
                onChange={handleChange}
                className="mt-2"
                required
              />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          {categoryBudgetInfo && (
            <div
              className={`p-3 rounded-lg border ${
                categoryBudgetInfo.isExceeded
                  ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                  : "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
              }`}
            >
              <p className="text-sm font-semibold mb-2">
                {categoryBudgetInfo.categoryName} Budget Info:
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  Budget:{" "}
                  <span className="font-bold">
                    ₹{categoryBudgetInfo.budget.toFixed(2)}
                  </span>
                </div>

                <div>
                  Spent:{" "}
                  <span className="font-bold">
                    ₹{categoryBudgetInfo.spent.toFixed(2)}
                  </span>
                </div>

                <div>
                  Remaining:{" "}
                  <span className="font-bold">
                    ₹{categoryBudgetInfo.remaining.toFixed(2)}
                  </span>
                </div>

                <div>
                  After This:{" "}
                  <span className="font-bold">
                    ₹{categoryBudgetInfo.newSpent.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {budgetWarning && (
            <div
              className={`p-3 rounded-lg border font-semibold text-sm ${
                budgetWarning.type === "error"
                  ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                  : "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300"
              }`}
            >
              {budgetWarning.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || budgetWarning?.type === "error"}
            className={`w-full btn btn-primary ${
              budgetWarning?.type === "error"
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {loading ? "Adding..." : "Add Expense"}
          </button>

          {budgetWarning?.type === "error" && (
            <p className="text-xs text-red-600 dark:text-red-400 text-center">
              ❌ Cannot submit: Budget limit exceeded for this category
            </p>
          )}
        </form>
      </div>
    </div>
  );
}