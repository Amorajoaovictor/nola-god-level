"use client";

import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6">
          <a href="/" className="flex items-center gap-2 mb-8">
            <span className="text-2xl">📊</span>
            <span className="text-xl font-bold text-slate-900">Nola Analytics</span>
          </a>

          <nav className="space-y-2">
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <span>🏠</span>
              <span className="font-medium">Dashboard</span>
            </a>

            <a
              href="/dashboard/sales"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <span>📊</span>
              <span className="font-medium">Vendas</span>
            </a>

            <a
              href="/dashboard/products"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <span>🍔</span>
              <span className="font-medium">Produtos</span>
            </a>

            <a
              href="/dashboard/stores"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <span>🏪</span>
              <span className="font-medium">Lojas</span>
            </a>

            <a
              href="/dashboard/customers"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <span>👥</span>
              <span className="font-medium">Clientes</span>
            </a>

            <div className="pt-4 mt-4 border-t border-slate-200">
              <a
                href="/docs"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <span>📚</span>
                <span className="font-medium">Documentação</span>
              </a>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="ml-64">
        {children}
      </div>
    </div>
  );
}
