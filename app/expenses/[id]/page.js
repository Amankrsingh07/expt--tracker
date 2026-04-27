'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function Money({ amount }) {
  return <span>₹{Number(amount).toFixed(2)}</span>;
}

export default function ExpenseDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/expenses/${id}`, {
          credentials: 'include'
        });

        const json = await res.json();

        if (!res.ok) {
          alert(json.error || 'Failed to load');
          return;
        }

        setExpense(json.expense);
      } catch (e) {
        console.error(e);
        alert('Error loading expense');
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this expense?')) return;

    const res = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    const json = await res.json();

    if (!res.ok) {
      alert(json.error || 'Delete failed');
      return;
    }

    router.push('/expenses');
  }

  /* 🔄 Loading UI */
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center mt-20">
          <div className="animate-pulse text-gray-500">
            Loading expense...
          </div>
        </div>
      </Layout>
    );
  }

  /* ❌ Not found UI */
  if (!expense) {
    return (
      <Layout>
        <div className="flex justify-center mt-20 text-gray-500">
          Expense not found
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-center mt-12 px-4">

        <Card className="w-full max-w-lg rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300">

          {/* 🔝 Header */}
          <CardHeader>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Expense Detail
            </CardTitle>
          </CardHeader>

          {/* 📄 Content */}
          <CardContent className="space-y-5">

            {/* Info rows */}
            <div className="space-y-3 text-sm">

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Date</span>
                <span className="font-medium">
                  {new Date(expense.date).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Category</span>
                <span className="font-medium">
                  {expense.category?.name || '-'}
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-indigo-600">
                  <Money amount={expense.amount} />
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Description</span>
                <span className="font-medium text-right max-w-[60%]">
                  {expense.description || '-'}
                </span>
              </div>

            </div>

            {/* 🔘 Actions */}
            <div className="flex justify-between pt-6">

              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => router.back()}
              >
                ← Back
              </Button>

              <Button
                variant="destructive"
                className="rounded-xl"
                onClick={handleDelete}
              >
                Delete
              </Button>

            </div>

          </CardContent>

        </Card>

      </div>
    </Layout>
  );
}