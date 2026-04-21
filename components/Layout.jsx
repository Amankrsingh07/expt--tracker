'use client';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="p-4 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
