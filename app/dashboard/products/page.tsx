"use client";

import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [globalStats, setGlobalStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const [productsRes, countRes, statsRes] = await Promise.all([
          fetch(`/api/products/top-selling?limit=${limit}`),
          fetch(`/api/products/count`),
          fetch(`/api/products/stats`),
        ]);
        const productsData = await productsRes.json();
        const countData = await countRes.json();
        const statsData = await statsRes.json();
        
        setTopProducts(productsData.data || []);
        setTotalProducts(countData.data?.total || 0);
        setGlobalStats(statsData.data || {});
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalRevenue = topProducts.reduce((sum, p) => sum + (p.totalRevenue || 0), 0);
  const totalQuantity = topProducts.reduce((sum, p) => sum + (p.totalQuantity || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Produtos</h1>
              <p className="text-sm text-slate-600">
                Análise de performance dos produtos
              </p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
              </select>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Exportar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="space-y-6 mb-8">
          {/* Linha 1 - Métricas Globais */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-slate-600 mb-1">
                Total de Produtos
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {totalProducts.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Cadastrados no sistema
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-slate-600 mb-1">
                Receita Total (Todos)
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(globalStats.totalRevenue || 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Todos os produtos vendidos
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-slate-600 mb-1">
                Quantidade Total
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {(globalStats.totalQuantity || 0).toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Unidades vendidas (total)
              </p>
            </div>
          </div>

          {/* Linha 2 - Métricas do Top N */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-emerald-900 mb-1">
                Receita (Top {limit})
              </p>
              <p className="text-2xl font-bold text-emerald-700">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Exibindo top {topProducts.length} produtos mais vendidos
              </p>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-sky-100 p-6 rounded-lg shadow-sm">
              <p className="text-sm font-medium text-sky-900 mb-1">
                Quantidade (Top {limit})
              </p>
              <p className="text-2xl font-bold text-sky-700">
                {totalQuantity.toLocaleString("pt-BR")}
              </p>
              <p className="text-xs text-sky-600 mt-1">
                Unidades dos produtos listados
              </p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Top {limit} Produtos Mais Vendidos
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-center text-slate-500 py-12">
              Nenhum produto encontrado
            </p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((item, index) => {
                const avgPrice = item.totalRevenue && item.totalQuantity 
                  ? item.totalRevenue / item.totalQuantity 
                  : 0;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg shadow-md">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {item.product?.name || "Produto"}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-slate-600">
                            {item.product?.category?.name || "Sem categoria"}
                          </span>
                          <span className="text-sm text-slate-500">
                            • Preço médio: {formatCurrency(avgPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8 text-right">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Quantidade</p>
                        <p className="text-lg font-bold text-slate-900">
                          {item.totalQuantity?.toLocaleString("pt-BR") || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Receita</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(item.totalRevenue || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Pedidos</p>
                        <p className="text-lg font-bold text-blue-600">
                          {item.salesCount?.toLocaleString("pt-BR") || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Insights Section */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 Insight: Produto mais popular
            </h3>
            <p className="text-blue-800">
              {topProducts[0]?.product?.name || "N/A"} lidera com{" "}
              {topProducts[0]?.totalQuantity?.toLocaleString("pt-BR") || 0} unidades vendidas.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              💰 Insight: Maior receita
            </h3>
            <p className="text-green-800">
              {topProducts[0]?.product?.name || "N/A"} gerou{" "}
              {formatCurrency(topProducts[0]?.totalRevenue || 0)} em receita total.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
