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

export default function ExpenseDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadExpense();
  }, [id]);

  async function loadExpense() {
    try {
      setLoading(true);

      const res = await fetch(`/api/expenses/${id}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch expense");
      }

      setExpense(data.expense);
    } catch (err) {
      console.error("Expense detail error:", err);
      setExpense(null);
    } finally {
      setLoading(false);
    }
  }

  async function deleteExpense() {
    if (!confirm("Delete this expense?")) return;

    const res = await fetch(`/api/expenses/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      router.push("/expenses");
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10">Loading expense...</div>
      </Layout>
    );
  }

  if (!expense) {
    return (
      <Layout>
        <div className="text-center py-10">Expense not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Expense Details</h1>

        <Card>
          <CardHeader>
            <CardTitle>
              {expense.category?.name || "No Category"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p>
              <strong>Amount:</strong> {formatCurrency(expense.amount)}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {expense.category?.name || "No Category"}
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {expense.description || "No description"}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {expense.date
                ? new Date(expense.date).toLocaleDateString("en-IN")
                : "No date"}
            </p>

            <p>
              <strong>ID:</strong> {expense.id}
            </p>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => router.push("/expenses")}>
                Back
              </Button>

              <Button variant="outline" onClick={loadExpense}>
                Refresh
              </Button>

              <Button variant="destructive" onClick={deleteExpense}>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}