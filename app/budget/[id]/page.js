"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

export default function BudgetDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [budget, setBudget] = useState(null);

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function load() {
    const res = await fetch(`/api/budgets/${id}`);
    const data = await res.json();
    setBudget(data);
  }

  async function deleteBudget() {
    if (!confirm("Delete this budget?")) return;

    const res = await fetch(`/api/budgets/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push("/budget");
    }
  }

  if (!budget) {
    return (
      <Layout>
        <p className="p-4">Loading...</p>
      </Layout>
    );
  }

return (
  <Layout>
    <div className="max-w-2xl mx-auto space-y-8">

      {/* 🔝 Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budget Details</h1>
          <p className="text-sm text-muted">
            Track and manage your category budget
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push("/budget")}
        >
          ← Back
        </Button>
      </div>

      {/* 🧾 Card */}
      <div className="card space-y-6">

        {/* Category */}
        <div>
          <p className="text-sm text-muted">Category</p>
          <p className="text-lg font-semibold">{budget.category}</p>
        </div>

        {/* Amount */}
        <div>
          <p className="text-sm text-muted">Budget Amount</p>
          <p className="text-3xl font-bold text-indigo-600">
            ₹{budget.amount}
          </p>
        </div>

        {/* Month */}
        <div>
          <p className="text-sm text-muted">Month</p>
          <p className="font-medium">{budget.month}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">

          <Button
            variant="outline"
            onClick={() => router.push("/budget")}
          >
            Back
          </Button>

          <Button
            variant="destructive"
            onClick={deleteBudget}
          >
            Delete Budget
          </Button>

        </div>
      </div>

    </div>
  </Layout>
);
}