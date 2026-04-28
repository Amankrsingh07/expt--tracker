"use client";

import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(value) || 0);
}

export default function IncomesPage() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);

      const res = await fetch("/api/incomes", {
        credentials: "include",
      });

      const data = await res.json();

      setIncomes(Array.isArray(data) ? data : data.incomes || data.data || []);
    } catch (err) {
      console.error("Income fetch error:", err);
      setIncomes([]);
    } finally {
      setLoading(false);
    }
  }

  async function deleteIncome(id) {
    if (!confirm("Delete this income?")) return;

    const res = await fetch(`/api/incomes/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) load();
  }

  const totalIncome = useMemo(() => {
    return incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  }, [incomes]);

  const highestIncome = useMemo(() => {
    if (incomes.length === 0) return 0;
    return Math.max(...incomes.map((i) => Number(i.amount || 0)));
  }, [incomes]);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-500 text-white p-8 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <h1 className="text-3xl font-bold">💰 Income Dashboard</h1>
              <p className="text-white/90 mt-2">
                Track your income sources and monthly earnings
              </p>
            </div>

            <Link href="/add-income">
              <Button className="bg-white text-green-700 hover:bg-gray-100 font-semibold">
                + Add Income
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <SummaryCard
            title="Total Income"
            value={formatCurrency(totalIncome)}
            icon="💵"
            color="green"
          />

          <SummaryCard
            title="Income Sources"
            value={incomes.length}
            icon="📌"
            color="blue"
          />

          <SummaryCard
            title="Highest Income"
            value={formatCurrency(highestIncome)}
            icon="🚀"
            color="purple"
          />
        </div>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Your Incomes</CardTitle>
              <p className="text-sm text-muted mt-1">
                All your added income records
              </p>
            </div>

            <Button variant="outline" onClick={load}>
              🔄 Refresh
            </Button>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Loading incomes...
              </div>
            ) : incomes.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-dashed">
                <div className="text-5xl mb-3">📭</div>
                <h3 className="text-xl font-bold">No incomes yet</h3>
                <p className="text-gray-500 mt-2">
                  Add your salary, freelance income, or other sources.
                </p>

                <Link href="/add-income">
                  <Button className="mt-5 bg-green-600 hover:bg-green-700 text-white">
                    Add First Income
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {incomes.map((income) => (
                  <div
                    key={income.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl border bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-green-100 dark:bg-green-900 flex items-center justify-center text-2xl">
                        💸
                      </div>

                      <div>
                        <h3 className="text-lg font-bold">
                          {income.source || "Other Income"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {income.date
                            ? new Date(income.date).toLocaleDateString("en-IN")
                            : "No date"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(income.amount)}
                      </p>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteIncome(income.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

function SummaryCard({ title, value, icon, color }) {
  const colors = {
    green: "bg-green-50 text-green-700 border-green-400 dark:bg-green-900 dark:text-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-400 dark:bg-blue-900 dark:text-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-400 dark:bg-purple-900 dark:text-purple-200",
  };

  return (
    <div className={`rounded-2xl border-l-4 p-5 shadow ${colors[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>

        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}