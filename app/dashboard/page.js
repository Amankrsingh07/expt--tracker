"use client";

import Layout from "@/components/Layout";
import DashboardCharts from "@/components/DashboardCharts";
import FinancialDashboard from "@/components/FinancialDashboard";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
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
  // if (loading) {
  //   return (
  //     <Layout>
  //       <div className="text-center py-10 text-gray-500">
  //         Loading dashboard...
  //       </div>
  //     </Layout>
  //   );
  // }

 return (
  <Layout>
    <div className="space-y-8">

      {/* 🔝 Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {summary?.user?.name} 👋
          </h1>
          <p className="text-sm text-muted">
            Here’s your financial overview for this month
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-surface border rounded-xl p-1">
          <button
            onClick={() => setShowAdvanced(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              !showAdvanced
                ? 'bg-indigo-600 text-white shadow'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Simple
          </button>

          <button
            onClick={() => setShowAdvanced(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              showAdvanced
                ? 'bg-indigo-600 text-white shadow'
                : 'text-muted hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>

      {/* 💰 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <div className="card">
          <p className="text-sm text-muted">This Month Spent</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            ₹{summary?.total?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-muted">Monthly Limit</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            ₹{summary?.limit?.toFixed(2) || "0.00"}
          </p>
        </div>

        <div className="card">
          <p className="text-sm text-muted">Remaining Budget</p>
          <p className={`text-2xl font-bold mt-2 ${
            summary?.remaining < 0 ? 'text-red-500' : 'text-indigo-600'
          }`}>
            ₹{summary?.remaining?.toFixed(2) || "0.00"}
          </p>
        </div>

      </div>

      {/* 📊 Content */}
      <div className="card">

        {!showAdvanced ? (
          <>
            <h2 className="text-lg font-semibold mb-4">
              Expense Overview
            </h2>
            <DashboardCharts expenses={expenses} />
          </>
        ) : (
          <FinancialDashboard />
        )}

      </div>

    </div>
  </Layout>
);
}