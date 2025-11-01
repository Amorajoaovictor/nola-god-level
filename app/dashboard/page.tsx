"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, productsRes] = await Promise.all([
          fetch("/api/sales/summary"),
          fetch("/api/products/top-selling?limit=5"),
        ]);

        const summaryData = await summaryRes.json();
        const productsData = await productsRes.json();

        setSummary(summaryData.data);
        setTopProducts(productsData.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-600">Overview das métricas principais</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                Filtrar Período
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Exportar Relatório
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">

        {/* KPI Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Faturamento Total</p>
              <span className="text-green-600">📈</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {summary?.totalRevenue ? formatCurrency(summary.totalRevenue) : "-"}
            </p>
            <p className="text-xs text-slate-500 mt-2">Total acumulado</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Total de Vendas</p>
              <span className="text-blue-600">🛒</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {summary?.totalSales?.toLocaleString("pt-BR") || "-"}
            </p>
            <p className="text-xs text-slate-500 mt-2">Pedidos realizados</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Ticket Médio</p>
              <span className="text-purple-600">💰</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {summary?.averageTicket ? formatCurrency(summary.averageTicket) : "-"}
            </p>
            <p className="text-xs text-slate-500 mt-2">Por pedido</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Produtos Ativos</p>
              <span className="text-orange-600">📦</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {topProducts.length > 0 ? "500+" : "-"}
            </p>
            <p className="text-xs text-slate-500 mt-2">No catálogo</p>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Top 5 Produtos Mais Vendidos
          </h3>
          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.product?.name || "Produto"}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.product?.category?.name || "Sem categoria"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {item.totalQuantity?.toLocaleString("pt-BR") || 0} vendas
                    </p>
                    <p className="text-sm text-slate-600">
                      {item.totalRevenue ? formatCurrency(item.totalRevenue) : "-"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">Nenhum dado disponível</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <a
            href="/dashboard/sales"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-2">📊 Análise de Vendas</h3>
            <p className="text-slate-600">
              Explore vendas por período, canal e loja com filtros avançados
            </p>
          </a>

          <a
            href="/dashboard/products"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-2">🍔 Produtos</h3>
            <p className="text-slate-600">
              Analise performance de produtos e categorias
            </p>
          </a>

          <a
            href="/dashboard/stores"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-2">🏪 Lojas</h3>
            <p className="text-slate-600">
              Compare performance entre lojas e canais de venda
            </p>
          </a>
        </div>
      </main>
    </div>
  );
}
