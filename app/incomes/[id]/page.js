"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value) || 0);
}

export default function IncomeDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [income, setIncome] = useState(null);

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function load() {
    try {
      const res = await fetch(`/api/incomes/${id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setIncome(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteIncome() {
    if (!confirm("Delete this income?")) return;

    const res = await fetch(`/api/incomes/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/incomes");
    }
  }

  if (!income) {
    return (
      <Layout>
        <p className="p-4">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">Income Details</h1>

      <Card>
        <CardHeader>
          <CardTitle>{income.source}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p><strong>Amount:</strong> {formatCurrency(income.amount)}</p>
          <p><strong>Date:</strong> {new Date(income.date).toLocaleDateString()}</p>
          <p><strong>ID:</strong> {income.id}</p>

          <div className="flex gap-2 mt-4">
            <Button onClick={() => router.push("/incomes")}>
              Back
            </Button>

            <Button
              variant="destructive"
              onClick={deleteIncome}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}