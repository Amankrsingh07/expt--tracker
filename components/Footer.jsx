'use client';

import Link from 'next/link';
//import { GitHub, Twitter, Linkedin } from 'lucide-react';
//import { Github, Twitter, LinkedinIcon } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
      
      <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">
        
        {/* 🔷 Brand */}
        <div>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            ExpensePro
          </h2>
          <p className="text-sm text-muted mt-2">
            Smart way to track your income, expenses and financial growth.
          </p>
        </div>

        {/* 🔗 Navigation */}
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[var(--foreground)] mb-2">Quick Links</span>
          <Link href="/dashboard" className="text-muted hover:text-indigo-600 transition">Dashboard</Link>
          <Link href="/expenses" className="text-muted hover:text-indigo-600 transition">Expenses</Link>
          <Link href="/add-expense" className="text-muted hover:text-indigo-600 transition">Add Expense</Link>
        </div>

        {/* 🌐 Social */}
        <div className="flex flex-col gap-2 text-sm">
          <span className="font-medium text-[var(--foreground)] mb-2">Connect</span>

          <div className="flex items-center gap-4">
            <a href="https://github.com/" target="_blank" rel="noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {/* //<GitHub size={18} /> */}
              <FaGithub />

            </a>

            <a href="#" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {/* //<Twitter size={18} /> */}
              <FaTwitter />

            </a>

            <a href="#" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {/* <Linkedin size={18} /> */}
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>

      {/* 📄 Bottom bar */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-muted">
          <span>© {year} ExpensePro. All rights reserved.</span>
          <span className="opacity-70">Built with ❤️ using Next.js</span>
        </div>
      </div>

    </footer>
  );
}