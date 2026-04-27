"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AddBudgetPage() {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = 1; // replace with auth later

  const categories = [
    "Food",
    "Grocery",
    "Medical",
    "Travel",
    "Shopping",
    "Others"
  ];

  async function handleSubmit(e) {
    e.preventDefault();

    if (!category || !amount) {
      alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          category,
          amount: Number(amount),
          userId
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert("Budget saved!");
      setCategory("");
      setAmount("");

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
  <Layout>
    <div className="max-w-xl mx-auto space-y-8">

      {/* 🔝 Header */}
      <div>
        <h1 className="text-2xl font-bold">Set Budget</h1>
        <p className="text-sm text-muted">
          Define spending limits for each category
        </p>
      </div>

      {/* 🧾 Card */}
      <Card className="card">
        <CardHeader>
          <CardTitle>Add / Update Budget</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* 📂 Category */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Category</label>
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 💰 Amount */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Budget Amount</label>
              <input
                type="number"
                placeholder="₹ 0.00"
                className="input text-lg font-semibold"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* 🚀 Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary"
            >
              {loading ? "Saving..." : "Save Budget"}
            </button>

          </form>
        </CardContent>
      </Card>

    </div>
  </Layout>
);
}