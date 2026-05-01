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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadIncome();
  }, [id]);

  async function loadIncome() {
    try {
      setLoading(true);

      const res = await fetch(`/api/incomes/${id}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch income");
      }

      setIncome(data.income || data);
    } catch (err) {
      console.error("Income detail error:", err);
      setIncome(null);
    } finally {
      setLoading(false);
    }
  }

  async function deleteIncome() {
    if (!confirm("Delete this income?")) return;

    const res = await fetch(`/api/incomes/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      router.push("/incomes");
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10">Loading income...</div>
      </Layout>
    );
  }

  if (!income) {
    return (
      <Layout>
        <div className="text-center py-10">Income not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Income Details</h1>
            <p className="text-sm text-muted mt-1">
              View and manage this income record
            </p>
          </div>

          <Button variant="outline" onClick={() => router.push("/incomes")}>
            ← Back
          </Button>
        </div>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="bg-green-50 dark:bg-green-900/30 rounded-t-2xl">
            <CardTitle className="text-2xl">
              {income.source || "Other Income"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 p-6">
            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted">Amount</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(income.amount)}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted">Source</p>
              <p className="text-lg font-semibold">
                {income.source || "Other Income"}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted">Date</p>
              <p className="font-medium">
                {income.date
                  ? new Date(income.date).toLocaleDateString("en-IN")
                  : "No date"}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-sm text-muted">Income ID</p>
              <p className="font-mono text-sm break-all">{income.id}</p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={loadIncome}>
                🔄 Refresh
              </Button>

              <Button variant="destructive" onClick={deleteIncome}>
                Delete Income
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}