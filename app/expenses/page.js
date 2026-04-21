'use client';
import Layout from '@/components/Layout';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function Money({ amount }) {
  return <span>₹{Number(amount).toFixed(2)}</span>;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({ from: '', to: '', category: '', min: '', max: '', search: '' });

  useEffect(() => {
    load();
    loadCats();
  }, []);

  async function loadCats() {
    try {
      const res = await fetch('/api/categories', { credentials: 'include' });
      if (res.ok) {
        const j = await res.json();
        setCategories(j.categories || []);
      }
    } catch (e) {
      setCategories([]);
    }
  }

  async function load() {
    const res = await fetch('/api/expenses', { credentials: 'include' });
    const json = await res.json();
    setExpenses(json.expenses || []);
  }

  // compatibility: fetchExpenses alias used by some UI snippets
  async function fetchExpenses() {
    await load();
  }

  async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;

    const res = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (res.ok) load();
  }

  // apply search + filters
  const filtered = expenses.filter(e => {
    // search filters.search
    if (filters.search) {
      const hay = ((e.description || '') + ' ' + (e.category?.name || '')).toLowerCase();
      if (!hay.includes(String(filters.search).toLowerCase())) return false;
    }

    // date range
    if (filters.from) {
      const fromD = new Date(filters.from);
      if (new Date(e.date) < fromD) return false;
    }
    if (filters.to) {
      const toD = new Date(filters.to);
      // include entire day of `to`
      toD.setHours(23,59,59,999);
      if (new Date(e.date) > toD) return false;
    }

    // category
    if (filters.category) {
      if ((e.category?.name || '') !== filters.category) return false;
    }

    // min/max amount
    if (filters.min) {
      if (Number(e.amount) < Number(filters.min)) return false;
    }
    if (filters.max) {
      if (Number(e.amount) > Number(filters.max)) return false;
    }

    return true;
  });

  async function applyFilters() {
  // Build query from filters and search, excluding empty values
    const params = new URLSearchParams();
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.category) params.set('category', filters.category);
    if (filters.min) params.set('min', String(filters.min));
    if (filters.max) params.set('max', String(filters.max));
  if (filters.search) params.append('search', filters.search);

    try {
      const res = await fetch('/api/expenses?' + params.toString(), { credentials: 'include' });
      if (!res.ok) {
        console.error('Failed to fetch filtered expenses', res.status);
        return;
      }
      const json = await res.json();
      // API returns { expenses: [...] }
      setExpenses(json.expenses || []);
    } catch (e) {
      console.error('applyFilters error', e);
    }
  }

  function resetFilters() {
    // reset to default filter values and reload
    setFilters({ from: '', to: '', category: '', min: '', max: '', search: '' });
    fetchExpenses(); // reload all data
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <div>
          <Button asChild>
            <a href="/add-expense">+ Add Expense</a>
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Search description or category</Label>
              <Input value={filters.search || ''} onChange={e=>setFilters({...filters, search: e.target.value})} placeholder="Search..." />
            </div>
            <div className="flex items-end">
              <Button onClick={applyFilters}>Refresh</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label>From</Label>
              <Input type="date" value={filters.from || ''} onChange={e=>setFilters({...filters, from: e.target.value})} />
            </div>

            <div>
              <Label>To</Label>
              <Input type="date" value={filters.to || ''} onChange={e=>setFilters({...filters, to: e.target.value})} />
            </div>

            <div>
              <Label>Category</Label>
              <select value={filters.category || ''} onChange={e=>setFilters({...filters, category: e.target.value})} className="p-2 border rounded">
                <option value="">All</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <Label>Min Amount</Label>
              <Input type="number" placeholder="Min" value={filters.min || ''} onChange={e=>setFilters({...filters, min: e.target.value})} />
            </div>

            <div>
              <Label>Max Amount</Label>
              <Input type="number" placeholder="Max" value={filters.max || ''} onChange={e=>setFilters({...filters, max: e.target.value})} />
            </div>

            <div className="flex gap-2">
              <Button onClick={applyFilters}>Apply</Button>
              <Button variant="outline" onClick={resetFilters}>Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(e => (
              <Card key={e.id} className="max-w-md">
                <CardContent className="p-4 space-y-2">
                  <p><strong>Date:</strong> {new Date(e.date).toLocaleDateString()}</p>
                  <p><strong>Category:</strong> {e.category?.name || '—'}</p>
                  <p><strong>Amount:</strong> <Money amount={e.amount} /></p>
                  {e.description ? <p className="text-sm text-muted-foreground">{e.description}</p> : null}
                  <div className="flex gap-2 mt-2">
                    <Link href={`/expenses/${e.id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                    <Button size="sm" variant="destructive" onClick={() => deleteExpense(e.id)}>Delete</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}