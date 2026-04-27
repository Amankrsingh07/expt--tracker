'use client';

import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      
      {/* 🔝 Navbar */}
      <Navbar />

      {/* 🌐 Page Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ✨ Page Container */}
        <div className="space-y-6 animate-fade-in">
          {children}
        </div>

      </main>

    </div>
  );
}