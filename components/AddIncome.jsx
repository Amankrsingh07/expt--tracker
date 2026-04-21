'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AddIncome({ onSuccess }) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [customSource, setCustomSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const finalSource = source === 'Other' ? customSource : source;

    try {
      const res = await fetch('/api/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: Number(amount),
          source: finalSource || 'Other',
          date: date || new Date().toISOString()
        })
      });

      const j = await res.json();

      if (res.ok) {
        alert('Income Added Successfully ✅');
        if (onSuccess) onSuccess();
      } else {
        alert(j.error || 'Error adding income');
      }

    } catch (err) {
      console.error(err);
      alert('Server error');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <input
        type="number"
        placeholder="Enter Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <select
        value={source}
        onChange={(e) => setSource(e.target.value)}
        className="w-full p-2 border rounded"
        required
      >
        <option value="">Select Source</option>
        <option value="Salary">Salary</option>
        <option value="Freelance">Freelance</option>
        <option value="Business">Business</option>
        <option value="Other">Other</option>
      </select>

      {source === 'Other' && (
        <input
          type="text"
          placeholder="Custom source"
          value={customSource}
          onChange={(e) => setCustomSource(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      )}

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <Button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Income'}
      </Button>

    </form>
  );
}
