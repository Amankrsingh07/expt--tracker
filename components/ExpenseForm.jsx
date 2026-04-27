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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
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

      // --- Budget pre-check: fetch current monthly summary and warn if this expense will cross limits ---
      try {
        const month = (form.date || new Date().toISOString()).slice(0,7); // YYYY-MM
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
              `Warning: adding this expense (₹${payload.amount}) will exceed your monthly budget. Remaining before this: ₹${remaining}. Do you want to continue?`
            );
            if (!proceed) {
              setLoading(false);
              return;
            }
          }

          // category-level check (if categoryId present)
          if (payload.categoryId) {
            const catBudgets = summary?.budget?.categoryBudgets || {};
            // categoryBudgets is keyed by category name; search for matching categoryId
            const match = Object.values(catBudgets).find(cb => cb.categoryId === payload.categoryId);
            if (match) {
              const catAllocated = match.allocated || 0;
              const catSpent = match.spent || 0;
              const newCatSpent = catSpent + Number(payload.amount || 0);
              if (catAllocated > 0 && newCatSpent > catAllocated) {
                const proceed = window.confirm(
                  `Warning: this will exceed the budget for this category (allocated: ₹${catAllocated}, remaining: ₹${Math.max(0, catAllocated - catSpent)}). Continue?`
                );
                if (!proceed) {
                  setLoading(false);
                  return;
                }
              }
            }
          }
        }
      } catch (err) {
        // If summary fetch fails, allow submission but log for debugging
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
        alert('Expense Added Successfully ✅');
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
            onChange={handleChange}
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
                onChange={handleChange}
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
              onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
              className={`flex-1 py-2 rounded-xl border ${
                form.type === 'expense'
                  ? 'bg-red-100 text-red-600 border-red-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Expense
            </button>

            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, type: 'income' }))}
              className={`flex-1 py-2 rounded-xl border ${
                form.type === 'income'
                  ? 'bg-green-100 text-green-600 border-green-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Income
            </button>
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

        {/* 🚀 Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary"
        >
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>

      </form>

    </div>

  </div>
);
}