'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Sun, LogOut } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      setDark(true);
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      setDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDark(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  async function logout() {
    try {
      localStorage.removeItem('token');

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      router.push('/login');
    } catch (err) {
      router.push('/login');
    }
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-gray-200 dark:border-gray-800">
      
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        
        {/* 🔷 Logo */}
        <Link
          href="/dashboard"
          className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent"
        >
          ExpensePro
        </Link>

        {/* 🔗 Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/summary" label="Summary" />
          <NavLink href="/budget" label="Budget" />
          <NavLink href="/expenses" label="Expenses" />
          <NavLink href="/incomes" label="Income" />
        </div>

        {/* ⚙️ Actions */}
        <div className="flex items-center gap-3">

          {/* ➕ CTA Button */}
          <Link
            href="/add-income"
            className="hidden md:inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:scale-105 hover:shadow-lg transition"
          >
            + Add Income
          </Link>

          {/* 🌙 Theme Toggle */}
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* 🚪 Logout */}
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition"
          >
            <LogOut size={18} />
          </button>

        </div>
      </div>
    </nav>
  );
}

/* 🔹 Reusable Nav Link */
function NavLink({ href, label }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
    >
      {label}
    </Link>
  );
}