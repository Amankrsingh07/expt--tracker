'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function Money({ amount }) {
  return <span>${Number(amount).toFixed(2)}</span>;
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

  if (loading) return <Layout>Loading...</Layout>;
  if (!expense) return <Layout>Not found</Layout>;

  return (
    <Layout>
      <div className="flex justify-center mt-10">
        <Card className="w-full max-w-md shadow-lg">
          
          <CardHeader>
            <CardTitle className="text-xl">Expense Detail</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <p><strong>Date:</strong> {new Date(expense.date).toLocaleString()}</p>
            <p><strong>Category:</strong> {expense.category?.name}</p>
            <p><strong>Amount:</strong> <Money amount={expense.amount} /></p>
            <p><strong>Description:</strong> {expense.description || '-'}</p>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>

              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </CardContent>

        </Card>
      </div>
    </Layout>
  );
}