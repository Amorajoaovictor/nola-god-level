"use client";

import { ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-slate-900"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isSidebarOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40 transition-transform duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
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
              href="/dashboard/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <span>📦</span>
              <span className="font-medium">Pedidos</span>
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
                href="/dashboard/presentations"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <span>🎬</span>
                <span className="font-medium">Apresentações</span>
              </a>
              
              <a
                href="/dashboard/presentation"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <span>✨</span>
                <span className="font-medium">Editor Avançado</span>
              </a>
              
              <a
                href="/api-docs"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <span>📚</span>
                <span className="font-medium">API Docs</span>
              </a>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                <span>🚪</span>
                <span className="font-medium">
                  {isLoggingOut ? "Saindo..." : "Sair"}
                </span>
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:ml-64">
        {children}
      </div>
    </div>
  );
}
