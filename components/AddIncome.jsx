"use client";

import { useState } from "react";
import { Input } from '@/components/ui/input';

export default function AddIncome({ onSuccess }) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = 1; // replace later with real auth

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !source) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/incomes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          source,
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      setAmount("");
      setSource("");
      onSuccess?.();

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">

      <div className="card space-y-6">

        {/* 🔝 Title */}
        <div>
          <h2 className="text-xl font-semibold">Add Income</h2>
          <p className="text-sm text-muted">
            Record money you’ve received
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 💰 Amount */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              placeholder="₹ 0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* 🏷 Source */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Source</label>
            <Input
              type="text"
              placeholder="Salary, Freelance, etc."
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            />
          </div>

          {/* 🚀 Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary"
          >
            {loading ? "Adding..." : "Add Income"}
          </button>

        </form>

      </div>

    </div>
  );
}