"use client";

import Layout from "@/components/Layout";
import DashboardCharts from "@/components/DashboardCharts";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const pollingRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function fetchAll() {
      try {
        setLoading(true);

        // check auth (cookie-based)
        const userRes = await fetch('/api/auth/me', { credentials: 'include' });
        if (!userRes.ok) {
          router.push('/login');
          return;
        }
        const userData = await userRes.json();

        // fetch current month expenses
        const month = new Date().toISOString().slice(0,7);
        const res = await fetch(`/api/expenses?month=${month}`, { credentials: 'include' });
        const json = await res.json();
        const fetchedExpenses = json.expenses || [];

        // fetch limit
        const limitRes = await fetch('/api/limit', { credentials: 'include' });
        let limit = 0;
        if (limitRes.ok) {
          const limitData = await limitRes.json();
          limit = limitData?.monthlyLimit || 0;
        }

        const total = fetchedExpenses.reduce((sum, e) => sum + e.amount, 0);
        const remaining = limit - total;

        if (!mounted) return;
        setSummary({ total, limit, remaining, user: userData.user });
        setExpenses(fetchedExpenses);
      } catch (err) {
        console.error('Dashboard Error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // initial fetch
    fetchAll();

    // polling: refresh every 10s
    pollingRef.current = setInterval(() => fetchAll(), 10000);

    // refresh on window focus / visibilitychange
    const onFocus = () => fetchAll();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') fetchAll();
    });

    return () => {
      mounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
      window.removeEventListener('focus', onFocus);
    };
  }, [router]);

  // ✅ Loading UI
  if (loading) {
    return (
      <Layout>
        <div className="text-center py-10 text-gray-500">
          Loading dashboard...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-4">
        Welcome, {summary?.user?.name} 👋
      </h1>

  <div className="grid gap-4">
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Total */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
            <h3 className="text-sm text-gray-500 mb-2">This Month</h3>
            <div className="text-3xl font-bold text-blue-600">
              ₹{summary?.total?.toFixed(2) || "0.00"}
            </div>
          </div>

          {/* Limit */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
            <h3 className="text-sm text-gray-500 mb-2">Limit</h3>
            <div className="text-3xl font-bold text-green-600">
              {/* ₹{summary.limit?.toFixed(2) || "0.00"} */}
              ₹{summary?.limit?.toFixed(2) || "0.00"}

            </div>
          </div>

          {/* Remaining */}
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
            <h3 className="text-sm text-gray-500 mb-2">Remaining</h3>
            <div
  className={`text-3xl font-bold ${
    summary?.remaining < 0
      ? "text-red-600"
      : "text-purple-600"
  }`}
>
             
              ₹{summary?.remaining?.toFixed(2) || "0.00"}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
          <DashboardCharts expenses={expenses} />
        </div>
      </div>
    </Layout>
  );
}