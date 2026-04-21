'use client';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f7f', '#0088FE', '#00C49F'];

export default function DashboardCharts({ expenses: propsExpenses }) {
  const [byCategory, setByCategory] = useState([]);
  const [byMonth, setByMonth] = useState([]);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    const loadFrom = async (expenses) => {
      const catMap = {};
      const monthMap = {};
      const trendMap = {};
      expenses.forEach(e => {
        const cat = e.category?.name || 'Other';
        catMap[cat] = (catMap[cat] || 0) + e.amount;
        const mon = new Date(e.date).toISOString().slice(0,7);
        monthMap[mon] = (monthMap[mon] || 0) + e.amount;
        const day = new Date(e.date).toISOString().slice(0,10);
        trendMap[day] = (trendMap[day] || 0) + e.amount;
      });

      setByCategory(Object.entries(catMap).map(([name, value]) => ({ name, value })));
      setByMonth(Object.entries(monthMap).map(([name, value]) => ({ name, value })));
      setTrend(Object.entries(trendMap).map(([date, value]) => ({ date, value })));
    };

    if (propsExpenses && Array.isArray(propsExpenses)) {
      loadFrom(propsExpenses);
    } else {
      // fallback: fetch current month
      (async () => {
        const res = await fetch('/api/expenses?month=' + new Date().toISOString().slice(0,7), { credentials: 'include' });
        const json = await res.json();
        const expenses = json.expenses || [];
        loadFrom(expenses);
      })();
    }
  }, [propsExpenses]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <CardHeader>
          <CardTitle className="text-base">By Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {byCategory.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardHeader>
          <CardTitle className="text-base">Monthly</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="p-4">
        <CardHeader>
          <CardTitle className="text-base">Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
