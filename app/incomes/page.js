"use client";

import { useEffect, useState } from "react";
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(Number(value) || 0);
}

export default function IncomesPage() {
  const [incomes, setIncomes] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch('/api/incomes');
    const data = await res.json();
    console.log(data);
    setIncomes(data);
  }

  async function deleteIncome(id) {
    if (!confirm("Delete this income?")) return;

    const res = await fetch(`/api/incomes/${id}`, {
      method: "DELETE"
    });

    if (res.ok) load();
  }

  return (
    <Layout>
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-semibold">Incomes</h1>
        <Link href="/add-income">
          <Button>+ Add Income</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your incomes</CardTitle>
        </CardHeader>
        <CardContent>
          {incomes.length === 0 ? (
            <p className="text-gray-500">No incomes yet.</p>
          ) : (
            <div className="grid gap-4">
              {incomes.map(i => (
                <Card key={i.id}>
                  <CardContent className="p-4">
                    <p><strong>Source:</strong> {i.source}</p>
                    <p><strong>Amount:</strong> {formatCurrency(i.amount)}</p>
                    <p><strong>Date:</strong> {new Date(i.date).toLocaleDateString()}</p>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteIncome(i.id)}
                      className="mt-2"
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}