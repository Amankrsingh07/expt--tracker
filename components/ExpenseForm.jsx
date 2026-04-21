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
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Amount */}
      <input
        type="number"
        name="amount"
        placeholder="Enter Amount"
        value={form.amount}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      {/* Category */}
      {categories.length > 0 ? (
        <>
          <select name="category" value={form.category} onChange={handleChange} className="w-full p-2 border rounded" required>
            <option value="">Select category</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value="__new">+ Create new category</option>
          </select>
          {form.category === '__new' && (
            <input
              type="text"
              name="newCategory"
              placeholder="New category name"
              value={form.newCategory}
              onChange={handleChange}
              className="w-full p-2 border rounded mt-2"
              required
            />
          )}
        </>
      ) : (
        <input
          type="text"
          name="category"
          placeholder="Category (Food, Travel, etc)"
          value={form.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      )}

      {/* Type */}
      <select
        name="type"
        value={form.type}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      >
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      {/* Date */}
      <input
        type="date"
        name="date"
        value={form.date}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />

      {/* Button */}
      <Button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Expense'}
      </Button>

    </form>
  );
}