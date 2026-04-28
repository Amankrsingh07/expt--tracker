 'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ExpenseForm({ onSuccess }) {
  const [form, setForm] = useState({
    amount: '',
    category: '',
    newCategory: '',
    type: 'expense',
    date: new Date().toISOString().slice(0,10)
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [budgetWarning, setBudgetWarning] = useState(null);
  const [categoryBudgetInfo, setCategoryBudgetInfo] = useState(null);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setBudgetWarning(null); // Clear warning on change
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories', { credentials: 'include' });
        if (res.ok) {
          const j = await res.json();
          setCategories(j.categories || []);
        }
      } catch (e) {
        setCategories([]);
      }
    })();
  }, []);

  // Check category budget when amount or category changes
  const checkCategoryBudget = async (amount, categoryId) => {
    if (!amount || !categoryId || form.type === 'income') {
      setCategoryBudgetInfo(null);
      setBudgetWarning(null);
      return;
    }

    try {
      const month = (form.date || new Date().toISOString()).slice(0, 7);
      
      // Fetch category budgets
      const budgetRes = await fetch('/api/category-budget', {
        credentials: 'include'
      });
      
      if (!budgetRes.ok) return;
      
      const budgetData = await budgetRes.json();
      const categoryBudgets = budgetData.budgets || [];
      
      // Find budget for this category
      const categoryBudget = categoryBudgets.find(b => b.categoryId === categoryId);
      if (!categoryBudget) {
        setCategoryBudgetInfo(null);
        setBudgetWarning(null);
        return;
      }

      // Fetch expenses for this category this month
      const expenseRes = await fetch(`/api/expenses?month=${month}`, {
        credentials: 'include'
      });
      
      if (!expenseRes.ok) return;
      
      const expenseData = await expenseRes.json();
      const expenses = expenseData.expenses || [];
      
      const categoryName = categories.find(c => c.id === categoryId)?.name;
      const spent = expenses
        .filter(e => e.categoryId === categoryId)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const newSpent = spent + Number(amount);
      const budget = categoryBudget.monthlyBudget;
      const remaining = budget - spent;
      const isExceeded = newSpent > budget;

      const info = {
        budget,
        spent,
        remaining,
        newSpent,
        isExceeded,
        categoryName
      };

      setCategoryBudgetInfo(info);

      if (isExceeded) {
        setBudgetWarning({
          type: 'error',
          message: `❌ BUDGET EXCEEDED: Adding ₹${amount} will exceed ${categoryName} budget (limit: ₹${budget}, spent: ₹${spent.toFixed(2)}). You'll overspend by ₹${(newSpent - budget).toFixed(2)}.`
        });
      } else if (remaining < 0.01) {
        setBudgetWarning({
          type: 'error',
          message: `❌ BUDGET LIMIT REACHED: No remaining budget for ${categoryName} this month.`
        });
      } else if (newSpent > budget * 0.8) {
        setBudgetWarning({
          type: 'warning',
          message: `⚠️ WARNING: You're approaching ${categoryName} budget limit. ${remaining > 0 ? `Only ₹${remaining.toFixed(2)} remaining.` : 'Budget already exceeded!'}`
        });
      }
    } catch (err) {
      console.error('Error checking budget:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // prepare payload expected by our API
      const payload = {
        amount: Number(form.amount),
        description: '',
        date: form.date || new Date().toISOString(),
      };

      // if categories available and user selected one by id, send categoryId
      if (form.category && !isNaN(Number(form.category))) {
        payload.categoryId = Number(form.category);
      } else if (form.category === '__new' && form.newCategory) {
        // create new category
        try {
          const cRes = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name: form.newCategory })
          });
          if (cRes.ok) {
            const cj = await cRes.json();
            payload.categoryId = cj.category.id;
          }
        } catch (e) {
          // ignore category creation error
        }
      } else if (form.category) {
        // try to find matching category by name (fallback)
        const match = categories.find(c => c.name.toLowerCase() === form.category.toLowerCase());
        if (match) payload.categoryId = match.id;
      }

      // --- Budget pre-check: Check if category budget will be exceeded ---
      if (form.type === 'expense' && payload.categoryId && categoryBudgetInfo?.isExceeded) {
        const confirmText = `🚨 BUDGET EXCEEDED!\n\nThis expense will exceed the budget:\n- Category: ${categoryBudgetInfo.categoryName}\n- Budget: ₹${categoryBudgetInfo.budget}\n- Already Spent: ₹${categoryBudgetInfo.spent.toFixed(2)}\n- Will Exceed By: ₹${(categoryBudgetInfo.newSpent - categoryBudgetInfo.budget).toFixed(2)}\n\nYou cannot add this expense. Please reduce the amount.`;
        alert(confirmText);
        setLoading(false);
        return;
      }

      // Check remaining monthly budget
      try {
        const month = (form.date || new Date().toISOString()).slice(0, 7);
        const sRes = await fetch(`/api/dashboard/summary?month=${month}`, {
          credentials: 'include'
        });

        if (sRes.ok) {
          const summary = await sRes.json();
          const monthlyLimit = summary?.budget?.monthlyLimit || 0;
          const spent = summary?.budget?.spent || 0;
          const newSpent = spent + Number(payload.amount || 0);

          if (monthlyLimit > 0 && newSpent > monthlyLimit) {
            const remaining = monthlyLimit - spent;
            const proceed = window.confirm(
              `⚠️ Monthly Budget Warning:\nYou'll exceed monthly limit by ₹${(newSpent - monthlyLimit).toFixed(2)}.\nRemaining: ₹${remaining.toFixed(2)}\n\nContinue anyway?`
            );
            if (!proceed) {
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error('Budget pre-check failed:', err);
      }

      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        alert('✅ Expense Added Successfully!');
        setForm({
          amount: '',
          category: '',
          newCategory: '',
          type: 'expense',
          date: new Date().toISOString().slice(0, 10)
        });
        setBudgetWarning(null);
        setCategoryBudgetInfo(null);
        onSuccess(); // redirect
      } else {
        alert(data.message || 'Error adding expense');
      }

    } catch (error) {
      console.error(error);
      alert('Server error');
    }

    setLoading(false);
  };

  return (
  <div className="max-w-xl mx-auto">

    <div className="card space-y-6">

      {/* 🔝 Title */}
      <div>
        <h2 className="text-xl font-semibold">Add Transaction</h2>
        <p className="text-sm text-muted">Track your income or expenses easily</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* 💰 Amount */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Amount</label>
          <input
            type="number"
            name="amount"
            placeholder="₹ 0.00"
            value={form.amount}
            onChange={(e) => {
              handleChange(e);
              // Check budget when amount changes
              if (form.category && !isNaN(Number(form.category)) && form.type === 'expense') {
                checkCategoryBudget(Number(e.target.value), Number(form.category));
              }
            }}
            className="input"
            required
          />
        </div>

        {/* 📂 Category */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Category</label>

          {categories.length > 0 ? (
            <>
              <select
                name="category"
                value={form.category}
                onChange={(e) => {
                  handleChange(e);
                  // Check budget when category changes
                  if (form.amount && form.type === 'expense' && !isNaN(Number(e.target.value))) {
                    checkCategoryBudget(Number(form.amount), Number(e.target.value));
                  } else {
                    setCategoryBudgetInfo(null);
                    setBudgetWarning(null);
                  }
                }}
                className="input"
                required
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="__new">+ Create new</option>
              </select>

              {form.category === '__new' && (
                <input
                  type="text"
                  name="newCategory"
                  placeholder="New category name"
                  value={form.newCategory}
                  onChange={handleChange}
                  className="input mt-2"
                  required
                />
              )}
            </>
          ) : (
            <input
              type="text"
              name="category"
              placeholder="Food, Travel..."
              value={form.category}
              onChange={handleChange}
              className="input"
              required
            />
          )}
        </div>

        {/* 🔁 Type */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Type</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setForm(f => ({ ...f, type: 'expense' }));
                setBudgetWarning(null);
                // Recheck budget if changing to expense
                if (form.amount && form.category && !isNaN(Number(form.category))) {
                  checkCategoryBudget(Number(form.amount), Number(form.category));
                }
              }}
              className={`flex-1 py-2 rounded-xl border ${
                form.type === 'expense'
                  ? 'bg-red-100 text-red-600 border-red-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Expense
            </button>

            {/* <button
              type="button"
              onClick={() => {
                setForm(f => ({ ...f, type: 'income' }));
                setBudgetWarning(null);
                setCategoryBudgetInfo(null);
              }}
              className={`flex-1 py-2 rounded-xl border ${
                form.type === 'income'
                  ? 'bg-green-100 text-green-600 border-green-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Income
            </button> */}
          </div>
        </div>

        {/* 📅 Date */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        {/* 📊 Category Budget Info */}
        {categoryBudgetInfo && form.type === 'expense' && (
          <div className={`p-3 rounded-lg border ${
            categoryBudgetInfo.isExceeded 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' 
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
          }`}>
            <p className="text-sm font-semibold mb-2">
              {categoryBudgetInfo.categoryName} Budget Info:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Budget: <span className="font-bold">₹{categoryBudgetInfo.budget}</span></div>
              <div>Spent: <span className="font-bold">₹{categoryBudgetInfo.spent.toFixed(2)}</span></div>
              <div>Remaining: <span className="font-bold">₹{categoryBudgetInfo.remaining.toFixed(2)}</span></div>
              <div>After This: <span className="font-bold">₹{categoryBudgetInfo.newSpent.toFixed(2)}</span></div>
            </div>
          </div>
        )}

        {/* ⚠️ Budget Warning */}
        {budgetWarning && (
          <div className={`p-3 rounded-lg border font-semibold text-sm ${
            budgetWarning.type === 'error'
              ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
              : 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300'
          }`}>
            {budgetWarning.message}
          </div>
        )}

        {/* 🚀 Submit */}
        <button
          type="submit"
          disabled={loading || (form.type === 'expense' && budgetWarning?.type === 'error')}
          className={`w-full btn btn-primary ${(form.type === 'expense' && budgetWarning?.type === 'error') ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>
        {form.type === 'expense' && budgetWarning?.type === 'error' && (
          <p className="text-xs text-red-600 dark:text-red-400 text-center">
            ❌ Cannot submit: Budget limit exceeded for this category
          </p>
        )}

      </form>

    </div>

  </div>
);
}