"use client";

import Layout from '@/components/Layout';
import AddIncome from '@/components/AddIncome';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AddIncomePage() {
  const router = useRouter();

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Add Income</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add a new income</CardTitle>
        </CardHeader>
        <CardContent>
          <AddIncome onSuccess={() => router.push('/incomes?refresh=' + Date.now())} />
        </CardContent>
      </Card>
    </Layout>
  );
}
