'use client';

import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div
      className="
        min-h-screen
        bg-gray-50 text-black
        dark:bg-slate-950 dark:text-white
        transition-colors duration-300
      "
    >
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}