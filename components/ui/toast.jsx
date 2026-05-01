"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, ...toast }]);
    // auto dismiss
    if (toast.duration !== 0) {
      setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), toast.duration || 4000);
    }
  }, []);

  const remove = useCallback((id) => setToasts((t) => t.filter(x => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`max-w-sm w-full p-3 rounded-lg shadow-lg ${t.type === 'error' ? 'bg-red-600 text-white' : 'bg-white text-black dark:bg-slate-800 dark:text-white'}`}>
            <div className="font-semibold">{t.title}</div>
            {t.message && <div className="text-sm mt-1">{t.message}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastProvider;
