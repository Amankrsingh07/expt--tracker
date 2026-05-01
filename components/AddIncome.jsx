"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function AddIncome({ onSuccess }) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !source || !date) {
      toast.push({
        title: "Validation",
        message: "Please fill all fields",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/incomes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          amount: Number(amount),
          source,
          date,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      setAmount("");
      setSource("");
      setDate(new Date().toISOString().slice(0, 10));

      toast.push({
        title: "Success",
        message: "Income added successfully",
        type: "info",
      });

      onSuccess?.();
    } catch (err) {
      toast.push({
        title: "Error",
        message: err.message || "Failed to add income",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Add Income</h2>
          <p className="text-sm text-muted">Record money you’ve received</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div className="space-y-1">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="w-full btn btn-primary">
            {loading ? "Adding..." : "Add Income"}
          </button>
        </form>
      </div>
    </div>
  );
}