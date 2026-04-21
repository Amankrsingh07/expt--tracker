'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
  }, [dark]);
  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-lg font-semibold">ExpensePro</Link>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/expenses" className="text-sm">Expenses</Link>
        <Link href="/add-expense" className="text-sm">Add</Link>
        <button onClick={() => setDark(d => !d)} className="ml-2 px-2 py-1 border rounded">Toggle</button>
      </div>
    </nav>
  );
}
