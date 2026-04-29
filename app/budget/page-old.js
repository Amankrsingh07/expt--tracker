"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BudgetListPage() {
  const [budgets, setBudgets] = useState([]);
  const userId = 1;

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch(`/api/budgets?userId=${userId}`);
    const data = await res.json();
    setBudgets(data.budgets || []);
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">

        {/* 🔝 Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Budgets
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your monthly spending limits
            </p>
          </div>

          <Link href="/budget/add-budget">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5">
              + Add Budget
            </Button>
          </Link>
        </div>

        {/* 📭 Empty State */}
        {budgets.length === 0 ? (
          <div className="border rounded-2xl p-10 text-center bg-white shadow-sm">
            <p className="text-gray-500 mb-4">
              No budgets created yet
            </p>

            <Link href="/budget/add-budget">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6">
                Create your first budget
              </Button>
            </Link>
          </div>
        ) : (

          /* 📊 Budget Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {budgets.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >

                {/* Category + Month */}
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg text-gray-800">
                    {b.category}
                  </p>

                  <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 font-medium">
                    {b.month}
                  </span>
                </div>

                {/* Amount */}
                <div className="mt-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Budget Amount
                  </p>

                  <p className="text-3xl font-bold text-indigo-600 mt-1">
                    ₹{b.amount}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t my-5"></div>

                {/* Action */}
                <div className="flex justify-end">
                  <Link href={`/budget/${b.id}`}>
                    <Button
                      variant="outline"
                      className="rounded-xl bg-white text-black 
             dark:bg-slate-800 dark:text-white 
             dark:border-slate-600 "
                    >
                      View Details →
                    </Button>
                  </Link>
                </div>

              </div>
            ))}

          </div>
        )}
      </div>
    </Layout>
  );
}
