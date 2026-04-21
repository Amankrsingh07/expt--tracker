'use client';
import Layout from '@/components/Layout';
import ExpenseForm from '@/components/ExpenseForm';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AddExpensePage() {
  const router = useRouter();
  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Add Expense</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create a new expense</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm onSuccess={() => router.push('/expenses?refresh=' + Date.now())} />
        </CardContent>
      </Card>
    </Layout>
  );
}
