import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-gray-200 dark:border-gray-800 py-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">© {year} Expense Tracker. All rights reserved.</div>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">Dashboard</Link>
          <Link href="/expenses" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">Expenses</Link>
          <Link href="/add-expense" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">Add Expense</Link>
          <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
